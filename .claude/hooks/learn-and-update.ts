#!/usr/bin/env bun
/**
 * PAI Learn and Update Hook (Enhanced)
 *
 * Orchestrates the complete session learning system across all components.
 *
 * This hook runs on SessionEnd and coordinates:
 * - Session event analysis (Component 1)
 * - DGTS pattern learning (Component 2)
 * - Validation rule evolution (Component 3)
 * - Agent behavior optimization (Component 4)
 *
 * All updates are applied atomically with backup/rollback capability.
 *
 * Hook Type: SessionEnd
 * Trigger: Runs automatically after each session ends
 */

import { readFile, writeFile, mkdir, copyFile } from "fs/promises";
import { join } from "path";
import { parseSessionEvents, extractPatterns, generateInsights } from "./lib/session-event-analyzer";
import { detectGamingAttempts, analyzeGamingPatterns, updateDGTSConfig } from "./lib/dgts-pattern-learner";
import { extractValidationFailures, identifyRecurringErrors, generateValidationRule, evolveValidationConfig } from "./lib/validation-rule-evolver";
import { trackAgentExecutions, calculateAgentPerformance, identifyOptimalBehaviors, updateAgentConfigs } from "./lib/agent-behavior-optimizer";
import type { LearningInsights } from "./lib/session-event-analyzer";
import type { DGTSUpdate } from "./lib/dgts-pattern-learner";
import type { RuleEvolution } from "./lib/validation-rule-evolver";
import type { BehaviorOptimization } from "./lib/agent-behavior-optimizer";

export interface LearningConfig {
  enabled: boolean;
  min_pattern_frequency: number;
  dgts_confidence_threshold: number;
  validation_effectiveness_threshold: number;
  agent_optimization_confidence_threshold: number;
  learning_period_days: number;
  atomic_updates: boolean;
  backup_before_update: boolean;
}

export interface LearningCycle {
  cycle_id: string;
  timestamp: string;
  session_events_processed: number;
  insights: LearningInsights;
  dgts_updates: DGTSUpdate;
  validation_evolution: RuleEvolution;
  agent_optimizations: BehaviorOptimization[];
  applied_successfully: boolean;
  rollback_performed: boolean;
  errors: string[];
}

export interface LearningReport {
  cycle: LearningCycle;
  summary: string;
  improvements: string[];
  warnings: string[];
}

function getLearningConfigPath(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  return join(homeDir!, ".claude", "validation", "learning_config.yaml");
}

function getLearningHistoryPath(): string {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  return join(homeDir!, ".claude", "validation", "learning_history.json");
}

async function loadLearningConfig(): Promise<LearningConfig> {
  const configPath = getLearningConfigPath();

  try {
    const content = await readFile(configPath, "utf-8");
    const config: LearningConfig = {
      enabled: true,
      min_pattern_frequency: 2,
      dgts_confidence_threshold: 0.7,
      validation_effectiveness_threshold: 0.7,
      agent_optimization_confidence_threshold: 0.7,
      learning_period_days: 7,
      atomic_updates: true,
      backup_before_update: true,
    };

    const lines = content.split("\n");
    for (const line of lines) {
      if (line.includes("enabled:")) config.enabled = line.includes("true");
      if (line.includes("min_pattern_frequency:")) {
        const match = line.match(/min_pattern_frequency:\s*(\d+)/);
        if (match) config.min_pattern_frequency = parseInt(match[1]);
      }
      if (line.includes("dgts_confidence_threshold:")) {
        const match = line.match(/dgts_confidence_threshold:\s*([\d.]+)/);
        if (match) config.dgts_confidence_threshold = parseFloat(match[1]);
      }
      if (line.includes("validation_effectiveness_threshold:")) {
        const match = line.match(/validation_effectiveness_threshold:\s*([\d.]+)/);
        if (match) config.validation_effectiveness_threshold = parseFloat(match[1]);
      }
      if (line.includes("agent_optimization_confidence_threshold:")) {
        const match = line.match(/agent_optimization_confidence_threshold:\s*([\d.]+)/);
        if (match) config.agent_optimization_confidence_threshold = parseFloat(match[1]);
      }
      if (line.includes("learning_period_days:")) {
        const match = line.match(/learning_period_days:\s*(\d+)/);
        if (match) config.learning_period_days = parseInt(match[1]);
      }
      if (line.includes("atomic_updates:")) config.atomic_updates = line.includes("true");
      if (line.includes("backup_before_update:")) config.backup_before_update = line.includes("true");
    }
    return config;
  } catch {
    return {
      enabled: true,
      min_pattern_frequency: 2,
      dgts_confidence_threshold: 0.7,
      validation_effectiveness_threshold: 0.7,
      agent_optimization_confidence_threshold: 0.7,
      learning_period_days: 7,
      atomic_updates: true,
      backup_before_update: true,
    };
  }
}

