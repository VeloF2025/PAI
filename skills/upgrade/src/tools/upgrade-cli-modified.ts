#!/usr/bin/env bun
/**
 * PAI Upgrade CLI - Self-Improvement Engine
 *
 * Monitors external sources for PAI improvements and applies them automatically.
 *
 * Usage:
 *   bun run upgrade-cli.ts --full              # Full upgrade cycle
 *   bun run upgrade-cli.ts --scan-only         # Scan sources only
 *   bun run upgrade-cli.ts --apply             # Apply improvements
 *   bun run upgrade-cli.ts --rollback          # Rollback last upgrade
 *   bun run upgrade-cli.ts --list-sources      # List configured sources
 *   bun run upgrade-cli.ts --history           # Show upgrade history
 */

import { parseArgs } from "util";
import { readFile, writeFile, mkdir, access, rm } from "fs/promises";
import { join, dirname } from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { createHash } from "crypto";

import { AnthropicBlogScraper } from "./scrapers/index.ts";
const execAsync = promisify(exec);

// ============================================================================
// Configuration
// ============================================================================

const PAI_DIR = process.env.PAI_DIR || join(process.env.HOME || "", ".claude");
const UPGRADE_DIR = join(PAI_DIR, "history", "upgrades");
const SCANS_DIR = join(UPGRADE_DIR, "scans");
const ANALYSES_DIR = join(UPGRADE_DIR, "analyses");
const DEPRECATED_DIR = join(UPGRADE_DIR, "deprecated");
const CONFIG_PATH = join(PAI_DIR, "skills", "upgrade", "config.json");

// ============================================================================
// Types
// ============================================================================

interface Source {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4;
  url: string;
  type: "api" | "rss" | "web";
  scan_frequency: "daily" | "weekly" | "monthly";
  last_scanned?: string;
  enabled: boolean;
}

interface Finding {
  id: string;
  source: string;
  type: "article" | "release" | "commit" | "video" | "post";
  date: string;
  url: string;
  title: string;
  summary: string;
  relevance: "high" | "medium" | "low";
  category: "prompting" | "skills" | "architecture" | "tools" | "security";
  keywords: string[];
  code_examples?: { language: string; code: string }[];
  action_items?: string[];
}

interface ScanResult {
  scan_id: string;
  scan_date: string;
  sources_scanned: string[];
  total_findings: number;
  by_relevance: { high: number; medium: number; low: number };
  by_category: Record<string, number>;
  findings: Finding[];
}

interface ImprovementSuggestion {
  id: string;
  title: string;
  description: string;
  source_finding_id: string;
  gap_type: string;
  impact: { score: "high" | "medium" | "low"; reasoning: string };
  risk: { score: "high" | "medium" | "low"; reasoning: string };
  effort: { score: "high" | "medium" | "low"; estimated_files: number };
  implementation: {
    files_to_create: string[];
    files_to_modify: string[];
    dependencies: string[];
    breaking_changes: boolean;
  };
  approval_required: boolean;
  auto_approvable: boolean;
}

interface Analysis {
  analysis_id: string;
  analysis_date: string;
  scan_id: string;
  pai_state_snapshot: any;
  gaps_identified: any[];
  suggestions: ImprovementSuggestion[];
  priority_ranking: { suggestion_id: string; priority_score: number }[];
  auto_approvable_count: number;
  requires_review_count: number;
}

// ============================================================================
// CLI Arguments
// ============================================================================

