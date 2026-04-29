"""AI Scientist Pipeline — Complete 4-phase research workflow using LangGraph.

Implements the complete AI Scientist workflow as an orchestrator that handles:
1. Idea Generation
2. Experimental Iteration 
3. Paper Write-up
4. Automated Peer Review
"""

from __future__ import annotations

import logging
from typing import Dict, List, Literal, TypedDict


from langgraph.graph import END, START, StateGraph
from langgraph.types import Command

from app.services.idea_generator import IdeaGenerator
from app.services.experiment_runner import ExperimentRunner
from app.services.paper_writer import PaperWriter
from app.services.reviewer import Reviewer
from app.models.idea import Idea, IdeaGenerationRequest
from app.models.experiment import Experiment
from app.models.paper import Paper
from app.models.review import Review

logger = logging.getLogger(__name__)


# Define the state structure for our AI Scientist
class AI_Scientist_State(TypedDict):
    """
    Composite state for the AI Scientist workflow.
    
    Contains all artifacts from each stage for potential reuse/refinement.
    """
    # Input/Configuration
    research_area: str
    iteration_count: int
    max_attempts: int  # Maximum attempts before giving up on idea
    
    # Phase 1 outputs
    ideas: List[Idea]
    selected_idea: Idea | None
    
    # Phase 2 outputs
    experiment_results: List[Experiment]
    current_experiment: Experiment | None
    
    # Phase 3 outputs
    drafts: List[Paper]
    current_paper: Paper | None
    
    # Phase 4 outputs
    reviews: List[Review]
    current_review: Review | None
    
    # Loop control
    should_iterate: bool
    status: str  # Current phase or status
    error_history: List[str]


