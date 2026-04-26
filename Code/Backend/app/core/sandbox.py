"""Docker sandbox for executing LLM-generated code safely.

Runs user-provided Python code inside an isolated Docker container
with resource limits and timeout enforcement.
"""

from __future__ import annotations

import logging
import tempfile
import uuid
from pathlib import Path
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)

_DOCKERFILE = """FROM python:3.11-slim
WORKDIR /workspace
RUN pip install --no-cache-dir numpy pandas matplotlib scikit-learn
COPY runner.py /workspace/runner.py
ENTRYPOINT ["python", "/workspace/runner.py"]
"""

_RUNNER_TEMPLATE = """\"\"\"
Sandbox runner — executes experiment code and saves results.
\"\"\"
import json
import sys
import traceback
from pathlib import Path

def main() -> None:
    code_file = Path("/workspace/experiment_code.py")
    results_file = Path("/workspace/results.json")
    try:
        code = code_file.read_text(encoding="utf-8")
        namespace: dict = {{}}
        exec(code, namespace)  # noqa: S102
        if "run_experiment" in namespace:
            results = namespace["run_experiment"]()
            results_file.write_text(json.dumps(results, indent=2, default=str))
        else:
            results_file.write_text(json.dumps({{"status": "no run_experiment function"}}))
    except Exception:
        results_file.write_text(json.dumps({{
            "status": "error",
            "error": traceback.format_exc(),
        }}))

if __name__ == "__main__":
    main()
"""


class SandboxResult:
    """Result of a sandboxed code execution."""

    def __init__(self, success: bool, data: dict[str, Any] | None = None, error: str | None = None) -> None:
        self.success = success
        self.data = data
        self.error = error

    def to_dict(self) -> dict[str, Any]:
        """Serialize the result to a dictionary."""
        return {
            "success": self.success,
            "data": self.data,
            "error": self.error,
        }


class Sandbox:
    """Docker-based sandbox for executing experiment code."""

    def __init__(self) -> None:
        self._image_tag = "autosearch-sandbox"
        self._available: bool | None = None

    def is_available(self) -> bool:
        """Check if Docker is available and the image is built."""
        if self._available is not None:
            return self._available
        if not settings.sandbox_enabled:
            self._available = False
            return False
        try:
            import docker  # noqa: F401

            self._available = True
        except ImportError:
            logger.warning("Docker SDK not installed; sandbox unavailable")
            self._available = False
        except Exception:
            logger.error("Failed to initialize Docker client; sandbox unavailable", exc_info=True)
            self._available = False
        return self._available
    
    def get_resource_limits(self) -> dict:
        """Get resource limits based on settings."""
        return {
            "mem_limit": settings.sandbox_memory_limit,
            "cpu_quota": min(int(float(settings.sandbox_cpu_limit) * 100000), 100000),  # Convert to usable quota
            "network_disabled": settings.sandbox_network_disabled,
        }

    def build_image(self) -> None:
        """Build the Docker sandbox image."""
        import docker

        client = docker.from_env()
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            (tmp / "Dockerfile").write_text(_DOCKERFILE, encoding="utf-8")
            (tmp / "runner.py").write_text(_RUNNER_TEMPLATE, encoding="utf-8")
            client.images.build(path=tmpdir, tag=self._image_tag, rm=True)
        logger.info("Enhanced sandbox image built: %s", self._image_tag)

    def execute(self, code: str, timeout: int | None = None) -> SandboxResult:
        """Execute Python code inside the sandbox container.

        Args:
            code: Python code to execute. Must define a ``run_experiment()`` function.
            timeout: Timeout in seconds. Defaults to ``settings.sandbox_timeout``.

        Returns:
            A ``SandboxResult`` with the execution outcome.
        """
        if not self.is_available():
            return SandboxResult(success=False, error="Sandbox not available (Docker disabled or missing)")

        import docker

        timeout = timeout or settings.sandbox_timeout
        run_id = uuid.uuid4().hex[:8]
        client = docker.from_env()

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            (tmp / "experiment_code.py").write_text(code, encoding="utf-8")

            try:
                resource_limits = self.get_resource_limits()
                container = client.containers.run(
                    image=self._image_tag,
                    detach=True,
                    volumes={tmpdir: {"bind": "/workspace", "mode": "rw"}},
                    mem_limit=resource_limits["mem_limit"],
                    cpu_period=100000,
                    cpu_quota=resource_limits["cpu_quota"],
                    network_disabled=resource_limits["network_disabled"],
                    name=f"ai-scientist-{run_id}",
                    oom_kill_disable=False,  # Allow OOM killer to prevent system crashes
                    pids_limit=50,  # Limit number of processes
                )
                result = container.wait(timeout=timeout)
                exit_code = result.get("StatusCode", -1)

                if exit_code != 0:
                    logs = container.logs().decode("utf-8", errors="replace")
                    container.remove(force=True)
                    return SandboxResult(success=False, error=f"Exit code {exit_code}: {logs}")

                results_path = tmp / "results.json"
                if results_path.exists():
                    import json

                    data = json.loads(results_path.read_text(encoding="utf-8"))
                else:
                    data = {"status": "no results file"}

                container.remove(force=True)
                return SandboxResult(success=True, data=data)

            except Exception as exc:
                logger.exception("Sandbox execution failed for run %s", run_id)
                return SandboxResult(success=False, error=str(exc))


def execute_code_sandboxed(code: str, timeout: int | None = None) -> SandboxResult:
    """Convenience function to execute code in the sandbox.

    Args:
        code: Python code to execute.
        timeout: Timeout in seconds.

    Returns:
        A ``SandboxResult``.
    """
    sandbox = Sandbox()
    return sandbox.execute(code, timeout)
