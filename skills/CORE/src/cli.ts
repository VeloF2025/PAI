#!/usr/bin/env bun
/**
 * CORE - Claude Code Skill CLI
 *
 * This is a minimal CLI wrapper for the CORE skill.
 * See README.md for full documentation.
 */

const skill_name = "CORE";
const version = "1.0.0";

function showHelp() {
  console.log(`
CORE - Claude Code Skill

Usage:
  CORE [command] [options]

Commands:
  help     Show this help message
  version  Show version information

Options:
  --help, -h     Show help
  --version, -v  Show version

For full documentation, see:
  ~/.claude/skills/CORE/README.md
  `);
}

function showVersion() {
  console.log(`${skill_name} v${version}`);
}

// Main entry point
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h') || args.includes('help')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v') || args.includes('version')) {
  showVersion();
  process.exit(0);
}

console.log(`CORE: Command not implemented yet`);
console.log(`Run 'CORE help' for usage information`);
process.exit(1);