class AIScientistPipeline:
    """
    Orchestrate the complete AI Scientist workflow using LangGraph.
    
    The pipeline alternates between:
    1. Idea generation and selection
    2. Experiment execution and refinement
    3. Paper writing
    4. Review and iteration/rejection
    """
    
    def __init__(self):
        self.idea_generator = IdeaGenerator()
        self.experiment_runner = ExperimentRunner()
        self.paper_writer = PaperWriter()
        self.reviewer = Reviewer()
        
        # Initialize the workflow graph
        self.workflow_graph = self._create_graph()
    
    def _create_graph(self) -> StateGraph:
        """
        Create the LangGraph workflow for AI Scientist.
        """
        workflow = StateGraph(AI_Scientist_State)
        
        # Define nodes
        workflow.add_node("generate_ideas", self._node_generate_ideas)
        workflow.add_node("select_best_idea", self._node_select_idea)
        workflow.add_node("run_experiment", self._node_run_experiment)
        workflow.add_node("write_paper", self._node_write_paper)
        workflow.add_node("review_paper", self._node_review_paper)
        workflow.add_node("revise_work", self._node_revise_work)
        
        # Define edges
        workflow.add_edge(START, "generate_ideas")
        workflow.add_edge("generate_ideas", "select_best_idea")
        workflow.add_edge("select_best_idea", "run_experiment")
        workflow.add_edge("run_experiment", "write_paper")
        workflow.add_edge("write_paper", "review_paper")
        
        # Conditional edge from review - either iterate or terminate
        workflow.add_conditional_edges(
            "review_paper", 
            self._should_iterate_based_on_review,
            {"revise_work": "revise_work", "write_paper": "write_paper", "generate_ideas": "generate_ideas", "END": END}
        )
        
        # Different iteration paths based on feedback
        workflow.add_edge("revise_work", "run_experiment")
        workflow.add_edge("write_paper", "review_paper")
        # When going back to generate new ideas, cycle through the full process
        workflow.add_edge("generate_ideas", "select_best_idea")
        
        return workflow.compile()
    
    def _node_generate_ideas(self, state: AI_Scientist_State) -> Dict:
        """
        Phase 1: Generate novel research ideas using the IdeaGenerator.
        """
        try:
            logger.info(f"Phase 1: Generating ideas for research area: {state['research_area']}")
            
            request = IdeaGenerationRequest(
                research_area=state['research_area'],
                num_ideas=3,
                template=None,
                constraints=[]
            )
            
            result = self.idea_generator.generate(request)
            ideas = result.ideas
            
            # Log the generated ideas
            for idx, idea in enumerate(ideas):
                novelty_score = getattr(idea, 'novelty_score', 'N/A')
                logger.debug(f"- Idea {idx+1}: '{idea.title}' (Novelty: {novelty_score})")
                
            return {
                "ideas": ideas,
                "status": "IDEAS_GENERATED",
                "iteration_count": state.get("iteration_count", 0) + 1,
                **self._safe_error_update(state, "Idea generation completed successfully")
            }
        except Exception as e:
            logger.error(f"Error in idea generation: {str(e)}")
            return {
                "ideas": [],
                "status": "IDEA_GENERATION_FAILED",
                "should_iterate": False,
                **self._safe_error_update(state, f"Idea generation failed: {str(e)}")
            }
    
    def _node_select_idea(self, state: AI_Scientist_State) -> Dict:
        """
        Select the most promising idea based on novelty, feasibility, and relevance.
        """
        try:
            logger.info("Phase 1b: Selecting best idea...")
            
            if not state.get("ideas"):
                logger.warning("No ideas available for selection")
                return {
                    "status": "NO_IDEAS_FOR_SELECTION",
                    "selected_idea": None,
                    "should_iterate": True,  # Try to generate new ideas
                    **self._safe_error_update(state, "No ideas available for selection")
                }
            
            # Select the best idea based on novelty score and other factors
            ideas = state["ideas"]
            sorted_ideas = sorted(ideas, 
                                key=lambda x: (
                                    getattr(x, 'novelty_score', 0), 
                                    len(getattr(x, 'key_distinguishing_features', [])),
                                    len(getattr(x, 'unique_contributions', []))
                                ), 
                                reverse=True)
            
            best_idea = sorted_ideas[0]
            logger.info(f"Selected idea: '{best_idea.title}' (Novelty: {getattr(best_idea, 'novelty_score', 'N/A')})")
            
            return {
                "selected_idea": best_idea,
                "status": "IDEA_SELECTED",
                **self._safe_error_update(state, "Idea selection completed successfully")
            }
        except Exception as e:
            logger.error(f"Error in idea selection: {str(e)}")
            return {
                "selected_idea": None,
                "status": "IDEA_SELECTION_FAILED", 
                "should_iterate": False,
                **self._safe_error_update(state, f"Idea selection failed: {str(e)}")
            }
    
    def _node_run_experiment(self, state: AI_Scientist_State) -> Dict:
        """
        Phase 2: Execute the experiment for the selected idea.
        """
        try:
            logger.info("Phase 2: Running experiment...")
            
            selected_idea = state.get("selected_idea")
            if not selected_idea:
                logger.warning("No selected idea for experiment")
                return {
                    "current_experiment": None,
                    "status": "NO_SELECTED_IDEA",
                    "should_iterate": True,  # Go back to idea generation
                    **self._safe_error_update(state, "No idea selected for experimentation")
                }
            
            logger.info(f"Running experiment for idea: '{selected_idea.title}'")
            
            # Run the experiment
            experiment = self.experiment_runner.run(selected_idea)
            
            # Record result
            experiments = state.get("experiment_results", [])
            experiments.append(experiment)
            
            logger.info(f"Experiment completed with status: {experiment.status}")
            
            return {
                "experiment_results": experiments,
                "current_experiment": experiment,
                "status": "EXPERIMENT_COMPLETED",
                **self._safe_error_update(state, "Experiment executed successfully")
            }
        except Exception as e:
            logger.error(f"Error in experiment execution: {str(e)}")
            return {
                "current_experiment": None,
                "status": "EXPERIMENT_FAILED",
                "should_iterate": True,  # Retry
                **self._safe_error_update(state, f"Experiment failed: {str(e)}")
            }
    
    def _node_write_paper(self, state: AI_Scientist_State) -> Dict:
        """
        Phase 3: Write a scientific paper based on the experiment results.
        """
        try:
            logger.info("Phase 3: Writing paper...")
            
            selected_idea = state.get("selected_idea")
            current_experiment = state.get("current_experiment")
            
            if not selected_idea:
                logger.warning("No idea available for paper writing")
                return {
                    "current_paper": None,
                    "status": "NO_IDEA_FOR_PAPER",
                    "should_iterate": True,
                    **self._safe_error_update(state, "No selected idea for paper writing")
                }
                
            if not current_experiment:
                logger.warning("No experiment results available for paper writing")
                return {
                    "current_paper": None,
                    "status": "NO_EXPERIMENT_FOR_PAPER", 
                    "should_iterate": True,
                    **self._safe_error_update(state, "No experiment results for paper writing")
                }
            
            logger.info(f"Writing paper for idea: '{selected_idea.title}'")
            
            # Write the paper
            paper = self.paper_writer.write_paper(
                idea=selected_idea,
                experiment=current_experiment,
                template="iclr",
                num_reflections=2  # Reduced for faster execution
            )
            
            # Record result
            drafts = state.get("drafts", [])
            drafts.append(paper)
            
            logger.info(f"Paper written: {paper.title}")
            
            return {
                "drafts": drafts,
                "current_paper": paper,
                "status": "PAPER_WRITTEN",
                **self._safe_error_update(state, "Paper authored successfully")
            }
        except Exception as e:
            logger.error(f"Error in paper writing: {str(e)}")
            return {
                "current_paper": None,
                "status": "PAPER_WRITING_FAILED",
                "should_iterate": True,
                **self._safe_error_update(state, f"Paper writing failed: {str(e)}")
            }
    
    def _node_review_paper(self, state: AI_Scientist_State) -> Dict:
        """
        Phase 4: Review the paper and decide to accept, reject or iterate.
        """
        try:
            logger.info("Phase 4: Reviewing paper...")
            
            current_paper = state.get("current_paper")
            if not current_paper:
                logger.warning("No paper available for review")
                return {
                    "current_review": None,
                    "status": "NO_PAPER_FOR_REVIEW",
                    "should_iterate": True,  # Return to experiment/idea generation
                    **self._safe_error_update(state, "No paper available for review")
                }
            
            logger.info(f"Reviewing paper: {current_paper.title[:50]}...")
            
            # Perform review
            review = self.reviewer.review(
                paper=current_paper,
                num_reflections=3,  # Strong reviewing process
                temperature=0.1
            )
            
            # Record result
            reviews = state.get("reviews", [])
            reviews.append(review)
            
            logger.info(f"Review completed - Decision: {review.decision.value}, Score: {review.overall_score}")
            
            return {
                "reviews": reviews,
                "current_review": review,
                "status": f"PAPER_REVIEWED_{review.decision.value.upper()}",
                **self._safe_error_update(state, "Paper review completed successfully")
            }
        except Exception as e:
            logger.error(f"Error in paper review: {str(e)}")
            return {
                "current_review": None,
                "status": "REVIEW_FAILED",
                "should_iterate": True,  # Try another round
                **self._safe_error_update(state, f"Paper review failed: {str(e)}")
            }
    
    def _node_revise_work(self, state: AI_Scientist_State) -> Dict:
        """
        Handle revisions based on review feedback, preparing for next iteration.
        """
        try:
            logger.info("Processing revision based on review feedback...")
            
            current_review = state.get("current_review")
            if current_review and hasattr(current_review, 'revision_required'):
                if current_review.revision_required:
                    logger.info("Revision required based on review feedback")
                    return {
                        "status": "REVISION_REQUIRED",
                        "should_iterate": True,
                        **self._safe_error_update(state, "Review indicates further iteration needed")
                    }
            
            # If we reach here, it means no revision is strictly required but we may want to explore more
            max_attempts = state.get("max_attempts", 5)
            current_iteration = state.get("iteration_count", 0)
            
            should_continue = current_iteration < max_attempts
            
            return {
                "should_iterate": should_continue,
                "status": f"READY_TO_{'ITERATE' if should_continue else 'STOP'}",
                "error_history": state.get("error_history", []),
            }
        except Exception as e:
            logger.error(f"Error in revise work: {str(e)}")
            return {
                "should_iterate": True,
                "status": "REVISE_WORK_ERROR",
                **self._safe_error_update(state, f"Revise work failed: {str(e)}")
            }
    
    def _analyze_review_weaknesses(self, review: Review) -> Dict[str, bool]:
        """
        Analyze a review to determine what types of weaknesses are identified.
        This helps route the workflow appropriately.
        
        Returns a dictionary with various weakness flags:
        - writing_related: Issues with writing, clarity, or presentation
        - methodology_related: Issues with methodology or experimental design
        - novelty_related: Issues with novelty or contribution
        """
        weaknesses_text = getattr(review, 'weaknesses', [])
        
        # Ensure we have text content to analyze
        weaknesses_str = " ".join([str(w) for w in weaknesses_text]) 
        
        # Define keywords for different types of weaknesses
        writing_keywords = {
            'writing', 'clarity', 'presentation', 'communication', 'grammar', 
            'expression', 'readability', 'structure', 'organization',
            'style', 'flow', 'coherence', 'language', 'proofreading'
        }
        
        methodology_keywords = {
            'methodology', 'methods', 'design', 'approach', 'procedure', 
            'algorithm', 'data', 'dataset', 'validation', 'verification',
            'experimental', 'experiment', 'baseline', 'results', 'analysis',
            'evaluation', 'metrics', 'testing', 'trial', 'protocol', 'procedure'
        }
        
        novelty_keywords = {
            'novelty', 'novel', 'contribution', 'originality', 'unique', 
            'significant', 'important', 'meaningful', 'innovative',
            'innovation', 'discovery', 'advancement', 'breakthrough',
            'groundbreaking', 'first', 'previously', 'unexplored', 'new',
            'original contribution', 'value'
        }
        
        # Convert the weaknesses text to lowercase for comparison
        weaknesses_lower = weaknesses_str.lower()
        
        # Check for each type of weakness
        writing_related = any(keyword in weaknesses_lower for keyword in writing_keywords)
        methodology_related = any(keyword in weaknesses_lower for keyword in methodology_keywords)
        novelty_related = any(keyword in weaknesses_lower for keyword in novelty_keywords)
        
        return {
            "writing_related": writing_related,
            "methodology_related": methodology_related,
            "novelty_related": novelty_related
        }
    
    def _should_iterate_based_on_review(self, state: AI_Scientist_State) -> Literal["revise_work", "write_paper", "generate_ideas", END]:
        """
        Determine if the workflow should continue based on the paper review.
        Now handles different types of feedback:
        - Methodology/experiment related -> go to run_experiment
        - Writing/presentation related -> go to write_paper directly
        - Novelty/idea related -> go to generate_ideas for new approach
        - Other/need general revision -> go to revise_work
        """
        current_review = state.get("current_review")
        max_attempts = state.get("max_attempts", 5)
        current_iteration = state.get("iteration_count", 0)        
        # Check if maximum attempts reached
        if current_iteration >= max_attempts or current_iteration > 10:  # Safety cap
            logger.info(f"Reached maximum attempts ({max_attempts}), terminating")
            return END
        
        # If no review available, continue with general revision
        if not current_review:
            return "revise_work"
        
        # Analyze the weaknesses in the review to determine the path forward
        weakness_analysis = self._analyze_review_weaknesses(current_review)
        
        # Check review decision
        decision = current_review.decision.value
        accept_threshold = 7.0  # Paper quality threshold for acceptance
        overall_score = getattr(current_review, 'overall_score', 0)
        
        logger.info(f"Review decision: {decision}, Score: {overall_score}, Accept threshold: {accept_threshold}")
        logger.info(f"Weakness analysis: {weakness_analysis}")
        
        # If paper meets quality threshold and review is positive, we can accept
        if overall_score >= accept_threshold and decision in ['accept', 'borderline']:
            logger.info(f"Acceptable paper found, terminating (Score: {overall_score})")
            return END
        else:
            # Determine appropriate action based on weaknesses
            if weakness_analysis.get('writing_related', False):
                # Writing/presentation/correction issue - go straight to write paper
                logger.info("Review identified writing/presentation issues, going to write_paper")
                return "write_paper"
            elif weakness_analysis.get('methodology_related', False):
                # Methodology/experiment issue - go back to experiment
                logger.info("Review identified methodology/experiment issues, going to run_experiment")
                return "revise_work"  # We'll modify what revise_work does
            elif weakness_analysis.get('novelty_related', False):
                # Novelty/contribution issue - generate new ideas
                logger.info("Review identified novelty/contribution issues, going to generate_ideas")
                return "generate_ideas"
            else:
                # General issues - continue with regular revision
                logger.info("General issues found, continuing with revision")
                return "revise_work"
    
    def _safe_error_update(self, state: AI_Scientist_State, error_msg: str) -> Dict:
        """
        Safely update error history without causing key conflicts.
        """
        current_errors = list(state.get("error_history", []))
        current_errors.append(error_msg)
        
        # Limit error history to prevent growth
        if len(current_errors) > 20:
            current_errors = current_errors[-10:]
        
        return {"error_history": current_errors}
    
    def execute(self, research_area: str, max_attempts: int = 5) -> Dict:
        """
        Execute the complete AI Scientist workflow.
        
        Args:
            research_area: The domain to explore for novel research.
            max_attempts: Maximum number of iterations to try.
            
        Returns:
            Final state of the AI Scientist workflow.
        """
        # Initial state
        initial_state = AI_Scientist_State(
            research_area=research_area,
            iteration_count=0,
            max_attempts=max_attempts,
            ideas=[],
            selected_idea=None,
            experiment_results=[],
            current_experiment=None,
            drafts=[],
            current_paper=None,
            reviews=[],
            current_review=None,
            should_iterate=True,
            status="INITIALIZED",
            error_history=[]
        )
        
        logger.info(f"Starting AI Scientist pipeline for research area: {research_area}")
        
        # Execute the workflow
        final_state = self.workflow_graph.invoke(initial_state)
        
        logger.info(f"AI Scientist pipeline completed with status: {final_state.get('status', 'UNKNOWN')}")
        
        return final_state
    
    def stream_execute(self, research_area: str, max_attempts: int = 5):
        """
        Execute the workflow with streaming updates.
        
        Args:
            research_area: The domain to explore for novel research.
            max_attempts: Maximum number of iterations to try.
        """
        # Initial state
        initial_state = AI_Scientist_State(
            research_area=research_area,
            iteration_count=0,
            max_attempts=max_attempts,
            ideas=[],
            selected_idea=None,
            experiment_results=[],
            current_experiment=None,
            drafts=[],
            current_paper=None,
            reviews=[],
            current_review=None,
            should_iterate=True,
            status="INITIALIZED",
            error_history=[]
        )
        
        logger.info(f"Starting streaming AI Scientist pipeline for: {research_area}")
        
        # Stream the workflow
        for state_update in self.workflow_graph.stream(initial_state):
            yield state_update


class SingletonAIScientist:
    """Thread-safe singleton wrapper around the AI Scientist pipeline."""

    _instance: SingletonAIScientist | None = None
    pipeline: AIScientistPipeline

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.pipeline = AIScientistPipeline()
        return cls._instance


def execute_research_pipeline(research_area: str, max_attempts: int = 5) -> Dict:
    """Execute the AI Scientist research pipeline from a research area.

    Args:
        research_area: Domain to research (e.g., "computer vision", "NLP")
        max_attempts: Maximum iterations before stopping

    Returns:
        Final state with complete research workflow results.
    """
    pipeline = AIScientistPipeline()
    return pipeline.execute(research_area, max_attempts)


def build_pipeline():
    """Pre-compile/initialize pipeline for faster execution."""
    pipeline = AIScientistPipeline()
    return pipeline.workflow_graph