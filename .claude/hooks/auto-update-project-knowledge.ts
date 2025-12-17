#!/usr/bin/env bun

/**
 * Auto-Update Project Knowledge Hook
 *
 * Detects significant codebase changes and triggers PAI knowledge re-extraction.
 *
 * Triggers:
 * - PostToolUse hook after Write/Edit operations
 * - Checks if changes affect extractable knowledge
 * - Re-runs extraction if stale
 *
 * Detection Strategy:
 * 1. Track key file changes (package.json, schema files, etc.)
 * 2. Check last extraction timestamp
 * 3. Re-extract if changes detected + time threshold met
 */

import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface ChangeMetadata {
  lastExtraction: number;
  packageJsonHash?: string;
  schemaFilesHash?: string;
  fileCount?: number;
}

async function main() {
  try {
    const projectRoot = process.cwd();
    const knowledgeDir = join(projectRoot, '.claude', 'skills', 'project-codebase');
    const metadataPath = join(knowledgeDir, '.extraction-metadata.json');

    // Skip if knowledge doesn't exist yet
    if (!existsSync(knowledgeDir)) {
      process.exit(0);
    }

    // Load metadata
    let metadata: ChangeMetadata = { lastExtraction: 0 };
    if (existsSync(metadataPath)) {
      metadata = JSON.parse(readFileSync(metadataPath, 'utf-8'));
    }

    // Check for significant changes
    let shouldUpdate = false;
    const changes: string[] = [];

    // 1. Check package.json changes (tech stack)
    const packageJsonPath = join(projectRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      const currentHash = hashFile(packageJsonPath);
      if (metadata.packageJsonHash && metadata.packageJsonHash !== currentHash) {
        shouldUpdate = true;
        changes.push('package.json changed (tech stack update)');
      }
      metadata.packageJsonHash = currentHash;
    }

    // 2. Check Python project file changes
    const pyprojectPath = existsSync(join(projectRoot, 'pyproject.toml'))
      ? join(projectRoot, 'pyproject.toml')
      : join(projectRoot, 'python', 'pyproject.toml');

    if (existsSync(pyprojectPath)) {
      const currentHash = hashFile(pyprojectPath);
      if (metadata.packageJsonHash && metadata.packageJsonHash !== currentHash) {
        shouldUpdate = true;
        changes.push('pyproject.toml changed (dependencies update)');
      }
      metadata.packageJsonHash = currentHash;
    }

    // 3. Check schema file count (database changes)
    const schemaFiles = findSchemaFiles(projectRoot);
    if (metadata.fileCount && schemaFiles.length !== metadata.fileCount) {
      shouldUpdate = true;
      changes.push(`Schema files changed (${metadata.fileCount} → ${schemaFiles.length})`);
    }
    metadata.fileCount = schemaFiles.length;

    // 4. Time-based staleness check (re-extract after 7 days)
    const daysSinceExtraction = (Date.now() - metadata.lastExtraction) / (1000 * 60 * 60 * 24);
    if (daysSinceExtraction > 7) {
      shouldUpdate = true;
      changes.push(`Knowledge is ${Math.floor(daysSinceExtraction)} days old (auto-refresh)`);
    }

    // Update if changes detected
    if (shouldUpdate) {
      console.error('[pai-update] 🔄 Codebase changes detected, updating project knowledge...');
      changes.forEach(c => console.error(`[pai-update]    • ${c}`));

      // Delete old skills
      execSync(`rm -rf "${knowledgeDir}"`, { stdio: 'inherit' });

      // Re-run extraction
      const extractScript = join(
        process.env.HOME || process.env.USERPROFILE || '',
        '.claude',
        'hooks',
        'auto-generate-project-knowledge.ts'
      );
      execSync(`bun "${extractScript}"`, { stdio: 'inherit' });

      console.error('[pai-update] ✅ Project knowledge updated successfully\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('[pai-update] ⚠️ Error during update check:', error);
    process.exit(0); // Don't block session on errors
  }
}

/**
 * Simple hash function for file content
 */
function hashFile(filePath: string): string {
  const content = readFileSync(filePath, 'utf-8');
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Find schema files in project
 */
function findSchemaFiles(projectRoot: string): string[] {
  try {
    const result = execSync(
      `find "${projectRoot}" -name "*-schema.ts" -o -name "*-schema.js" -o -name "schema.py" 2>/dev/null || true`,
      { encoding: 'utf-8' }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

main();
