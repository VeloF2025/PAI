#!/usr/bin/env bun
/**
 * PAI On-Session-Start Hook
 *
 * Automatically generates project-specific validation agents on first
 * Claude activation in a project.
 *
 * Behavior:
 * - Checks if .archon/project_agents.yaml exists
 * - If missing: Analyzes codebase and generates specialized agents
 * - If exists: Validates config is current (optional check)
 * - Runs silently in background (non-blocking)
 *
 * Exit Codes:
 * - 0: Success (always - never blocks session start)
 * - Hook failures are logged but don't prevent Claude from starting
 */

import { exec } from "child_process";
import { promisify } from "util";
import { existsSync } from "fs";
import { join } from "path";

const execAsync = promisify(exec);

interface HookInput {
  session_id: string;
  transcript_path: string;
  hook_event_name: string;
  working_directory?: string;
}

/**
 * Read JSON input from stdin.
 */
async function readStdin(): Promise<HookInput> {
  const decoder = new TextDecoder();
  const reader = Bun.stdin.stream().getReader();
  let input = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    input += decoder.decode(value, { stream: true });
  }

  return JSON.parse(input);
}

/**
 * Check if project has agent configuration.
 */
function hasProjectAgents(projectRoot: string): boolean {
  const configPath = join(projectRoot, ".claude", "agents", "project_agents.yaml");
  return existsSync(configPath);
}

/**
 * Check if project is a valid candidate for agent generation.
 */
function isValidProject(projectRoot: string): boolean {
  // Must have common project indicators
  const indicators = [
    "package.json",    // Node/npm
    "pyproject.toml",  // Python
    "requirements.txt", // Python
    "Cargo.toml",      // Rust
    "go.mod",          // Go
    "pom.xml",         // Java/Maven
    "build.gradle",    // Java/Gradle
    "docker-compose.yml", // Docker
    "docker-compose.yaml", // Docker
    "Makefile",        // Make
  ];

  // Check root directory
  if (indicators.some(file => existsSync(join(projectRoot, file)))) {
    return true;
  }

  // Check common subdirectories for monorepos
  const subdirs = ["python", "frontend", "backend", "api", "src"];
  for (const subdir of subdirs) {
    const subdirPath = join(projectRoot, subdir);
    if (existsSync(subdirPath)) {
      if (indicators.some(file => existsSync(join(subdirPath, file)))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Generate project-specific agents.
 */
async function generateProjectAgents(projectRoot: string): Promise<void> {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const validationPath = `${homeDir}\\.claude\\validation`;

  // Use Python's raw string for Windows paths
  const pythonScript = `
from pathlib import Path
import sys
sys.path.insert(0, r"${validationPath}")
from project_factory import ProjectAgentFactory

try:
    factory = ProjectAgentFactory(r"${projectRoot}")
    config = factory.analyze_and_generate()
    print(f'✅ Generated {len(config.agents)} specialized agents')
    print(f'   Tech stack: {", ".join(config.project.languages.keys())}')
    print(f'   Complexity: {config.project.complexity}/10')
except Exception as e:
    print(f'⚠️  Agent generation skipped: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(0)  # Don't block session start
`;

  try {
    const { stdout, stderr } = await execAsync(`python -c "${pythonScript}"`, {
      cwd: projectRoot,
      timeout: 10000, // 10 second timeout
    });

    if (stdout) {
      console.log("[on-session-start] Project Agent Factory:");
      console.log(stdout);
    }
    if (stderr) {
      console.error("[on-session-start] Warnings:", stderr);
    }
  } catch (error: any) {
    // Don't block session start on errors
    console.warn(`[on-session-start] Agent generation failed (non-blocking): ${error.message}`);
  }
}

/**
 * Main hook execution.
 */
async function main() {
  try {
    // Read hook input
    const hookInput = await readStdin();
    const projectRoot = hookInput.working_directory || process.cwd();

    console.log(`[on-session-start] Session started in: ${projectRoot}`);

    // Check if valid project
    if (!isValidProject(projectRoot)) {
      console.log("[on-session-start] Not a recognized project type, skipping agent generation");
      process.exit(0);
    }

    // Check if agents already exist
    if (hasProjectAgents(projectRoot)) {
      console.log("[on-session-start] ✅ Project agents already configured");
      process.exit(0);
    }

    // Generate project-specific agents
    console.log("[on-session-start] Analyzing codebase and generating specialized agents...");
    await generateProjectAgents(projectRoot);

    process.exit(0); // Always succeed

  } catch (error: any) {
    // Never block session start
    console.warn(`[on-session-start] Hook error (non-blocking): ${error.message}`);
    process.exit(0);
  }
}

main();
