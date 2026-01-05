#!/usr/bin/env bun
/**
 * veritas - Claude Code Skill CLI
 *
 * This is a minimal CLI wrapper for the veritas skill.
 * See README.md for full documentation.
 */

const skill_name = "veritas";
const version = "1.0.0";

function showHelp() {
  console.log(`
veritas - Claude Code Skill

Usage:
  veritas [command] [options]

Commands:
  help     Show this help message
  version  Show version information

Options:
  --help, -h     Show help
  --version, -v  Show version

For full documentation, see:
  ~/.claude/skills/veritas/README.md
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

console.log(`veritas: Command not implemented yet`);
console.log(`Run 'veritas help' for usage information`);
process.exit(1);
