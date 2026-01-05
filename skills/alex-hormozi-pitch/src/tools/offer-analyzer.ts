#!/usr/bin/env bun

/**
 * Alex Hormozi Pitch - Offer Analyzer
 *
 * Analyzes and improves offers using Alex Hormozi's $100M Offers methodology.
 * This is a workflow-based skill that primarily uses Claude Code prompting.
 *
 * See:
 * - SKILL.md for full workflow definition
 * - src/workflows/ for step-by-step guides
 */

const HORMOZI_FRAMEWORKS = {
  value_equation: "Dream Outcome + Perceived Likelihood of Achievement / (Time Delay × Effort & Sacrifice)",
  guarantee_types: ["Unconditional", "Conditional", "Anti-Guarantee", "Implied"],
  pricing_psychology: ["Anchor High", "Stack Value", "Compare Alternatives", "Frame Time"],
  grand_slam_criteria: ["Massive Dream Outcome", "High Likelihood", "Short Time", "Low Effort"]
};

function showHelp() {
  console.log(`
Alex Hormozi Pitch Analyzer - Create Irresistible Offers

USAGE:
  bun run offer-analyzer.ts [command]

COMMANDS:
  analyze     - Analyze an existing offer
  improve     - Get improvement suggestions
  create      - Create new offer from scratch
  guarantee   - Design guarantee framework
  price       - Optimize pricing strategy

FRAMEWORKS:
  Value Equation: ${HORMOZI_FRAMEWORKS.value_equation}

NOTE:
This skill is primarily workflow-based and should be invoked through
Claude Code, not directly via this CLI wrapper.

To use this skill:
  1. Open Claude Code
  2. Say: "create offer using Hormozi method for [product/service]"
  3. Claude will guide you through the methodology

See SKILL.md and src/workflows/ for full documentation.
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    process.exit(0);
  }

  console.log(`
⚠️  WARNING: This CLI wrapper is for demonstration only.
    The Alex Hormozi Pitch skill should be invoked through Claude Code.

To actually use this skill, invoke it through Claude Code with prompts like:
  - "Create an irresistible offer for [product]"
  - "Analyze my offer using Hormozi's method"
  - "Design a guarantee for [service]"

See SKILL.md and src/workflows/ for full workflow documentation.
`);
}

main();
