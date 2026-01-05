#!/usr/bin/env bun

/**
 * MCP Builder - CLI Wrapper
 *
 * Guide for creating high-quality MCP (Model Context Protocol) servers that
 * enable LLMs to interact with external services through well-designed tools.
 *
 * The actual MCP server creation process is documented in:
 * - SKILL.md (skill definition)
 * - src/reference/ (MCP specification and examples)
 * - src/tools/scripts/ (Python evaluation scripts)
 *
 * This wrapper exists to satisfy Pack v2.0 requirement for code files in src/.
 */

const MCP_FRAMEWORKS = {
  fastmcp: {
    name: "FastMCP (Python)",
    description: "Python framework for building MCP servers with minimal boilerplate",
    language: "Python",
    features: ["Type hints", "Auto-documentation", "Error handling", "Async support"]
  },
  mcp_sdk: {
    name: "MCP SDK (Node/TypeScript)",
    description: "Official TypeScript/Node.js SDK for building MCP servers",
    language: "TypeScript",
    features: ["Type safety", "Built-in validation", "Streaming support", "Resource management"]
  }
};

const DESIGN_PRINCIPLES = [
  "Single Responsibility - One tool does one thing well",
  "Clear Contracts - Explicit inputs/outputs with types",
  "Error Handling - Graceful failures with helpful messages",
  "Documentation - Self-documenting tool names and descriptions",
  "Testability - Tools can be tested in isolation"
];

function showHelp() {
  console.log(`
MCP Builder Guide - Create High-Quality MCP Servers

USAGE:
  bun run mcp-builder.ts [framework] [server-name]

FRAMEWORKS:
  fastmcp  - ${MCP_FRAMEWORKS.fastmcp.description}
  mcp-sdk  - ${MCP_FRAMEWORKS.mcp_sdk.description}

DESIGN PRINCIPLES:
${DESIGN_PRINCIPLES.map(p => `  • ${p}`).join('\n')}

EXAMPLES:
  bun run mcp-builder.ts fastmcp weather-server
  bun run mcp-builder.ts mcp-sdk database-server

EVALUATION SCRIPTS:
  Python scripts in src/tools/scripts/ for testing MCP server quality:
  • connections.py - Test server connectivity
  • evaluation.py  - Evaluate server design quality

NOTE:
This skill is primarily documentation-based and should be invoked through
Claude Code, not directly via this CLI wrapper.

To use this skill:
  1. Open Claude Code
  2. Say: "create an MCP server for [service]"
  3. Claude will guide you through the design and implementation

For full documentation, see:
  - src/reference/ (MCP specifications)
  - SKILL.md (skill definition)
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    process.exit(0);
  }

  const framework = args[0];
  const serverName = args[1];

  if (!MCP_FRAMEWORKS[framework as keyof typeof MCP_FRAMEWORKS]) {
    console.error(`❌ Invalid framework: ${framework}`);
    console.error(`Valid frameworks: fastmcp, mcp-sdk\n`);
    showHelp();
    process.exit(1);
  }

  if (!serverName) {
    console.error("❌ Server name is required\n");
    showHelp();
    process.exit(1);
  }

  const frameworkInfo = MCP_FRAMEWORKS[framework as keyof typeof MCP_FRAMEWORKS];

  console.log(`
📦 ${frameworkInfo.name}
📋 Server Name: "${serverName}"
💻 Language: ${frameworkInfo.language}
✨ Features: ${frameworkInfo.features.join(", ")}

⚠️  WARNING: This CLI wrapper is for demonstration only.
    The MCP Builder guide should be invoked through Claude Code.

To actually create this MCP server:
  1. Open Claude Code
  2. Say: "create a ${framework} MCP server called ${serverName}"
  3. Claude will use the MCP Builder guide to create the server

Use Python scripts in src/tools/scripts/ to test and evaluate your server:
  python src/tools/scripts/connections.py
  python src/tools/scripts/evaluation.py

See SKILL.md and src/reference/ for full documentation.
`);
}

main();
