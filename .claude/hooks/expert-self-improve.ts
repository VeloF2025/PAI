#!/usr/bin/env bun

/**
 * Expert Self-Improve Hook
 *
 * Automatically updates project expertise.yaml after builds/edits complete.
 * This is what makes an "agent expert" - it learns from every action.
 *
 * Hook Type: Stop (runs at end of conversation turn)
 *
 * What it does:
 * 1. Detects which project was worked on
 * 2. Loads project's expertise.yaml (if exists)
 * 3. Analyzes changes made during session
 * 4. Suggests updates to expertise (patterns, anti-patterns, locations)
 * 5. Updates expertise.yaml with new learnings
 *
 * Key principle: "Agent experts must learn on their own"
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { parse, stringify } from 'yaml';

const HOME = process.env.USERPROFILE || process.env.HOME || '';

interface ExpertiseFile {
  expertise: {
    project: string;
    domain: string;
    version: number;
    last_updated: string;
    stack?: Record<string, string>;
    key_locations?: Record<string, string>;
    patterns?: Array<{
      name: string;
      when: string;
      example: string;
      notes?: string;
    }>;
    anti_patterns?: Array<{
      name: string;
      why_bad: string;
      what_to_do: string;
    }>;
    commands?: Record<string, string>;
    update_history?: Array<{
      version: number;
      date: string;
      changes: string;
    }>;
  };
}

interface SessionContext {
  working_directory: string;
  transcript_path?: string;
  session_id?: string;
}

/**
 * Find expertise.yaml in project or parent directories
 */
function findExpertiseFile(startDir: string): string | null {
  let dir = startDir;
  const maxDepth = 5;
  let depth = 0;

  while (depth < maxDepth) {
    const expertisePath = join(dir, '.claude', 'expertise.yaml');
    if (existsSync(expertisePath)) {
      return expertisePath;
    }

    const parentDir = dirname(dir);
    if (parentDir === dir) break; // Reached root
    dir = parentDir;
    depth++;
  }

  return null;
}

/**
 * Load and parse expertise file
 */
function loadExpertise(path: string): ExpertiseFile | null {
  try {
    const content = readFileSync(path, 'utf-8');
    return parse(content) as ExpertiseFile;
  } catch (error) {
    console.error(`[expert-self-improve] Failed to load expertise: ${error}`);
    return null;
  }
}

/**
 * Get git diff of recent changes
 */
function getRecentChanges(workDir: string): string[] {
  const allFiles = new Set<string>();

  // Helper to run git command safely
  function runGitCommand(cmd: string): string[] {
    try {
      const result = execSync(cmd, {
        cwd: workDir,
        encoding: 'utf-8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'] // Suppress stderr
      });
      return result.trim().split('\n').filter(f => f.length > 0 && !f.startsWith('"'));
    } catch {
      return [];
    }
  }

  // Try last commit first
  runGitCommand('git diff --name-only HEAD~1').forEach(f => allFiles.add(f));

  // Get staged changes
  runGitCommand('git diff --name-only --cached').forEach(f => allFiles.add(f));

  // Get unstaged changes
  runGitCommand('git diff --name-only').forEach(f => allFiles.add(f));

  return Array.from(allFiles);
}

/**
 * Detect new key locations from changed files
 */
function detectNewLocations(
  changedFiles: string[],
  currentLocations: Record<string, string>
): Record<string, string> {
  const newLocations: Record<string, string> = {};

  for (const file of changedFiles) {
    const dir = dirname(file);

    // Normalize path separators for matching
    const normalizedDir = dir.replace(/\\/g, '/');

    // Pattern matching - detect known directory patterns
    // Only add if the pattern key doesn't already exist in currentLocations

    // Core directories
    if ((normalizedDir.includes('/hooks') || normalizedDir.endsWith('hooks')) && !currentLocations.hooks) {
      newLocations.hooks = dir;
    }
    if ((normalizedDir.includes('/components') || normalizedDir.endsWith('components')) && !currentLocations.components) {
      newLocations.components = dir;
    }
    if ((normalizedDir.includes('/api') || normalizedDir.endsWith('api')) && !currentLocations.api) {
      newLocations.api = dir;
    }
    if ((normalizedDir.includes('/lib') || normalizedDir.endsWith('lib')) && !currentLocations.lib) {
      newLocations.lib = dir;
    }
    if ((normalizedDir.includes('/utils') || normalizedDir.endsWith('utils')) && !currentLocations.utils) {
      newLocations.utils = dir;
    }
    if ((normalizedDir.includes('/services') || normalizedDir.endsWith('services')) && !currentLocations.services) {
      newLocations.services = dir;
    }

    // Database & data
    if ((normalizedDir.includes('/db') || normalizedDir.includes('/database') || normalizedDir.endsWith('db') || normalizedDir.endsWith('database')) && !currentLocations.database) {
      newLocations.database = dir;
    }
    if ((normalizedDir.includes('/models') || normalizedDir.endsWith('models')) && !currentLocations.models) {
      newLocations.models = dir;
    }

    // Testing
    if ((normalizedDir.includes('/tests') || normalizedDir.endsWith('tests') || normalizedDir.includes('/__tests__')) && !currentLocations.tests) {
      newLocations.tests = dir;
    }

    // Backend patterns
    if ((normalizedDir.includes('/controllers') || normalizedDir.endsWith('controllers')) && !currentLocations.controllers) {
      newLocations.controllers = dir;
    }
    if ((normalizedDir.includes('/routes') || normalizedDir.endsWith('routes')) && !currentLocations.routes) {
      newLocations.routes = dir;
    }
    if ((normalizedDir.includes('/middleware') || normalizedDir.endsWith('middleware')) && !currentLocations.middleware) {
      newLocations.middleware = dir;
    }

    // Frontend/assets
    if ((normalizedDir.includes('/types') || normalizedDir.endsWith('types')) && !currentLocations.types) {
      newLocations.types = dir;
    }
    if ((normalizedDir.includes('/assets') || normalizedDir.endsWith('assets')) && !currentLocations.assets) {
      newLocations.assets = dir;
    }
    if ((normalizedDir.includes('/public') || normalizedDir.endsWith('public')) && !currentLocations.public) {
      newLocations.public = dir;
    }

    // Documentation & config
    if ((normalizedDir.includes('/docs') || normalizedDir.includes('/documentation') || normalizedDir.endsWith('docs') || normalizedDir.endsWith('documentation')) && !currentLocations.docs) {
      newLocations.docs = dir;
    }
    if ((normalizedDir.includes('/config') || normalizedDir.includes('/configuration') || normalizedDir.endsWith('config') || normalizedDir.endsWith('configuration')) && !currentLocations.config) {
      newLocations.config = dir;
    }
    if ((normalizedDir.includes('/scripts') || normalizedDir.endsWith('scripts')) && !currentLocations.scripts) {
      newLocations.scripts = dir;
    }
  }

  return newLocations;
}

