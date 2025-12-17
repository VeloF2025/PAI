#!/usr/bin/env bun
/**
 * PAI Agent Auto-Updater Hook
 *
 * Automatically detects when project complexity or technology stack changes
 * significantly, and regenerates project-specific agents to match.
 *
 * Triggers When:
 * - File count changes by ±20%
 * - Complexity score changes by ±1.0
 * - New technologies detected
 * - Architecture patterns change
 *
 * Integration:
 * - Runs on PostToolUse after Write/Edit/MultiEdit
 * - Calculates current project metrics
 * - Compares with cached baseline
 * - Triggers agent regeneration if thresholds exceeded
 * - Updates baseline cache
 *
 * Exit Codes:
 * - 0: Success (update triggered or not needed)
 * - 1: Error (logged but not blocking)
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { createHash } from "crypto";

const execAsync = promisify(exec);

interface HookInput {
  session_id: string;
  transcript_path: string;
  hook_event_name: string;
  tool_name?: string;
  tool_args?: any;
  file_path?: string;
}

interface ProjectMetrics {
  file_count: number;
  complexity_score: number;
  technologies: string[];
  architecture_patterns: string[];
  directory_depth: number;
  avg_file_size: number;
  total_lines_of_code: number;
}

interface BaselineCache {
  project_root: string;
  last_update: string;
  baseline_metrics: ProjectMetrics;
  agent_count: number;
  last_agent_hash: string;
}

interface UpdateThresholds {
  file_count_change_percent: number;
  complexity_change_delta: number;
  new_technology_detected: boolean;
  architecture_pattern_change: boolean;
  min_time_between_updates: number; // milliseconds
}

const DEFAULT_THRESHOLDS: UpdateThresholds = {
  file_count_change_percent: 20, // ±20%
  complexity_change_delta: 1.0, // ±1.0
  new_technology_detected: true,
  architecture_pattern_change: true,
  min_time_between_updates: 3600000, // 1 hour
};

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
 * Get cache directory for agent updates.
 */
function getCacheDir(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  return join(homeDir!, ".claude", "validation", "agent_update_cache");
}

/**
 * Get cache file path for project.
 */
function getCacheFile(projectRoot: string): string {
  const cacheDir = getCacheDir();
  const hash = createHash("md5")
    .update(projectRoot)
    .digest("hex")
    .substring(0, 8);
  return join(cacheDir, `baseline_${hash}.json`);
}

/**
 * Load baseline metrics from cache.
 */
