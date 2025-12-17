#!/usr/bin/env bun

/**
 * Expert Load Hook
 *
 * Loads project expertise.yaml at session start and injects into context.
 * This ensures the agent reads its "mental model" FIRST before acting.
 *
 * Hook Type: SessionStart
 *
 * What it does:
 * 1. Find expertise.yaml in current project
 * 2. Validate key locations still exist
 * 3. Inject expertise summary into conversation context
 * 4. Flag any discrepancies for agent to investigate
 *
 * Key principle: "Experts read their mental model first, validate, then act"
 */

import { existsSync, readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { parse } from 'yaml';

const HOME = process.env.USERPROFILE || process.env.HOME || '';

interface ExpertiseFile {
  expertise: {
    project: string;
    domain: string;
    version: number;
    last_updated: string;
    key_locations?: Record<string, string>;
    patterns?: Array<{
      name: string;
      when: string;
      example?: string;
      notes?: string;
    }>;
    anti_patterns?: Array<{
      name: string;
      why_bad: string;
      what_to_do: string;
    }>;
    commands?: Record<string, string>;
  };
}

interface SessionContext {
  working_directory: string;
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
    if (parentDir === dir) break;
    dir = parentDir;
    depth++;
  }

  return null;
}

/**
 * Validate that key locations still exist
 */
function validateLocations(
  baseDir: string,
  locations: Record<string, string>
): { valid: string[]; missing: string[] } {
  const valid: string[] = [];
  const missing: string[] = [];

  for (const [name, path] of Object.entries(locations)) {
    const fullPath = join(baseDir, path);
    if (existsSync(fullPath)) {
      valid.push(name);
    } else {
      missing.push(`${name} (${path})`);
    }
  }

  return { valid, missing };
}

/**
 * Format expertise for context injection
 */
function formatExpertise(expertise: ExpertiseFile, validation: { valid: string[]; missing: string[] }): string {
  const e = expertise.expertise;
  const lines: string[] = [];

  lines.push(`## Project Expertise: ${e.project}`);
  lines.push(`Domain: ${e.domain} | Version: ${e.version} | Updated: ${e.last_updated}`);
  lines.push('');

  // Key locations (validated)
  if (e.key_locations && Object.keys(e.key_locations).length > 0) {
    lines.push('### Key Locations (Know WHERE to look)');
    for (const [name, path] of Object.entries(e.key_locations)) {
      const status = validation.valid.includes(name) ? '✓' : '✗';
      lines.push(`- ${status} **${name}**: \`${path}\``);
    }
    lines.push('');
  }

  // Patterns (top 3 most useful)
  if (e.patterns && e.patterns.length > 0) {
    lines.push('### Patterns (WHAT works in this project)');
    for (const pattern of e.patterns.slice(0, 3)) {
      lines.push(`- **${pattern.name}**: ${pattern.when}`);
      if (pattern.notes) lines.push(`  - Note: ${pattern.notes}`);
    }
    lines.push('');
  }

  // Anti-patterns
  if (e.anti_patterns && e.anti_patterns.length > 0) {
    lines.push('### Anti-Patterns (WHAT to avoid)');
    for (const ap of e.anti_patterns.slice(0, 3)) {
      lines.push(`- **${ap.name}**: ${ap.why_bad} → ${ap.what_to_do}`);
    }
    lines.push('');
  }

  // Commands
  if (e.commands && Object.keys(e.commands).length > 0) {
    lines.push('### Commands');
    for (const [name, cmd] of Object.entries(e.commands).slice(0, 5)) {
      lines.push(`- ${name}: \`${cmd}\``);
    }
    lines.push('');
  }

  // Validation warnings
  if (validation.missing.length > 0) {
    lines.push('### ⚠️ Validation Warnings');
    lines.push('These locations no longer exist - investigate or update expertise:');
    for (const m of validation.missing) {
      lines.push(`- ${m}`);
    }
    lines.push('');
  }

  return lines.join('\n');
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
    console.error('[expert-load] No expertise.yaml found for this project');
    console.error('[expert-load] Create one at: .claude/expertise.yaml');
    console.error('[expert-load] Template at: ~/.claude/expertise/templates/project-expert.yaml');
    return;
  }

  // Load expertise
  let expertise: ExpertiseFile;
  try {
    const content = readFileSync(expertisePath, 'utf-8');
    expertise = parse(content) as ExpertiseFile;
  } catch (error) {
    console.error(`[expert-load] Failed to parse expertise: ${error}`);
    return;
  }

  // Get base directory (where .claude folder is)
  const baseDir = dirname(dirname(expertisePath));

  // Validate locations
  const validation = validateLocations(
    baseDir,
    expertise.expertise.key_locations || {}
  );

  // Format for output
  const formatted = formatExpertise(expertise, validation);

  // Output to stderr (injected into conversation context)
  console.error('');
  console.error('🧠 EXPERTISE LOADED (Read First, Validate, Then Act)');
  console.error('─'.repeat(50));
  console.error(formatted);
  console.error('─'.repeat(50));
  console.error('');
}

// Run
main().catch(err => {
  console.error(`[expert-load] Error: ${err.message}`);
});
