#!/usr/bin/env python3
"""
Autonomous Coding Worker - BOSS worker for ACH integration
===========================================================

Executes ACH autonomous coding sessions as a BOSS worker:
1. Receives task with project_root and feature_list_path
2. Spawns ACH subprocess for each session
3. Handles checkpoint validation every 5 sessions
4. Cleans up MCP processes between sessions (Windows-compatible)
5. Continues until all tests in feature_list.json pass

Task Format:
{
    "task_type": "autonomous_coding",
    "project_root": "C:/Projects/my-app",
    "feature_list_path": "C:/Projects/my-app/feature_list.json",
    "max_sessions": 50,
    "checkpoint_interval": 5,
    "autonomous_mode": True
}
"""

import json
import os
import subprocess
import time
from pathlib import Path
from typing import Dict, Any, Optional
import sys

# Add BOSS base path to Python path
BOSS_BASE = Path(__file__).parent.parent
sys.path.insert(0, str(BOSS_BASE))

from workers.base.base_worker import BaseWorker


class AutonomousCodingWorker(BaseWorker):
    """
    BOSS Worker for ACH autonomous coding integration
    """

    def __init__(self):
        super().__init__()
        self.worker_type = "autonomous_coding"
        self.ach_location = r"C:\Jarvis\AI Workspace\BOSS Exchange\autonomous-coding"
        self.ach_script = "autonomous_agent_demo.py"

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute autonomous coding task

        Args:
            task: Task configuration with project_root, feature_list_path, max_sessions

        Returns:
            Execution result with session metrics
        """
        print(f"🤖 [Autonomous Coding Worker] Starting autonomous coding")
        print(f"📂 Project Root: {task['project_root']}")
        print(f"📝 Feature List: {task['feature_list_path']}")
        print(f"🔢 Max Sessions: {task.get('max_sessions', 50)}")

        project_root = task['project_root']
        feature_list_path = task['feature_list_path']
        max_sessions = task.get('max_sessions', 50)
        checkpoint_interval = task.get('checkpoint_interval', 5)

        # Validate inputs
        if not os.path.exists(project_root):
            return {
                "success": False,
                "error": f"Project root does not exist: {project_root}",
            }

        if not os.path.exists(feature_list_path):
            return {
                "success": False,
                "error": f"Feature list does not exist: {feature_list_path}",
            }

        # Session tracking
        session_count = 0
        sessions_completed = []
        sessions_failed = []

        start_time = time.time()

        try:
            # Main session loop
            while session_count < max_sessions:
                session_id = f"session-{session_count}"
                print(f"\n🚀 [Session {session_count + 1}/{max_sessions}] Starting ACH session")

                # Run ACH session
                session_result = self._run_ach_session(
                    session_id=session_id,
                    project_root=project_root,
                    feature_list_path=feature_list_path,
                    max_iterations=20,
                )

                if session_result['success']:
                    sessions_completed.append(session_id)
                    print(f"✅ [Session {session_count + 1}] Completed successfully")

                    # Check if all tests passed (completion criteria)
                    if session_result.get('all_tests_passed', False):
                        print(f"\n🎉 [Autonomous Coding] All tests passed! Workflow complete.")
                        break
                else:
                    sessions_failed.append(session_id)
                    print(f"❌ [Session {session_count + 1}] Failed: {session_result.get('error', 'Unknown error')}")

                    # Retry logic (max 2 retries)
                    retry_count = session_result.get('retry_count', 0)
                    if retry_count < 2:
                        print(f"🔄 [Session {session_count + 1}] Retrying ({retry_count + 1}/2)...")
                        continue
                    else:
                        print(f"⚠️  [Session {session_count + 1}] Max retries reached, continuing...")

                session_count += 1

                # Cleanup MCP processes between sessions
                if session_count % 1 == 0:  # Every session
                    print(f"🧹 [Cleanup] Cleaning up MCP processes")
                    self._cleanup_mcp_processes()

                # Checkpoint validation every N sessions
                if session_count % checkpoint_interval == 0 and session_count < max_sessions:
                    print(f"\n🔍 [Checkpoint {session_count // checkpoint_interval}] Running validation")
                    validation_result = self._run_checkpoint_validation(task, session_count)

                    if not validation_result['passed']:
                        print(f"⚠️  [Checkpoint] Validation warnings: {validation_result.get('warnings', [])}")
                        # Continue anyway (warnings, not errors)

            # Final metrics
            total_duration = time.time() - start_time
            success_rate = len(sessions_completed) / session_count if session_count > 0 else 0

            print(f"\n📊 [Autonomous Coding] Session Summary:")
            print(f"   Total Sessions: {session_count}")
            print(f"   Completed: {len(sessions_completed)}")
            print(f"   Failed: {len(sessions_failed)}")
            print(f"   Success Rate: {success_rate * 100:.1f}%")
            print(f"   Total Duration: {total_duration:.2f}s")

            return {
                "success": True,
                "session_count": session_count,
                "sessions_completed": len(sessions_completed),
                "sessions_failed": len(sessions_failed),
                "success_rate": success_rate,
                "total_duration": total_duration,
                "all_tests_passed": session_count < max_sessions,  # Completed early if true
            }

        except Exception as e:
            print(f"\n❌ [Autonomous Coding Worker] Fatal error: {e}")
            import traceback
            traceback.print_exc()

            return {
                "success": False,
                "error": str(e),
                "session_count": session_count,
                "sessions_completed": len(sessions_completed),
                "sessions_failed": len(sessions_failed),
            }

    def _run_ach_session(
        self,
        session_id: str,
        project_root: str,
        feature_list_path: str,
        max_iterations: int = 20,
    ) -> Dict[str, Any]:
        """
        Run a single ACH autonomous coding session

        Args:
            session_id: Unique session identifier
            project_root: Target project directory
            feature_list_path: Path to feature_list.json
            max_iterations: Maximum iterations per session

        Returns:
            Session result with success flag and metrics
        """
        print(f"💻 [ACH Session] Spawning ACH subprocess")

        # Construct ACH command
        ach_script_path = os.path.join(self.ach_location, self.ach_script)

        cmd = [
            'python',
            ach_script_path,
            '--session-id', session_id,
            '--project-root', project_root,
            '--feature-list', feature_list_path,
            '--max-iterations', str(max_iterations),
            '--autonomous',
        ]

        print(f"   Command: {' '.join(cmd)}")

        try:
            # Spawn ACH subprocess with proper encoding for Windows
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding='utf-8',
                cwd=self.ach_location,
                timeout=600,  # 10 minute timeout per session
            )

            # Check result
            if result.returncode == 0:
                print(f"✅ [ACH Session] Completed successfully")

                # Parse output for metrics (if available)
                # ACH should output JSON on last line for metrics
                try:
                    output_lines = result.stdout.strip().split('\n')
                    last_line = output_lines[-1] if output_lines else '{}'
                    metrics = json.loads(last_line)
                except:
                    metrics = {}

                return {
                    "success": True,
                    "session_id": session_id,
                    "metrics": metrics,
                    "all_tests_passed": metrics.get('all_tests_passed', False),
                }
            else:
                print(f"❌ [ACH Session] Failed with return code {result.returncode}")
                print(f"   stderr: {result.stderr[:500]}")  # First 500 chars

                return {
                    "success": False,
                    "session_id": session_id,
                    "error": result.stderr[:500],
                    "return_code": result.returncode,
                }

        except subprocess.TimeoutExpired:
            print(f"⏱️  [ACH Session] Timeout after 10 minutes")
            return {
                "success": False,
                "session_id": session_id,
                "error": "Session timeout (10 minutes)",
            }

        except Exception as e:
            print(f"❌ [ACH Session] Exception: {e}")
            return {
                "success": False,
                "session_id": session_id,
                "error": str(e),
            }

    def _cleanup_mcp_processes(self) -> None:
        """
        Cleanup MCP processes (Windows-compatible)

        Uses tasklist to find MCP processes, then taskkill with specific PIDs
        NEVER uses taskkill //F //IM (that kills ALL processes)
        """
        print(f"🧹 [MCP Cleanup] Checking for MCP processes")

        try:
            # Find MCP processes using tasklist
            result = subprocess.run(
                ['tasklist'],
                capture_output=True,
                text=True,
                encoding='utf-8',
            )

            if result.returncode != 0:
                print(f"⚠️  [MCP Cleanup] Could not list processes")
                return

            # Filter for MCP-related processes
            mcp_pids = []
            for line in result.stdout.split('\n'):
                # Look for playwright, mcp, or related processes
                if any(keyword in line.lower() for keyword in ['playwright', 'mcp-server', 'chrome']):
                    parts = line.split()
                    if len(parts) >= 2:
                        try:
                            pid = int(parts[1])  # PID is typically second column
                            mcp_pids.append(pid)
                        except ValueError:
                            continue

            if not mcp_pids:
                print(f"✅ [MCP Cleanup] No MCP processes found")
                return

            # Kill specific PIDs (NOT all processes of a type)
            print(f"🗑️  [MCP Cleanup] Found {len(mcp_pids)} MCP processes, cleaning up...")
            for pid in mcp_pids:
                try:
                    subprocess.run(
                        ['taskkill', '/F', '/PID', str(pid)],
                        capture_output=True,
                        timeout=5,
                    )
                    print(f"   Killed PID {pid}")
                except:
                    pass  # Process may have already exited

            print(f"✅ [MCP Cleanup] Cleanup complete")

        except Exception as e:
            print(f"⚠️  [MCP Cleanup] Error during cleanup: {e}")
            # Continue anyway (non-critical)

    def _run_checkpoint_validation(self, task: Dict[str, Any], session_count: int) -> Dict[str, Any]:
        """
        Run lightweight PAI validation at checkpoints

        Args:
            task: Original task configuration
            session_count: Current session count

        Returns:
            Validation result
        """
        print(f"🔍 [Checkpoint Validation] Running lightweight validation")

        project_root = task['project_root']

        # Run lightweight validation (TypeScript, ESLint, basic tests)
        # This is a placeholder - actual validation would call PAI validators
        try:
            # Check if project builds
            build_result = subprocess.run(
                ['npm', 'run', 'build'],
                cwd=project_root,
                capture_output=True,
                text=True,
                encoding='utf-8',
                timeout=120,  # 2 minute timeout
            )

            if build_result.returncode == 0:
                print(f"✅ [Checkpoint] Build successful")
                return {
                    "passed": True,
                    "checks": ["build"],
                }
            else:
                print(f"⚠️  [Checkpoint] Build failed: {build_result.stderr[:200]}")
                return {
                    "passed": False,
                    "warnings": [f"Build failed: {build_result.stderr[:200]}"],
                }

        except Exception as e:
            print(f"⚠️  [Checkpoint] Validation error: {e}")
            return {
                "passed": False,
                "warnings": [f"Validation error: {e}"],
            }

    def validate_task(self, task: Dict[str, Any]) -> bool:
        """
        Validate task configuration

        Args:
            task: Task to validate

        Returns:
            True if valid
        """
        required_fields = ['project_root', 'feature_list_path']

        for field in required_fields:
            if field not in task:
                print(f"❌ [Task Validation] Missing required field: {field}")
                return False

        return True


# Entry point for testing
if __name__ == "__main__":
    worker = AutonomousCodingWorker()

    # Test task
    test_task = {
        "task_type": "autonomous_coding",
        "project_root": r"C:\Projects\test-app",
        "feature_list_path": r"C:\Projects\test-app\feature_list.json",
        "max_sessions": 5,
        "checkpoint_interval": 5,
        "autonomous_mode": True,
    }

    print("🧪 [Test] Running autonomous coding worker test")
    result = worker.execute(test_task)
    print("\n📊 [Test] Result:", json.dumps(result, indent=2))
