#!/usr/bin/env bun
/**
 * input-leap-manager - Claude Code Skill CLI
 *
 * This is a minimal CLI wrapper for the input-leap-manager skill.
 * See README.md for full documentation.
 */

const skill_name = "input-leap-manager";
const version = "1.0.0";

function showHelp() {
  console.log(`
input-leap-manager - Claude Code Skill

Usage:
  input-leap-manager [command] [options]

Commands:
  help     Show this help message
  version  Show version information

Options:
  --help, -h     Show help
  --version, -v  Show version

For full documentation, see:
  ~/.claude/skills/input-leap-manager/README.md
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

console.log(`input-leap-manager: Command not implemented yet`);
console.log(`Run 'input-leap-manager help' for usage information`);
process.exit(1);
