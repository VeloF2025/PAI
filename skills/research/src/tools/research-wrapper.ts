#!/usr/bin/env bun

/**
 * Research Skill - CLI Wrapper
 *
 * This is a minimal wrapper for the Research skill which is primarily
 * workflow-based (using Claude Code Task tool to orchestrate agents).
 *
 * The actual research logic is documented in:
 * - src/workflows/conduct.md (main workflow)
 * - SKILL.md (skill definition with routing)
 *
 * This wrapper exists to satisfy Pack v2.0 requirement for code files in src/.
 */

const RESEARCH_MODES = {
  quick: {
    name: "Quick Research",
    agents: 3,
    description: "3 agents (perplexity, claude, gemini) for fast research"
  },
  standard: {
    name: "Standard Research",
    agents: 9,
    description: "9 agents (3x perplexity, 3x claude, 3x gemini) for comprehensive research"
  },
  extensive: {
    name: "Extensive Research",
    agents: 24,
    description: "24 agents with be-creative query expansion for exhaustive research"
  }
};

function showHelp() {
  console.log(`
Research Skill - Multi-Agent Research Orchestration

USAGE:
  bun run research-wrapper.ts [mode] "research query"

MODES:
  quick      - ${RESEARCH_MODES.quick.description}
  standard   - ${RESEARCH_MODES.standard.description}
  extensive  - ${RESEARCH_MODES.extensive.description}

EXAMPLES:
  bun run research-wrapper.ts quick "latest AI news"
  bun run research-wrapper.ts standard "quantum computing breakthroughs 2026"
  bun run research-wrapper.ts extensive "future of autonomous agents"

NOTE:
This skill is primarily workflow-based and should be invoked through
Claude Code's Task tool, not directly via this CLI wrapper.

For full workflow documentation, see:
  - src/workflows/conduct.md
  - SKILL.md (skill definition)
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    process.exit(0);
  }

  const mode = args[0];
  const query = args.slice(1).join(" ");

  if (!RESEARCH_MODES[mode as keyof typeof RESEARCH_MODES]) {
    console.error(`❌ Invalid mode: ${mode}`);
    console.error(`Valid modes: quick, standard, extensive\n`);
    showHelp();
    process.exit(1);
  }

  if (!query) {
    console.error("❌ Research query is required\n");
    showHelp();
    process.exit(1);
  }

  const modeInfo = RESEARCH_MODES[mode as keyof typeof RESEARCH_MODES];

  console.log(`
🔍 ${modeInfo.name}
📋 Query: "${query}"
🤖 Agents: ${modeInfo.agents}

⚠️  WARNING: This CLI wrapper is for demonstration only.
    The Research skill should be invoked through Claude Code.

To actually run this research:
  1. Open Claude Code
  2. Say: "do ${mode} research on: ${query}"
  3. Claude will use the Task tool to orchestrate ${modeInfo.agents} agents

See SKILL.md and src/workflows/conduct.md for full workflow documentation.
`);
}

main();
