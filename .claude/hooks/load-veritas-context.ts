#!/usr/bin/env bun
/**
 * Veritas Context Loader Hook
 * Loads Veritas-specific context when working in Veritas project
 */

const projectPath = process.cwd();

// Only load if we're in Veritas project
if (projectPath.includes('Veritas')) {
  console.log('<!-- Veritas context loaded -->');
}

process.exit(0);
