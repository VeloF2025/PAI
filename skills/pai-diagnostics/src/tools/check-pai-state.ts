#!/usr/bin/env bun
/**
 * CheckPAIState - PAI Health Diagnostics Tool
 *
 * Validates PAI installation health across all subsystems:
 * - Installation & Environment
 * - Hook System
 * - MCP Servers
 * - Skill System
 * - History & Observability
 * - Memory System
 * - Protocol System
 *
 * Usage: bun check-pai-state.ts [--json] [--verbose]
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

// ============================================================================
// Types
// ============================================================================

interface DiagnosticResult {
  category: string;
  status: 'ok' | 'warning' | 'error' | 'unchecked';
  message: string;
  details?: string[];
  count?: { found: number; expected: number };
}

interface HealthReport {
  timestamp: string;
  paiDir: string;
  results: DiagnosticResult[];
  issues: string[];
  recommendations: string[];
  summary: {
    ok: number;
    warning: number;
    error: number;
    unchecked: number;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const PAI_DIR = process.env.PAI_DIR || join(homedir(), '.claude');

const REQUIRED_DIRS = [
  'hooks',
  'skills',
  'memories',
  'history',
  'protocols',
  'history/raw-outputs',
];

const EXPECTED_HOOK_TYPES = [
  'PreToolUse',
  'PostToolUse',
  'SessionStart',
  'SessionEnd',
  'Stop',
  'SubagentStop',
  'UserPromptSubmit',
  'PreCompact',
];

const EXPECTED_MCPS = [
  'context7',
  'sequential-thinking',
  'memory',
  'playwright',
  'github',
  'chrome-devtools',
];

const EXPECTED_PROTOCOLS = [
  'dgts-validation.md',
  'nlnh-protocol.md',
  'doc-driven-tdd.md',
  'chrome-devtools-testing.md',
  'antihall-validator.md',
  'zero-tolerance-quality.md',
  'forbidden-commands.md',
];

// ============================================================================
// Utility Functions
// ============================================================================

function getStatusIcon(status: DiagnosticResult['status']): string {
  switch (status) {
    case 'ok': return '\x1b[32m✅\x1b[0m';
    case 'warning': return '\x1b[33m⚠️\x1b[0m';
    case 'error': return '\x1b[31m❌\x1b[0m';
    case 'unchecked': return '⬜';
  }
}

function fileExists(path: string): boolean {
  try {
    return existsSync(path);
  } catch {
    return false;
  }
}

function dirExists(path: string): boolean {
  try {
    return existsSync(path) && statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function countFiles(dir: string, pattern?: RegExp): number {
  try {
    if (!dirExists(dir)) return 0;
    const files = readdirSync(dir, { recursive: true });
    if (pattern) {
      return files.filter(f => pattern.test(String(f))).length;
    }
    return files.length;
  } catch {
    return 0;
  }
}

function readJsonFile(path: string): any {
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function getRecentFiles(dir: string, hours: number = 24): string[] {
  try {
    if (!dirExists(dir)) return [];
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const files: string[] = [];

    const checkDir = (d: string) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const fullPath = join(d, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else {
          const stat = statSync(fullPath);
          if (stat.mtimeMs > cutoff) {
            files.push(fullPath);
          }
        }
      }
    };

    checkDir(dir);
    return files;
  } catch {
    return [];
  }
}

// ============================================================================
// Diagnostic Checks
// ============================================================================

function checkInstallation(): DiagnosticResult {
  const issues: string[] = [];
  let foundCount = 0;

  // Check PAI_DIR exists
  if (!dirExists(PAI_DIR)) {
    return {
      category: 'Installation',
      status: 'error',
      message: `PAI directory not found: ${PAI_DIR}`,
      details: ['Set PAI_DIR environment variable or ensure ~/.claude exists'],
    };
  }

  // Check required directories
  for (const dir of REQUIRED_DIRS) {
    const fullPath = join(PAI_DIR, dir);
    if (dirExists(fullPath)) {
      foundCount++;
    } else {
      issues.push(`Missing directory: ${dir}`);
    }
  }

  // Check settings.json
  const settingsPath = join(PAI_DIR, 'settings.json');
  if (!fileExists(settingsPath)) {
    issues.push('Missing settings.json');
  } else {
    const settings = readJsonFile(settingsPath);
    if (!settings) {
      issues.push('Invalid settings.json (JSON parse error)');
    }
  }

  if (issues.length === 0) {
    return {
      category: 'Installation',
      status: 'ok',
      message: 'All core directories present',
      count: { found: foundCount, expected: REQUIRED_DIRS.length },
    };
  }

  return {
    category: 'Installation',
    status: issues.length > 2 ? 'error' : 'warning',
    message: `${foundCount}/${REQUIRED_DIRS.length} directories present`,
    details: issues,
    count: { found: foundCount, expected: REQUIRED_DIRS.length },
  };
}

function checkHooks(): DiagnosticResult {
  const settingsPath = join(PAI_DIR, 'settings.json');
  const settings = readJsonFile(settingsPath);

  if (!settings?.hooks) {
    return {
      category: 'Hooks',
      status: 'error',
      message: 'No hooks configured in settings.json',
    };
  }

  const configuredTypes = Object.keys(settings.hooks);
  const missingTypes = EXPECTED_HOOK_TYPES.filter(t => !configuredTypes.includes(t));

  // Count total hooks
  let totalHooks = 0;
  let brokenHooks: string[] = [];

  for (const [type, configs] of Object.entries(settings.hooks)) {
    if (Array.isArray(configs)) {
      for (const config of configs as any[]) {
        if (config.hooks && Array.isArray(config.hooks)) {
          for (const hook of config.hooks) {
            totalHooks++;
            // Check if hook file exists (extract path from command)
            if (hook.command) {
              const match = hook.command.match(/([^\s]+\.ts)/);
              if (match && !fileExists(match[1])) {
                brokenHooks.push(match[1]);
              }
            }
          }
        }
      }
    }
  }

  const details: string[] = [];
  if (missingTypes.length > 0) {
    details.push(`Missing hook types: ${missingTypes.join(', ')}`);
  }
  if (brokenHooks.length > 0) {
    details.push(`Broken hooks: ${brokenHooks.slice(0, 3).join(', ')}${brokenHooks.length > 3 ? '...' : ''}`);
  }

  if (missingTypes.length === 0 && brokenHooks.length === 0) {
    return {
      category: 'Hooks',
      status: 'ok',
      message: `${totalHooks} hooks configured across ${configuredTypes.length} event types`,
      count: { found: configuredTypes.length, expected: EXPECTED_HOOK_TYPES.length },
    };
  }

  return {
    category: 'Hooks',
    status: brokenHooks.length > 0 ? 'warning' : 'ok',
    message: `${totalHooks} hooks, ${configuredTypes.length}/${EXPECTED_HOOK_TYPES.length} event types`,
    details,
    count: { found: configuredTypes.length, expected: EXPECTED_HOOK_TYPES.length },
  };
}

function checkMCPs(): DiagnosticResult {
  const settingsPath = join(PAI_DIR, 'settings.json');
  const settings = readJsonFile(settingsPath);

  if (!settings?.mcpServers) {
    return {
      category: 'MCPs',
      status: 'error',
      message: 'No MCP servers configured',
    };
  }

  const configured = Object.keys(settings.mcpServers);
  const missing = EXPECTED_MCPS.filter(m => !configured.includes(m));
  const extra = configured.filter(m => !EXPECTED_MCPS.includes(m));

  const details: string[] = [];
  if (missing.length > 0) {
    details.push(`Missing: ${missing.join(', ')}`);
  }
  if (extra.length > 0) {
    details.push(`Additional: ${extra.join(', ')}`);
  }

  // Try to check MCP connection status
  let connectedCount = 0;
  try {
    const result = execSync('claude mcp list 2>&1', { encoding: 'utf-8', timeout: 5000 });
    const connected = result.match(/✓ Connected/g);
    connectedCount = connected?.length || 0;
  } catch {
    // Can't check connection status
  }

  if (missing.length === 0) {
    return {
      category: 'MCPs',
      status: 'ok',
      message: `${configured.length} MCPs configured${connectedCount > 0 ? `, ${connectedCount} connected` : ''}`,
      details: details.length > 0 ? details : undefined,
      count: { found: configured.length, expected: EXPECTED_MCPS.length },
    };
  }

  return {
    category: 'MCPs',
    status: 'warning',
    message: `${configured.length}/${EXPECTED_MCPS.length} expected MCPs`,
    details,
    count: { found: configured.length - missing.length, expected: EXPECTED_MCPS.length },
  };
}

function checkSkills(): DiagnosticResult {
  const skillsDir = join(PAI_DIR, 'skills');

  if (!dirExists(skillsDir)) {
    return {
      category: 'Skills',
      status: 'error',
      message: 'Skills directory not found',
    };
  }

  const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let validSkills = 0;
  const invalidSkills: string[] = [];

  for (const skill of skillDirs) {
    const skillPath = join(skillsDir, skill, 'SKILL.md');
    if (fileExists(skillPath)) {
      validSkills++;
    } else {
      invalidSkills.push(skill);
    }
  }

  const details: string[] = [];
  if (invalidSkills.length > 0 && invalidSkills.length <= 5) {
    details.push(`Missing SKILL.md: ${invalidSkills.join(', ')}`);
  } else if (invalidSkills.length > 5) {
    details.push(`${invalidSkills.length} skills missing SKILL.md`);
  }

  return {
    category: 'Skills',
    status: invalidSkills.length > skillDirs.length / 2 ? 'warning' : 'ok',
    message: `${validSkills}/${skillDirs.length} skills with SKILL.md`,
    details: details.length > 0 ? details : undefined,
    count: { found: validSkills, expected: skillDirs.length },
  };
}

function checkHistory(): DiagnosticResult {
  const historyDir = join(PAI_DIR, 'history');
  const rawOutputsDir = join(historyDir, 'raw-outputs');

  if (!dirExists(rawOutputsDir)) {
    return {
      category: 'History',
      status: 'error',
      message: 'History raw-outputs directory not found',
    };
  }

  // Check for recent event files
  const recentFiles = getRecentFiles(rawOutputsDir, 24);
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthDir = join(rawOutputsDir, currentMonth);

  const details: string[] = [];

  if (!dirExists(currentMonthDir)) {
    details.push(`Current month directory missing: ${currentMonth}`);
  }

  if (recentFiles.length === 0) {
    return {
      category: 'History',
      status: 'warning',
      message: 'No events captured in last 24 hours',
      details: [
        ...details,
        'Event capture may not be running',
        'Check that capture-all-events.ts hook is configured',
      ],
    };
  }

  // Count total event files
  const monthDirs = readdirSync(rawOutputsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let totalEventFiles = 0;
  for (const month of monthDirs) {
    const monthPath = join(rawOutputsDir, month);
    totalEventFiles += readdirSync(monthPath).filter(f => f.endsWith('.jsonl')).length;
  }

  return {
    category: 'History',
    status: 'ok',
    message: `${totalEventFiles} event files across ${monthDirs.length} months`,
    details: recentFiles.length > 0 ? [`${recentFiles.length} files updated in last 24h`] : undefined,
  };
}

function checkMemory(): DiagnosticResult {
  const memoriesDir = join(PAI_DIR, 'memories');

  if (!dirExists(memoriesDir)) {
    return {
      category: 'Memory',
      status: 'error',
      message: 'Memories directory not found',
    };
  }

  const requiredFiles = ['current.md', 'archive.md', 'project-index.md'];
  const missing: string[] = [];

  for (const file of requiredFiles) {
    if (!fileExists(join(memoriesDir, file))) {
      missing.push(file);
    }
  }

  // Check for project memories
  const projectsDir = join(memoriesDir, 'projects');
  let projectCount = 0;
  if (dirExists(projectsDir)) {
    projectCount = readdirSync(projectsDir).filter(f => f.endsWith('.md')).length;
  }

  const details: string[] = [];
  if (missing.length > 0) {
    details.push(`Missing: ${missing.join(', ')}`);
  }
  if (projectCount > 0) {
    details.push(`${projectCount} project memories`);
  }

  if (missing.length === 0) {
    return {
      category: 'Memory',
      status: 'ok',
      message: `Memory system configured${projectCount > 0 ? ` with ${projectCount} projects` : ''}`,
      details: details.length > 0 ? details : undefined,
    };
  }

  return {
    category: 'Memory',
    status: missing.length > 1 ? 'error' : 'warning',
    message: `${requiredFiles.length - missing.length}/${requiredFiles.length} memory files present`,
    details,
  };
}

function checkProtocols(): DiagnosticResult {
  const protocolsDir = join(PAI_DIR, 'protocols');

  if (!dirExists(protocolsDir)) {
    return {
      category: 'Protocols',
      status: 'warning',
      message: 'Protocols directory not found',
      details: ['Progressive disclosure protocols may not be available'],
    };
  }

  const found: string[] = [];
  const missing: string[] = [];

  for (const protocol of EXPECTED_PROTOCOLS) {
    if (fileExists(join(protocolsDir, protocol))) {
      found.push(protocol);
    } else {
      missing.push(protocol);
    }
  }

  // Count additional protocols
  const allProtocols = readdirSync(protocolsDir).filter(f => f.endsWith('.md'));
  const extra = allProtocols.length - found.length;

  const details: string[] = [];
  if (missing.length > 0 && missing.length <= 3) {
    details.push(`Missing: ${missing.join(', ')}`);
  } else if (missing.length > 3) {
    details.push(`${missing.length} expected protocols missing`);
  }
  if (extra > 0) {
    details.push(`${extra} additional protocols`);
  }

  return {
    category: 'Protocols',
    status: missing.length === 0 ? 'ok' : (missing.length > 3 ? 'warning' : 'ok'),
    message: `${allProtocols.length} protocols (${found.length}/${EXPECTED_PROTOCOLS.length} expected)`,
    details: details.length > 0 ? details : undefined,
    count: { found: found.length, expected: EXPECTED_PROTOCOLS.length },
  };
}

function checkObservability(): DiagnosticResult {
  const obsDir = join(PAI_DIR, 'skills', 'agent-observability');

  if (!dirExists(obsDir)) {
    return {
      category: 'Observability',
      status: 'unchecked',
      message: 'Agent observability skill not installed',
    };
  }

  const requiredPaths = [
    'apps/server/src/index.ts',
    'apps/client/src/main.ts',
    'hooks/capture-all-events.ts',
  ];

  const found = requiredPaths.filter(p => fileExists(join(obsDir, p)));

  if (found.length === requiredPaths.length) {
    return {
      category: 'Observability',
      status: 'ok',
      message: 'Dashboard server and client available',
      details: ['Run: cd ~/.claude/skills/agent-observability && bun run dev'],
    };
  }

  return {
    category: 'Observability',
    status: 'warning',
    message: `${found.length}/${requiredPaths.length} components present`,
    details: ['Some observability components may be missing'],
  };
}

// ============================================================================
// Main Report Generation
// ============================================================================

function generateReport(): HealthReport {
  const results: DiagnosticResult[] = [
    checkInstallation(),
    checkHooks(),
    checkMCPs(),
    checkSkills(),
    checkHistory(),
    checkMemory(),
    checkProtocols(),
    checkObservability(),
  ];

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Collect issues and recommendations
  for (const result of results) {
    if (result.status === 'error') {
      issues.push(`${result.category}: ${result.message}`);
    }
    if (result.details) {
      for (const detail of result.details) {
        if (detail.startsWith('Missing') || detail.includes('not found')) {
          issues.push(`${result.category}: ${detail}`);
        }
      }
    }
  }

  // Generate recommendations based on issues
  if (results.find(r => r.category === 'History' && r.status === 'warning')) {
    recommendations.push('Check bun.exe is in PATH for hook execution');
    recommendations.push('Restart Claude Code to reinitialize hooks');
  }

  if (results.find(r => r.category === 'MCPs' && r.status !== 'ok')) {
    recommendations.push('Run: claude mcp list - to check MCP status');
  }

  if (results.find(r => r.category === 'Memory' && r.status !== 'ok')) {
    recommendations.push('Create missing memory files in ~/.claude/memories/');
  }

  // Summary counts
  const summary = {
    ok: results.filter(r => r.status === 'ok').length,
    warning: results.filter(r => r.status === 'warning').length,
    error: results.filter(r => r.status === 'error').length,
    unchecked: results.filter(r => r.status === 'unchecked').length,
  };

  return {
    timestamp: new Date().toISOString(),
    paiDir: PAI_DIR,
    results,
    issues,
    recommendations,
    summary,
  };
}

function printReport(report: HealthReport, verbose: boolean = false): void {
  console.log('\n\x1b[1m╔══════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[1m║          PAI HEALTH CHECK                ║\x1b[0m');
  console.log('\x1b[1m╚══════════════════════════════════════════╝\x1b[0m\n');

  console.log(`\x1b[90mPAI Directory: ${report.paiDir}\x1b[0m`);
  console.log(`\x1b[90mTimestamp: ${report.timestamp}\x1b[0m\n`);

  // Results
  console.log('\x1b[1mDIAGNOSTIC RESULTS\x1b[0m');
  console.log('─'.repeat(44));

  for (const result of report.results) {
    const icon = getStatusIcon(result.status);
    const countStr = result.count
      ? ` (${result.count.found}/${result.count.expected})`
      : '';
    console.log(`${icon} ${result.category.padEnd(14)} ${result.message}${countStr}`);

    if (verbose && result.details) {
      for (const detail of result.details) {
        console.log(`   \x1b[90m└─ ${detail}\x1b[0m`);
      }
    }
  }

  // Summary
  console.log('\n\x1b[1mSUMMARY\x1b[0m');
  console.log('─'.repeat(44));
  console.log(`\x1b[32m✅ OK: ${report.summary.ok}\x1b[0m  \x1b[33m⚠️ Warning: ${report.summary.warning}\x1b[0m  \x1b[31m❌ Error: ${report.summary.error}\x1b[0m  ⬜ Unchecked: ${report.summary.unchecked}`);

  // Issues
  if (report.issues.length > 0) {
    console.log('\n\x1b[1m\x1b[31mISSUES FOUND\x1b[0m');
    console.log('─'.repeat(44));
    for (const issue of report.issues) {
      console.log(`• ${issue}`);
    }
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log('\n\x1b[1m\x1b[33mRECOMMENDATIONS\x1b[0m');
    console.log('─'.repeat(44));
    for (let i = 0; i < report.recommendations.length; i++) {
      console.log(`${i + 1}. ${report.recommendations[i]}`);
    }
  }

  // Final status
  console.log('\n' + '═'.repeat(44));
  if (report.summary.error > 0) {
    console.log('\x1b[31m⚠️  PAI has critical issues that need attention\x1b[0m');
  } else if (report.summary.warning > 0) {
    console.log('\x1b[33m⚡ PAI is functional with minor issues\x1b[0m');
  } else {
    console.log('\x1b[32m✨ PAI is healthy and fully operational\x1b[0m');
  }
  console.log('');
}

// ============================================================================
// Entry Point
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const verbose = args.includes('--verbose') || args.includes('-v');

  const report = generateReport();

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, verbose);
  }

  // Exit with error code if critical issues
  if (report.summary.error > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