async function createBackup(): Promise<string> {
  const homeDir = process.env.HOME || process.env.USERPROFILE!;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = join(homeDir, ".claude", "validation", "backups", timestamp);

  await mkdir(backupDir, { recursive: true });

  const filesToBackup = [
    "dgts_patterns.yaml",
    "validation_rules.yaml",
    "agent_configs.yaml",
    "dgts_learning_log.json",
    "rule_effectiveness_log.json",
    "agent_performance_log.json",
  ];

  for (const filename of filesToBackup) {
    const sourcePath = join(homeDir, ".claude", "validation", filename);
    const destPath = join(backupDir, filename);
    try {
      await copyFile(sourcePath, destPath);
    } catch {
      // File doesn't exist, skip
    }
  }

  console.log(`[learn-and-update] Created backup: ${backupDir}`);
  return backupDir;
}

async function restoreFromBackup(backupDir: string): Promise<void> {
  const homeDir = process.env.HOME || process.env.USERPROFILE!;

  const filesToRestore = [
    "dgts_patterns.yaml",
    "validation_rules.yaml",
    "agent_configs.yaml",
    "dgts_learning_log.json",
    "rule_effectiveness_log.json",
    "agent_performance_log.json",
  ];

  for (const filename of filesToRestore) {
    const sourcePath = join(backupDir, filename);
    const destPath = join(homeDir, ".claude", "validation", filename);
    try {
      await copyFile(sourcePath, destPath);
    } catch {
      // Backup file doesn't exist, skip
    }
  }

  console.log(`[learn-and-update] Restored from backup: ${backupDir}`);
}

