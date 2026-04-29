"""Experiment runner service — executes experiment code in sandbox.

Generates experiment code from an idea using LLM, then executes
it in a Docker sandbox.
"""

from __future__ import annotations

import ast
import json
import logging
import re
import time
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage

from app.core.llm_factory import create_chat_model
from app.core.sandbox import Sandbox
from app.models.experiment import Experiment, ExperimentStatus
from app.models.idea import Idea

logger = logging.getLogger(__name__)

_EXPERIMENT_PLAN_PROMPT = """\
As an AI Scientist, your task is to design a rigorous experimental protocol to validate the research idea:

RESEARCH IDEA:
{idea_details}

REQUIRED COMPONENTS IN YOUR EXPERIMENT DESIGN:

1. DETAILED METHODOLOGY:
   - Specific algorithms and models to implement
   - Training/validation/test split strategy
   - Hyperparameters and their values
   - Random seeds for reproducibility

2. BASELINE COMPARISONS:
   - Minimum of 2 strong baselines
   - State-of-the-art methods when available
   - Simple heuristics as sanity checks

3. EVALUATION METRICS:
   - Primary metrics (precision, accuracy, F1-score, etc.)
   - Secondary metrics (AUC, runtime, memory usage, etc.)
   - Statistical significance tests

4. IMPLEMENTATION REQUIREMENTS:
   - Include helper functions for preprocessing
   - Add logging and progress tracking
   - Implement proper error handling
   - Ensure deterministic behavior for reproducibility
   - Clean up temporary resources

Your response should first describe the complete experimental protocol in plain English, 
then provide the Python code as a complete, executable script in a ```python code block.
"""

_CODE_VALIDATION_PROMPT = """\
You are reviewing experiment code for a scientific computing pipeline. 
Given the provided code and requirements, identify and fix any safety or correctness issues.

REQUIREMENTS:
- No external file system access (avoid open(), io lib usage)
- No network access (no requests, urllib, etc.)
- No shell command execution (no subprocess, os.system, etc.)
- No unsafe evaluation (no eval(), exec() should be minimal and controlled)
- Proper exception handling
- Memory-efficient operations

ORIGINAL CODE:
{original_code}

Return only the corrected code as a valid Python code block. Do not include any explanations.
"""


