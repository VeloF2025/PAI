#!/usr/bin/env bun
/**
 * apex-ui - Claude Code Skill CLI
 *
 * This is a minimal CLI wrapper for the apex-ui skill.
 * See README.md for full documentation.
 */

const skill_name = "apex-ui";
const version = "1.0.0";

function showHelp() {
  console.log(`
apex-ui - Claude Code Skill

Usage:
  apex-ui [command] [options]

Commands:
  help     Show this help message
  version  Show version information

Options:
  --help, -h     Show help
  --version, -v  Show version

For full documentation, see:
  ~/.claude/skills/apex-ui/README.md
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

console.log(`apex-ui: Command not implemented yet`);
console.log(`Run 'apex-ui help' for usage information`);
process.exit(1);