export async function runLearningCycle(config: LearningConfig): Promise<LearningCycle> {
  const cycleId = `cycle_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const errors: string[] = [];

  console.log(`[learn-and-update] Starting learning cycle: ${cycleId}`);

  const homeDir = process.env.HOME || process.env.USERPROFILE!;
  const rawOutputsDir = join(homeDir, ".claude", "history", "raw-outputs");

  const sinceDate = new Date(Date.now() - config.learning_period_days * 24 * 60 * 60 * 1000);
  const events = await parseSessionEvents(rawOutputsDir, sinceDate);

  console.log(`[learn-and-update] Processed ${events.length} session events`);

  const patterns = await extractPatterns(events, config.min_pattern_frequency);
  const insights = await generateInsights(patterns);

  console.log(`[learn-and-update] Identified ${patterns.length} patterns`);

  let dgtsUpdates: DGTSUpdate = { new_rules: [], updated_rules: [], deprecated_rules: [] };
  try {
    const gamingAttempts = await detectGamingAttempts(events);
    if (gamingAttempts.length > 0) {
      const gamingRules = await analyzeGamingPatterns(gamingAttempts);
      dgtsUpdates = await updateDGTSConfig(gamingRules, "");
      console.log(`[learn-and-update] DGTS: ${dgtsUpdates.new_rules.length} new rules`);
    }
  } catch (error: any) {
    errors.push(`DGTS learning failed: ${error.message}`);
    console.error(`[learn-and-update] DGTS learning error:`, error);
  }

  let validationEvolution: RuleEvolution = {
    new_rules: [],
    updated_rules: [],
    deprecated_rules: [],
    effectiveness_report: new Map(),
  };
  try {
    const validationFailures = await extractValidationFailures(events);
    if (validationFailures.length > 0) {
      const recurringErrors = await identifyRecurringErrors(validationFailures, 2);
      const newRules = await Promise.all(
        recurringErrors.map((f) => generateValidationRule(f))
      );
      validationEvolution = await evolveValidationConfig(newRules, []);
      console.log(`[learn-and-update] Validation: ${validationEvolution.new_rules.length} new rules`);
    }
  } catch (error: any) {
    errors.push(`Validation evolution failed: ${error.message}`);
    console.error(`[learn-and-update] Validation evolution error:`, error);
  }

  let agentOptimizations: BehaviorOptimization[] = [];
  try {
    const executions = await trackAgentExecutions(events);
    if (executions.length > 0) {
      const performances = await calculateAgentPerformance(executions);
      agentOptimizations = await identifyOptimalBehaviors(performances);

      const highConfidenceOpts = agentOptimizations.filter(
        (opt) => opt.confidence >= config.agent_optimization_confidence_threshold
      );

      if (highConfidenceOpts.length > 0) {
        await updateAgentConfigs(highConfidenceOpts);
        console.log(`[learn-and-update] Agent optimization: ${highConfidenceOpts.length} updates`);
      }
    }
  } catch (error: any) {
    errors.push(`Agent optimization failed: ${error.message}`);
    console.error(`[learn-and-update] Agent optimization error:`, error);
  }

  return {
    cycle_id: cycleId,
    timestamp: new Date().toISOString(),
    session_events_processed: events.length,
    insights,
    dgts_updates: dgtsUpdates,
    validation_evolution: validationEvolution,
    agent_optimizations: agentOptimizations,
    applied_successfully: errors.length === 0,
    rollback_performed: false,
    errors,
  };
}

export async function generateLearningReport(cycle: LearningCycle): Promise<LearningReport> {
  const improvements: string[] = [];
  const warnings: string[] = [];

  if (cycle.dgts_updates.new_rules.length > 0) {
    improvements.push(`Added ${cycle.dgts_updates.new_rules.length} new DGTS gaming pattern(s)`);
  }

  if (cycle.validation_evolution.new_rules.length > 0) {
    improvements.push(`Added ${cycle.validation_evolution.new_rules.length} new validation rule(s)`);
  }

  if (cycle.agent_optimizations.length > 0) {
    const applied = cycle.agent_optimizations.filter((opt) => opt.confidence >= 0.7).length;
    improvements.push(`Optimized ${applied} agent configuration(s)`);
  }

  if (cycle.insights.new_patterns.length > 0) {
    warnings.push(`${cycle.insights.new_patterns.length} new pattern(s) detected - review recommended`);
  }

  if (cycle.insights.anomalies.length > 0) {
    warnings.push(`${cycle.insights.anomalies.length} anomalous event(s) detected`);
  }

  if (cycle.errors.length > 0) {
    warnings.push(`${cycle.errors.length} component(s) failed - check logs`);
  }

  const summary = improvements.length > 0
    ? `Learning cycle completed successfully with ${improvements.length} improvement(s)`
    : "Learning cycle completed with no actionable improvements";

  return {
    cycle,
    summary,
    improvements,
    warnings,
  };
}

async function saveLearningHistory(cycle: LearningCycle): Promise<void> {
  const historyPath = getLearningHistoryPath();

  const dir = join(
    process.env.HOME || process.env.USERPROFILE!,
    ".claude",
    "validation"
  );
  await mkdir(dir, { recursive: true });

  let history: LearningCycle[] = [];
  try {
    const content = await readFile(historyPath, "utf-8");
    history = JSON.parse(content);
  } catch {
    // No existing history
  }

  history.push(cycle);

  const trimmed = history.slice(-50);

  await writeFile(historyPath, JSON.stringify(trimmed, null, 2), "utf-8");
}

async function main() {
  console.log("[learn-and-update] PAI Session Learning System");

  const config = await loadLearningConfig();

  if (!config.enabled) {
    console.log("[learn-and-update] Learning system is disabled");
    process.exit(0);
  }

  let backupDir: string | undefined;

  try {
    if (config.backup_before_update) {
      backupDir = await createBackup();
    }

    const cycle = await runLearningCycle(config);

    const report = await generateLearningReport(cycle);

    await saveLearningHistory(cycle);

    console.log("\n=== LEARNING CYCLE REPORT ===\n");
    console.log(`Cycle ID: ${cycle.cycle_id}`);
    console.log(`Events Processed: ${cycle.session_events_processed}`);
    console.log(`Status: ${cycle.applied_successfully ? "SUCCESS" : "PARTIAL FAILURE"}`);
    console.log();

    if (report.improvements.length > 0) {
      console.log("Improvements:");
      for (const improvement of report.improvements) {
        console.log(`  ✅ ${improvement}`);
      }
      console.log();
    }

    if (report.warnings.length > 0) {
      console.log("Warnings:");
      for (const warning of report.warnings) {
        console.log(`  ⚠️  ${warning}`);
      }
      console.log();
    }

    if (!cycle.applied_successfully && backupDir && config.atomic_updates) {
      console.log("⚠️  Errors detected - rolling back changes...");
      await restoreFromBackup(backupDir);
      console.log("✅ Rollback complete");
    }

    console.log("[learn-and-update] ✅ Learning cycle complete");
    process.exit(0);
  } catch (error: any) {
    console.error("[learn-and-update] ❌ Fatal error:", error.message);

    if (backupDir && config.atomic_updates) {
      console.log("⚠️  Fatal error - rolling back changes...");
      await restoreFromBackup(backupDir);
      console.log("✅ Rollback complete");
    }

    process.exit(0);
  }
}

if (import.meta.main) {
  main();
}
