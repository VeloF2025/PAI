#!/usr/bin/env bun
/**
 * ref-tools - Claude Code Skill CLI
 *
 * This is a minimal CLI wrapper for the ref-tools skill.
 * See README.md for full documentation.
 */

const skill_name = "ref-tools";
const version = "1.0.0";

function showHelp() {
  console.log(`
ref-tools - Claude Code Skill

Usage:
  ref-tools [command] [options]

Commands:
  help     Show this help message
  version  Show version information

Options:
  --help, -h     Show help
  --version, -v  Show version

For full documentation, see:
  ~/.claude/skills/ref-tools/README.md
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

console.log(`ref-tools: Command not implemented yet`);
console.log(`Run 'ref-tools help' for usage information`);
process.exit(1);