async function loadBaseline(projectRoot: string): Promise<BaselineCache | null> {
  const cacheFile = getCacheFile(projectRoot);

  try {
    const content = await readFile(cacheFile, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Save baseline metrics to cache.
 */
async function saveBaseline(
  projectRoot: string,
  metrics: ProjectMetrics,
  agentCount: number
): Promise<void> {
  const cacheDir = getCacheDir();
  const cacheFile = getCacheFile(projectRoot);

  try {
    // Ensure cache directory exists
    await mkdir(cacheDir, { recursive: true });

    // Calculate agent hash (for change detection)
    const agentHash = createHash("md5")
      .update(JSON.stringify(metrics))
      .digest("hex")
      .substring(0, 8);

    const baseline: BaselineCache = {
      project_root: projectRoot,
      last_update: new Date().toISOString(),
      baseline_metrics: metrics,
      agent_count: agentCount,
      last_agent_hash: agentHash,
    };

    await writeFile(cacheFile, JSON.stringify(baseline, null, 2), "utf-8");
  } catch (error: any) {
    console.error(`[agent-updater] Failed to save baseline: ${error.message}`);
  }
}

/**
 * Check if minimum time between updates has elapsed.
 */
function canUpdate(baseline: BaselineCache | null, minInterval: number): boolean {
  if (!baseline) return true;

  const lastUpdate = new Date(baseline.last_update).getTime();
  const now = Date.now();
  const elapsed = now - lastUpdate;

  return elapsed >= minInterval;
}

/**
 * Find project root by looking for .archon directory.
 */
async function findProjectRoot(startPath: string): Promise<string | null> {
  const path = require("path");
  const fs = require("fs/promises");
  let currentDir = path.dirname(startPath);

  while (currentDir !== path.parse(currentDir).root) {
    const archonDir = join(currentDir, ".archon");
    try {
      await fs.access(archonDir);
      return currentDir;
    } catch {
      currentDir = path.dirname(currentDir);
    }
  }

  return null;
}

/**
 * Calculate current project metrics.
 */
async function calculateMetrics(
  projectRoot: string
): Promise<ProjectMetrics | null> {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const trackerScript = `${homeDir}/.claude/hooks/lib/project-metrics-tracker.ts`;

  try {
    // Run metrics tracker
    const { stdout } = await execAsync(`bun "${trackerScript}"`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        PROJECT_ROOT: projectRoot,
      },
    });

    // Parse metrics from output
    // Note: This is a placeholder - the actual tracker needs to be enhanced
    // to accept PROJECT_ROOT env var and output JSON
    return JSON.parse(stdout);
  } catch (error: any) {
    console.error(`[agent-updater] Failed to calculate metrics: ${error.message}`);
    return null;
  }
}

/**
 * Check if thresholds are exceeded.
 */
function checkThresholds(
  current: ProjectMetrics,
  baseline: ProjectMetrics,
  thresholds: UpdateThresholds
): { exceeded: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // File count change
  const fileCountChange =
    Math.abs(current.file_count - baseline.file_count) /
    baseline.file_count *
    100;

  if (fileCountChange >= thresholds.file_count_change_percent) {
    reasons.push(
      `File count changed by ${fileCountChange.toFixed(1)}% (${baseline.file_count} → ${current.file_count})`
    );
  }

  // Complexity change
  const complexityChange = Math.abs(
    current.complexity_score - baseline.complexity_score
  );

  if (complexityChange >= thresholds.complexity_change_delta) {
    reasons.push(
      `Complexity changed by ${complexityChange.toFixed(1)} (${baseline.complexity_score} → ${current.complexity_score})`
    );
  }

  // New technologies
  const newTechs = current.technologies.filter(
    (tech) => !baseline.technologies.includes(tech)
  );

  if (newTechs.length > 0 && thresholds.new_technology_detected) {
    reasons.push(`New technologies: ${newTechs.join(", ")}`);
  }

  // Architecture changes
  const newPatterns = current.architecture_patterns.filter(
    (pattern) => !baseline.architecture_patterns.includes(pattern)
  );

  if (newPatterns.length > 0 && thresholds.architecture_pattern_change) {
    reasons.push(`New architecture patterns: ${newPatterns.join(", ")}`);
  }

  return {
    exceeded: reasons.length > 0,
    reasons,
  };
}

/**
 * Trigger agent regeneration.
 */
async function regenerateAgents(
  projectRoot: string,
  reasons: string[]
): Promise<void> {
  console.log(`[agent-updater] Regenerating agents due to:`);
  for (const reason of reasons) {
    console.log(`  - ${reason}`);
  }

  const pythonCmd = process.platform === "win32" ? "python" : "python3";
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const regenerateScript = `${homeDir}/.claude/validation/project_factory/regenerate_agents.py`;

  try {
    const { stdout, stderr } = await execAsync(
      `${pythonCmd} "${regenerateScript}" "${projectRoot}" --auto-update`,
      {
        encoding: "utf-8",
        maxBuffer: 10 * 1024 * 1024,
        timeout: 300000, // 5 minutes
      }
    );

    console.log("[agent-updater] Agent regeneration complete:");
    console.log(stdout);

    if (stderr) {
      console.log("[agent-updater] Warnings:");
      console.log(stderr);
    }
  } catch (error: any) {
    console.error(`[agent-updater] Regeneration failed: ${error.message}`);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
  }
}

/**
 * Get agent count from config file.
 */
async function getAgentCount(projectRoot: string): Promise<number> {
  const configPath = join(projectRoot, ".archon", "project_agents.yaml");

  try {
    const content = await readFile(configPath, "utf-8");
    // Simple YAML parsing - count "- name:" entries
    const matches = content.match(/^  - name:/gm);
    return matches ? matches.length : 0;
  } catch {
    return 0;
  }
}

/**
 * Load thresholds from environment or use defaults.
 */
function loadThresholds(): UpdateThresholds {
  try {
    const envThresholds = process.env.PAI_AGENT_UPDATE_THRESHOLDS;
    if (envThresholds) {
      return {
        ...DEFAULT_THRESHOLDS,
        ...JSON.parse(envThresholds),
      };
    }
  } catch (error: any) {
    console.error(`[agent-updater] Invalid threshold config: ${error.message}`);
  }

  return DEFAULT_THRESHOLDS;
}

/**
 * Main hook execution.
 */
async function main() {
  try {
    // Read hook input
    const hookInput = await readStdin();

    // Check if auto-update is enabled
    const enabled = process.env.PAI_AGENT_AUTO_UPDATE_ENABLED !== "false";
    if (!enabled) {
      console.log("[agent-updater] Auto-update disabled");
      process.exit(0);
    }

    // Check if this is a Write/Edit operation
    const toolName = hookInput.tool_name;
    if (!toolName || !["Write", "Edit", "MultiEdit"].includes(toolName)) {
      process.exit(0);
    }

    // Get file path
    const filePath = hookInput.file_path;
    if (!filePath) {
      process.exit(0);
    }

    console.log(`[agent-updater] File modified: ${filePath}`);

    // Find project root
    const projectRoot = await findProjectRoot(filePath);
    if (!projectRoot) {
      console.log("[agent-updater] No .archon directory found, skipping");
      process.exit(0);
    }

    console.log(`[agent-updater] Project root: ${projectRoot}`);

    // Load baseline
    const baseline = await loadBaseline(projectRoot);

    // Load thresholds
    const thresholds = loadThresholds();

    // Check if enough time has elapsed
    if (!canUpdate(baseline, thresholds.min_time_between_updates)) {
      const elapsed = baseline
        ? Date.now() - new Date(baseline.last_update).getTime()
        : 0;
      const remaining = thresholds.min_time_between_updates - elapsed;
      const minutesRemaining = Math.ceil(remaining / 60000);

      console.log(
        `[agent-updater] Too soon for update (${minutesRemaining} minutes remaining)`
      );
      process.exit(0);
    }

    // Calculate current metrics
    console.log("[agent-updater] Calculating project metrics...");
    const currentMetrics = await calculateMetrics(projectRoot);

    if (!currentMetrics) {
      console.error("[agent-updater] Failed to calculate metrics");
      process.exit(0);
    }

    // If no baseline, save current metrics and exit
    if (!baseline) {
      console.log("[agent-updater] No baseline found, saving current metrics");
      const agentCount = await getAgentCount(projectRoot);
      await saveBaseline(projectRoot, currentMetrics, agentCount);
      process.exit(0);
    }

    // Check if thresholds are exceeded
    const { exceeded, reasons } = checkThresholds(
      currentMetrics,
      baseline.baseline_metrics,
      thresholds
    );

    if (!exceeded) {
      console.log("[agent-updater] No significant changes detected");
      process.exit(0);
    }

    // Regenerate agents
    await regenerateAgents(projectRoot, reasons);

    // Update baseline
    const newAgentCount = await getAgentCount(projectRoot);
    await saveBaseline(projectRoot, currentMetrics, newAgentCount);

    // Success
    process.exit(0);
  } catch (error: any) {
    console.error(`[agent-updater] Hook error: ${error.message}`);
    // Non-blocking on errors
    process.exit(0);
  }
}

main();