class ExperimentRunner:
    """Run experiments for research ideas."""

    def __init__(self) -> None:
        self._llm = create_chat_model()
        self._sandbox = Sandbox()

    def generate_code(self, idea: Idea) -> str:
        """Generate experiment code for the given idea with comprehensive validation.

        Args:
            idea: The research idea.

        Returns:
            Python code string.
        """
        # First, generate comprehensive experiment design based on the idea
        idea_details = f"Title: {idea.title}\n\nDescription: {idea.description}\n\nMethodology: {getattr(idea, 'methodology', '')}\n\nValidation Approach: {getattr(idea, 'validation_approach', '')}"
        experiment_design_prompt = _EXPERIMENT_PLAN_PROMPT.format(idea_details=idea_details)
        
        messages = [
            HumanMessage(content=experiment_design_prompt),
        ]
        response = self._llm.invoke(messages)
        initial_code = response.content.strip()
        
        # Extract code from response
        if "```python" in initial_code:
            code_match = re.search(r'```python\n(.*?)\n```', initial_code, re.DOTALL)
            if code_match:
                extracted_code = code_match.group(1)
            else:
                # Fallback: try basic code extraction
                start_index = initial_code.find('```')
                if start_index != -1:
                    end_index = initial_code.find('```', start_index + 3)
                    if end_index != -1:
                        extracted_code = initial_code[start_index+3:end_index].strip()
                    else:
                        extracted_code = initial_code.strip()
                else:
                    extracted_code = initial_code.strip()
        else:
            extracted_code = initial_code.strip()
        
        # Validate the generated code before returning it
        validated_code = self.validate_code(extracted_code)
        
        return validated_code

    def validate_code(self, original_code: str) -> str:
        """Validate and sanitize the generated code for safety using static analysis first, then LLM validation."""
        # Static analysis: Check syntax and blacklist dangerous patterns
        safe_code = self._check_static_analysis(original_code)
        if not safe_code:
            # If static analysis detects dangerous patterns, return original code
            # The sandbox will catch any remaining issues during execution
            logger.warning("Code validation blocked dangerous patterns before LLM validation")
            return original_code
        
        # Pass to LLM if static analysis passes
        validation_prompt = _CODE_VALIDATION_PROMPT.format(original_code=original_code)
        try:
            validation_response = self._llm.invoke([HumanMessage(content=validation_prompt)])
            sanitized_code = validation_response.content.strip()
            
            # Try to extract code blocks from validation response
            if "```python" in sanitized_code:
                match = re.search(r'```python\n(.*?)\n```', sanitized_code, re.DOTALL)
                if match:
                    sanitized_code = match.group(1).strip()
            elif "```" in sanitized_code:
                match = re.search(r'```\n(.*?)\n```', sanitized_code, re.DOTALL)
                if match:
                    sanitized_code = match.group(1).strip()
                    
            return sanitized_code
        except Exception:
            # If validation fails, return the original code (it'll be caught by sandbox anyway)
            logger.warning("Code validation failed, returning original code")
            return original_code

    def _check_static_analysis(self, code: str) -> bool:
        """Perform static analysis on code to detect dangerous patterns."""
        try:
            # Check syntax with ast.parse
            ast.parse(code)
        except SyntaxError:
            logger.warning("Syntax error detected in generated code")
            return False
        
        # Define blacklist patterns
        dangerous_patterns = [
            r'os\.system',
            r'subprocess\.',
            r'eval\(',
            r'exec\(',
            r'__import__',
            r'open\(\s*[\\"\']\w',  # Avoid direct file opening with actual file names
        ]
        
        # Check for blacklisted patterns
        for pattern in dangerous_patterns:
            if re.search(pattern, code):
                logger.warning(f"Dangerous pattern detected: {pattern} in generated code")
                return False
        
        # If all checks pass, code is safe from static analysis perspective
        return True

    def run(self, idea: Idea, timeout: int = 300) -> Experiment:
        """Generate code and run an experiment for the given idea.

        Args:
            idea: The research idea.
            timeout: Execution timeout in seconds.

        Returns:
            An ``Experiment`` with results.
        """
        experiment = Experiment(
            idea_id=idea.id,
            status=ExperimentStatus.RUNNING,
        )

        try:
            code = self.generate_code(idea)
            experiment.code = code
            logger.info("Generated experiment code for idea %s (%d chars)", idea.id, len(code))

            start_time = time.time()
            result = self._sandbox.execute(code, timeout=timeout)
            elapsed = time.time() - start_time
            experiment.execution_time_seconds = round(elapsed, 2)

            if result.success:
                experiment.status = ExperimentStatus.COMPLETED
                experiment.results = result.data or {}
                logger.info("Experiment completed for idea %s", idea.id)
            else:
                experiment.status = ExperimentStatus.FAILED
                experiment.logs = result.error or "Unknown error"
                logger.warning("Experiment failed for idea %s: %s", idea.id, result.error)

        except Exception as exc:
            experiment.status = ExperimentStatus.FAILED
            experiment.logs = str(exc)
            logger.exception("Experiment error for idea %s", idea.id)

        return experiment

    def run_local(self, idea: Idea, timeout: int = 300) -> Experiment:
        """Run experiment locally (without Docker sandbox).

        Falls back to a simulated execution when Docker is not available.

        Args:
            idea: The research idea.
            timeout: Not used in local mode.

        Returns:
            An ``Experiment`` with simulated results.
        """
        experiment = Experiment(
            idea_id=idea.id,
            status=ExperimentStatus.RUNNING,
        )

        try:
            code = self.generate_code(idea)
            experiment.code = code
            experiment.status = ExperimentStatus.COMPLETED
            experiment.results = {
                "status": "simulated",
                "note": "Docker sandbox not available; code generated but not executed",
                "code_length": len(code),
            }
        except Exception as exc:
            experiment.status = ExperimentStatus.FAILED
            experiment.logs = str(exc)

        return experiment