/**
 * Generate update summary
 */
function generateUpdateSummary(
  newLocations: Record<string, string>,
  changedFiles: string[]
): string {
  const parts: string[] = [];

  if (Object.keys(newLocations).length > 0) {
    parts.push(`Added locations: ${Object.keys(newLocations).join(', ')}`);
  }

  if (changedFiles.length > 0) {
    const fileTypes = new Set(changedFiles.map(f => f.split('.').pop() || 'unknown'));
    parts.push(`Files modified: ${changedFiles.length} (${[...fileTypes].join(', ')})`);
  }

  return parts.join('; ') || 'Routine update';
}

/**
 * Update expertise file with new learnings
 */
function updateExpertise(
  expertise: ExpertiseFile,
  newLocations: Record<string, string>,
  updateSummary: string
): ExpertiseFile {
  const updated = { ...expertise };

  // Merge new locations
  if (Object.keys(newLocations).length > 0) {
    updated.expertise.key_locations = {
      ...updated.expertise.key_locations,
      ...newLocations
    };
  }

  // Increment version
  updated.expertise.version = (updated.expertise.version || 0) + 1;
  updated.expertise.last_updated = new Date().toISOString();

  // Add to history
  if (!updated.expertise.update_history) {
    updated.expertise.update_history = [];
  }

  updated.expertise.update_history.unshift({
    version: updated.expertise.version,
    date: updated.expertise.last_updated,
    changes: updateSummary
  });

  // Keep only last 10 history entries
  updated.expertise.update_history = updated.expertise.update_history.slice(0, 10);

  return updated;
}

/**
 * Save expertise file
 */
function saveExpertise(path: string, expertise: ExpertiseFile): void {
  const content = stringify(expertise, {
    lineWidth: 120,
    defaultStringType: 'PLAIN',
    defaultKeyType: 'PLAIN'
  });

  // Add header comment
  const header = `# Project Expertise - Auto-updated by expert-self-improve hook
# Last updated: ${expertise.expertise.last_updated}
# Version: ${expertise.expertise.version}

`;

  writeFileSync(path, header + content, 'utf-8');
}

/**
 * Main function
 */
async function main() {
  let context: SessionContext;

  try {
    // Check if stdin has data (with timeout to prevent hanging)
    const stdin = Bun.stdin;
    let input = '';

    // Only try to read if stdin is not a TTY (has piped input)
    if (!process.stdin.isTTY) {
      const reader = stdin.stream().getReader();
      const { value, done } = await Promise.race([
        reader.read(),
        new Promise<{ value: undefined; done: true }>((resolve) =>
          setTimeout(() => resolve({ value: undefined, done: true }), 100)
        ),
      ]);
      reader.releaseLock();

      if (value) {
        input = new TextDecoder().decode(value);
      }
    }

    context = input ? JSON.parse(input) : { working_directory: process.cwd() };
  } catch {
    context = { working_directory: process.cwd() };
  }

  const workDir = context.working_directory || process.cwd();

  // Find expertise file
  const expertisePath = findExpertiseFile(workDir);

  if (!expertisePath) {
    // No expertise file - could auto-generate one here in future
    console.error('[expert-self-improve] No expertise.yaml found - skipping');
    return;
  }

  // Load expertise
  const expertise = loadExpertise(expertisePath);
  if (!expertise) {
    console.error('[expert-self-improve] Failed to load expertise file');
    return;
  }

  // Get recent changes
  const changedFiles = getRecentChanges(workDir);

  if (changedFiles.length === 0) {
    console.error('[expert-self-improve] No changes detected - skipping update');
    return;
  }

  // Detect new locations
  const currentLocations = expertise.expertise.key_locations || {};
  const newLocations = detectNewLocations(changedFiles, currentLocations);

  // Only update if there's something new
  if (Object.keys(newLocations).length === 0) {
    console.error(`[expert-self-improve] ${changedFiles.length} files changed, no new locations`);
    return;
  }

  // Generate summary
  const summary = generateUpdateSummary(newLocations, changedFiles);

  // Update expertise
  const updated = updateExpertise(expertise, newLocations, summary);

  // Save
  saveExpertise(expertisePath, updated);

  console.error(`[expert-self-improve] Updated expertise v${updated.expertise.version}: ${summary}`);
}

// Run
main().catch(err => {
  console.error(`[expert-self-improve] Error: ${err.message}`);
});
