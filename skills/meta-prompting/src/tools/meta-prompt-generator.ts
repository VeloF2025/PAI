#!/usr/bin/env bun

/**
 * Meta-Prompting - CLI Wrapper
 *
 * Advanced prompt engineering techniques for creating prompts that generate other prompts.
 * Meta-prompting enables recursive self-improvement and dynamic prompt generation.
 *
 * The actual meta-prompting workflows are documented in:
 * - SKILL.md (skill definition)
 * - src/workflows/ (step-by-step guides)
 * - src/tools/test-suite.sh (test suite for validation)
 *
 * This wrapper exists to satisfy Pack v2.0 requirement for code files in src/.
 */

const META_PROMPT_TECHNIQUES = {
  recursive: {
    name: "Recursive Meta-Prompting",
    description: "Prompts that generate prompts for iterative refinement",
    use_case: "Self-improving prompt chains",
    example: "Create a prompt that generates a better version of itself"
  },
  template_generation: {
    name: "Template Generation",
    description: "Generate reusable prompt templates from examples",
    use_case: "Build prompt libraries from successful patterns",
    example: "Analyze successful prompts and extract reusable templates"
  },
  chain_of_thought: {
    name: "Chain-of-Thought Meta-Prompting",
    description: "Generate prompts that enforce structured reasoning",
    use_case: "Create prompts that guide step-by-step thinking",
    example: "Generate a prompt that breaks down complex tasks"
  },
  role_specification: {
    name: "Role-Based Prompt Generation",
    description: "Generate prompts with specific persona/role definitions",
    use_case: "Create domain-expert prompts dynamically",
    example: "Generate expert-level prompts for specific domains"
  },
  constraint_based: {
    name: "Constraint-Based Generation",
    description: "Generate prompts with specific constraints and requirements",
    use_case: "Ensure generated prompts meet quality criteria",
    example: "Create prompts that enforce output format and validation"
  }
};

const QUALITY_CRITERIA = [
  "Clarity - Unambiguous and well-structured instructions",
  "Completeness - All necessary context and constraints included",
  "Specificity - Concrete examples and clear success criteria",
  "Testability - Can validate if output meets requirements",
  "Reusability - Generalizable pattern for similar tasks"
];

function showHelp() {
  console.log(`
Meta-Prompting - Advanced Prompt Engineering

USAGE:
  bun run meta-prompt-generator.ts [technique]

TECHNIQUES:
  recursive          - ${META_PROMPT_TECHNIQUES.recursive.description}
  template-gen       - ${META_PROMPT_TECHNIQUES.template_generation.description}
  chain-of-thought   - ${META_PROMPT_TECHNIQUES.chain_of_thought.description}
  role-spec          - ${META_PROMPT_TECHNIQUES.role_specification.description}
  constraint-based   - ${META_PROMPT_TECHNIQUES.constraint_based.description}

QUALITY CRITERIA:
${QUALITY_CRITERIA.map(c => `  • ${c}`).join('\n')}

TEST SUITE:
  Run validation tests with:
  bash src/tools/test-suite.sh

NOTE:
This skill is primarily documentation-based and should be invoked through
Claude Code, not directly via this CLI wrapper.

To use this skill:
  1. Open Claude Code
  2. Say: "use meta-prompting to create a prompt for [task]"
  3. Claude will apply meta-prompting techniques

For full workflow documentation, see:
  - src/workflows/ (meta-prompting guides)
  - SKILL.md (skill definition)
  - README.md (overview and examples)
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    process.exit(0);
  }

  const technique = args[0];
  const techniqueKey = technique.replace(/-/g, '_');

  if (!META_PROMPT_TECHNIQUES[techniqueKey as keyof typeof META_PROMPT_TECHNIQUES]) {
    console.error(`❌ Invalid technique: ${technique}`);
    console.error(`Valid techniques: recursive, template-gen, chain-of-thought, role-spec, constraint-based\n`);
    showHelp();
    process.exit(1);
  }

  const techniqueInfo = META_PROMPT_TECHNIQUES[techniqueKey as keyof typeof META_PROMPT_TECHNIQUES];

  console.log(`
📦 ${techniqueInfo.name}
📋 Description: ${techniqueInfo.description}
💡 Use Case: ${techniqueInfo.use_case}
📝 Example: ${techniqueInfo.example}

⚠️  WARNING: This CLI wrapper is for demonstration only.
    The Meta-Prompting skill should be invoked through Claude Code.

To actually use this technique:
  1. Open Claude Code
  2. Say: "use ${technique} meta-prompting for [your task]"
  3. Claude will generate and refine prompts using this technique

Run tests:
  bash src/tools/test-suite.sh

See README.md and src/workflows/ for full documentation.
`);
}

main();