const { values: args } = parseArgs({
  options: {
    full: { type: "boolean", default: false },
    "scan-only": { type: "boolean", default: false },
    apply: { type: "boolean", default: false },
    rollback: { type: "boolean", default: false },
    "list-sources": { type: "boolean", default: false },
    history: { type: "boolean", default: false },
    source: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    "auto-approve": { type: "boolean", default: false },
    verbose: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
  allowPositionals: false,
});

// ============================================================================
// Utilities
// ============================================================================

function generateId(): string {
  return createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex")
    .substring(0, 16);
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function formatTimestamp(date: Date = new Date()): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z/, "")
    .replace("T", "-");
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

function log(message: string, level: "info" | "warn" | "error" = "info"): void {
  const prefix = {
    info: "ℹ️",
    warn: "⚠️",
    error: "❌",
  }[level];

  console.log(`${prefix} ${message}`);
}

function verbose(message: string): void {
  if (args.verbose) {
    console.log(`  ${message}`);
  }
}

// ============================================================================
// Source Management
// ============================================================================

async function loadConfig(): Promise<Source[]> {
  const configExists = await fileExists(CONFIG_PATH);

  if (!configExists) {
    // Create default config
    const defaultConfig: Source[] = [
      {
        id: "anthropic-blog",
        name: "Anthropic Engineering Blog",
        tier: 1,
        url: "https://www.anthropic.com/news",
        type: "web",
        scan_frequency: "daily",
        enabled: true,
      },
      {
        id: "claude-code-github",
        name: "Claude Code GitHub Releases",
        tier: 1,
        url: "https://github.com/anthropics/claude-code/releases",
        type: "api",
        scan_frequency: "daily",
        enabled: true,
      },
      {
        id: "anthropic-docs",
        name: "Anthropic Documentation",
        tier: 1,
        url: "https://docs.anthropic.com/",
        type: "web",
        scan_frequency: "daily",
        enabled: true,
      },
      {
        id: "daniel-repo",
        name: "Daniel Miessler's PAI",
        tier: 2,
        url: "https://github.com/danielmiessler/Personal_AI_Infrastructure",
        type: "api",
        scan_frequency: "weekly",
        enabled: true,
      },
      {
        id: "indiedevdan-youtube",
        name: "IndieDevDan YouTube",
        tier: 3,
        url: "https://www.youtube.com/@IndieDevDan",
        type: "api",
        scan_frequency: "weekly",
        enabled: true,
      },
      {
        id: "trailofbits-blog",
        name: "Trail of Bits Blog",
        tier: 4,
        url: "https://blog.trailofbits.com/",
        type: "rss",
        scan_frequency: "monthly",
        enabled: true,
      },
    ];

    await ensureDir(dirname(CONFIG_PATH));
    await writeFile(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }

  const content = await readFile(CONFIG_PATH, "utf-8");
  const config = JSON.parse(content);
  // Handle both formats: array of sources or object with sources property
  return Array.isArray(config) ? config : (config.sources as Source[]);
}

async function saveConfig(sources: Source[]): Promise<void> {
  await writeFile(CONFIG_PATH, JSON.stringify(sources, null, 2));
}

async function listSources(): Promise<void> {
  const sources = await loadConfig();

  console.log("📋 Configured Sources:\n");

  for (const source of sources) {
    const status = source.enabled ? "✓" : "✗";
    const lastScanned = source.last_scanned
      ? `Last: ${new Date(source.last_scanned).toLocaleDateString()}`
      : "Never scanned";

    console.log(
      `  [${status}] ${source.name} (Tier ${source.tier}, ${source.scan_frequency})`
    );
    console.log(`      ${lastScanned}`);
    console.log(`      ${source.url}\n`);
  }
}

// ============================================================================
// Scanning
// ============================================================================

async function scanSources(sourceFilter?: string): Promise<ScanResult> {
  log("🔍 Scanning external sources for PAI improvements...");

  const sources = await loadConfig();
  const filteredSources = sourceFilter
    ? sources.filter((s) => s.id === sourceFilter)
    : sources.filter((s) => s.enabled);

  if (filteredSources.length === 0) {
    throw new Error(
      sourceFilter ? `Source "${sourceFilter}" not found` : "No enabled sources"
    );
  }

  verbose(`Scanning ${filteredSources.length} sources...`);

  const allFindings: Finding[] = [];

  for (const source of filteredSources) {
    verbose(`Scanning: ${source.name}...`);

    try {
      const findings = await scanSource(source);
      allFindings.push(...findings);

      // Update last_scanned timestamp
      source.last_scanned = getTimestamp();
      verbose(`  Found ${findings.length} items`);
    } catch (error) {
      log(`Failed to scan ${source.name}: ${error}`, "warn");
    }
  }

  // Save updated config with last_scanned timestamps
  await saveConfig(sources);

  // Categorize findings
  const byRelevance = {
    high: allFindings.filter((f) => f.relevance === "high").length,
    medium: allFindings.filter((f) => f.relevance === "medium").length,
    low: allFindings.filter((f) => f.relevance === "low").length,
  };

  const byCategory: Record<string, number> = {};
  for (const finding of allFindings) {
    byCategory[finding.category] = (byCategory[finding.category] || 0) + 1;
  }

  const scanResult: ScanResult = {
    scan_id: generateId(),
    scan_date: getTimestamp(),
    sources_scanned: filteredSources.map((s) => s.id),
    total_findings: allFindings.length,
    by_relevance: byRelevance,
    by_category: byCategory,
    findings: allFindings,
  };

  // Save scan results
  await ensureDir(SCANS_DIR);
  const scanFilePath = join(
    SCANS_DIR,
    `${formatTimestamp()}_scan-results.json`
  );
  await writeFile(scanFilePath, JSON.stringify(scanResult, null, 2));

  log(`✅ Scan complete! Found ${allFindings.length} items`);
  log(`   High: ${byRelevance.high}, Medium: ${byRelevance.medium}, Low: ${byRelevance.low}`);
  log(`   Saved to: ${scanFilePath}`);

  return scanResult;
}

async function scanSource(source: Source): Promise<Finding[]> {
  // This is a placeholder implementation
  // In production, this would call actual scraping logic based on source type

  verbose(`  Fetching from: ${source.url}`);

  // Simulated findings - replace with actual scraping
  const findings: Finding[] = [];

  // For now, return empty array
  // TODO: Implement actual scraping for each source type
  //   - API sources: Use GitHub API, YouTube Data API, etc.
  //   - RSS sources: Parse RSS feeds
  //   - Web sources: Scrape HTML with cheerio/jsdom

  return findings;
}

// ============================================================================
// Analysis
// ============================================================================

async function analyzeImprovements(): Promise<Analysis> {
  log("🔍 Analyzing scan results for improvement opportunities...");

  // Load latest scan
  const scanFiles = await Bun.file(SCANS_DIR).exists()
    ? (await execAsync(`ls -t "${SCANS_DIR}"/*.json`)).stdout.trim().split("\n")
    : [];

  if (scanFiles.length === 0) {
    throw new Error("No scan results found. Run --scan-only first.");
  }

  const latestScanPath = scanFiles[0];
  verbose(`Loading scan: ${latestScanPath}`);

  const scanContent = await readFile(latestScanPath, "utf-8");
  const scanResult: ScanResult = JSON.parse(scanContent);

  // Load PAI state snapshot
  verbose("Building PAI state snapshot...");
  const paiState = await buildPAIStateSnapshot();

  // Analyze gaps
  verbose("Identifying gaps...");
  const gaps = await identifyGaps(scanResult.findings, paiState);

  // Generate suggestions
  verbose("Generating improvement suggestions...");
  const suggestions = await generateSuggestions(gaps, scanResult.findings);

  // Rank suggestions
  verbose("Ranking by priority...");
  const priorityRanking = rankSuggestions(suggestions);

  const analysis: Analysis = {
    analysis_id: generateId(),
    analysis_date: getTimestamp(),
    scan_id: scanResult.scan_id,
    pai_state_snapshot: paiState,
    gaps_identified: gaps,
    suggestions,
    priority_ranking: priorityRanking,
    auto_approvable_count: suggestions.filter((s) => s.auto_approvable).length,
    requires_review_count: suggestions.filter((s) => !s.auto_approvable).length,
  };

  // Save analysis
  await ensureDir(ANALYSES_DIR);
  const analysisPath = join(
    ANALYSES_DIR,
    `${formatTimestamp()}_analysis.json`
  );
  await writeFile(analysisPath, JSON.stringify(analysis, null, 2));

  log(`✅ Analysis complete!`);
  log(`   Suggestions: ${suggestions.length}`);
  log(`   Auto-approvable: ${analysis.auto_approvable_count}`);
  log(`   Requires review: ${analysis.requires_review_count}`);
  log(`   Saved to: ${analysisPath}`);

  return analysis;
}

async function buildPAIStateSnapshot(): Promise<any> {
  // TODO: Implement actual PAI state snapshot
  // Should read:
  //   - skills/*/SKILL.md files
  //   - settings.json hooks
  //   - CONSTITUTION.md
  //   - Available CLI tools

  return {
    skills_count: 36,
    hooks_count: 60,
    constitution_version: "2.0",
    // ... more state data
  };
}

async function identifyGaps(findings: Finding[], paiState: any): Promise<any[]> {
  // TODO: Implement gap analysis logic
  // Compare findings against current PAI state
  // Return list of gaps (missing features, outdated patterns, etc.)

  return [];
}

async function generateSuggestions(
  gaps: any[],
  findings: Finding[]
): Promise<ImprovementSuggestion[]> {
  // TODO: Implement suggestion generation
  // For each gap, create an improvement suggestion

  return [];
}

function rankSuggestions(
  suggestions: ImprovementSuggestion[]
): { suggestion_id: string; priority_score: number }[] {
  return suggestions.map((s) => {
    const impactScore = s.impact.score === "high" ? 3 : s.impact.score === "medium" ? 2 : 1;
    const riskScore = s.risk.score === "high" ? 3 : s.risk.score === "medium" ? 2 : 1;
    const effortScore = s.effort.score === "high" ? 3 : s.effort.score === "medium" ? 2 : 1;

    // Priority = (Impact × 2) + (10 - Risk × 2) + (10 - Effort × 2)
    const priorityScore =
      impactScore * 2 + (10 - riskScore * 2) + (10 - effortScore * 2);

    return {
      suggestion_id: s.id,
      priority_score: priorityScore,
    };
  });
}

// ============================================================================
// Apply Upgrades
// ============================================================================

async function applyUpgrades(): Promise<void> {
  log("🚀 Applying approved upgrades...");

  // TODO: Implement upgrade application
  // 1. Load approved analysis
  // 2. Pre-upgrade validation
  // 3. Create backup
  // 4. Apply changes atomically
  // 5. Post-upgrade verification
  // 6. Generate report

  log("⚠️  Upgrade application not yet implemented", "warn");
  log("   This feature will apply improvements automatically");
  log("   For now, review analysis results and apply manually");
}

// ============================================================================
// Rollback
// ============================================================================

async function rollback(): Promise<void> {
  log("🔄 Rolling back last upgrade...");

  // TODO: Implement rollback logic
  // 1. Find latest backup in deprecated/
  // 2. Run rollback script
  // 3. Verify rollback success

  log("⚠️  Rollback not yet implemented", "warn");
}

// ============================================================================
// History
// ============================================================================

async function showHistory(): Promise<void> {
  log("📚 Upgrade History\n");

  // TODO: Implement history display
  // Show list of past upgrades with:
  //   - Date
  //   - Title
  //   - Status (success/failed/rolled back)
  //   - Files modified
  //   - Impact

  log("⚠️  History display not yet implemented", "warn");
}

// ============================================================================
// Help
// ============================================================================

function showHelp(): void {
  console.log(`
PAI Upgrade CLI - Self-Improvement Engine

Usage:
  bun run upgrade-cli.ts [command] [options]

Commands:
  --full              Run full upgrade cycle (scan → analyze → apply)
  --scan-only         Scan sources for new findings
  --apply             Apply approved improvements
  --rollback          Rollback last upgrade
  --list-sources      List configured sources
  --history           Show upgrade history
  --help              Show this help message

Options:
  --source <id>       Scan specific source only
  --dry-run           Show what would change without applying
  --auto-approve      Skip manual approval (USE WITH CAUTION)
  --verbose           Detailed logging

Examples:
  # Scan all sources
  bun run upgrade-cli.ts --scan-only

  # Scan specific source
  bun run upgrade-cli.ts --scan-only --source anthropic-blog

  # Run full upgrade with approval
  bun run upgrade-cli.ts --full

  # Apply improvements (after manual review)
  bun run upgrade-cli.ts --apply

  # List configured sources
  bun run upgrade-cli.ts --list-sources
  `);
}

// ============================================================================
// Full Upgrade Cycle
// ============================================================================

async function fullUpgrade(): Promise<void> {
  log("🔄 Running full upgrade cycle...\n");

  try {
    // 1. Scan sources
    log("📡 Phase 1: Scanning sources");
    const scanResult = await scanSources();

    if (scanResult.total_findings === 0) {
      log("✅ No new findings. PAI is up to date!");
      return;
    }

    // 2. Analyze improvements
    log("\n📊 Phase 2: Analyzing improvements");
    const analysis = await analyzeImprovements();

    if (analysis.suggestions.length === 0) {
      log("✅ No improvement suggestions. PAI already implements all findings!");
      return;
    }

    // 3. User approval (if not auto-approve)
    if (!args["auto-approve"]) {
      log("\n⏸️  Phase 3: User approval required");
      log("   Review suggestions and run with --apply to proceed");
      return;
    }

    // 4. Apply upgrades
    log("\n⚡ Phase 4: Applying upgrades");
    await applyUpgrades();

    log("\n✅ Full upgrade cycle complete!");
  } catch (error) {
    log(`Upgrade cycle failed: ${error}`, "error");
    process.exit(1);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  try {
    // Ensure required directories exist
    await ensureDir(SCANS_DIR);
    await ensureDir(ANALYSES_DIR);
    await ensureDir(DEPRECATED_DIR);

    if (args.help) {
      showHelp();
    } else if (args["list-sources"]) {
      await listSources();
    } else if (args["scan-only"]) {
      await scanSources(args.source);
    } else if (args.apply) {
      await applyUpgrades();
    } else if (args.rollback) {
      await rollback();
    } else if (args.history) {
      await showHistory();
    } else if (args.full) {
      await fullUpgrade();
    } else {
      showHelp();
    }
  } catch (error) {
    log(`Error: ${error}`, "error");
    if (args.verbose && error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
