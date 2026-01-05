#!/usr/bin/env bun

/**
 * Create Skill - CLI Wrapper
 *
 * This is a minimal wrapper for the Create Skill guide which is primarily
 * documentation-based (using Claude Code prompting and templates).
 *
 * The actual skill creation process is documented in:
 * - SKILL.md (skill definition)
 * - src/workflows/ (step-by-step guides)
 * - src/templates/ (skill templates)
 *
 * This wrapper exists to satisfy Pack v2.0 requirement for code files in src/.
 */

const SKILL_TYPES = {
  basic: {
    name: "Basic Skill",
    description: "Simple skill with prompts and workflows",
    templates: ["SKILL.md", "README.md", "workflows/"]
  },
  tool: {
    name: "Tool-Based Skill",
    description: "Skill with executable tools and scripts",
    templates: ["SKILL.md", "README.md", "src/tools/", "workflows/"]
  },
  hook: {
    name: "Hook-Based Skill",
    description: "Skill that integrates with Claude Code hooks",
    templates: ["SKILL.md", "README.md", "src/hooks/", "workflows/"]
  },
  pack: {
    name: "Pack v2.0 Skill",
    description: "Full Pack v2.0 with INSTALL.md, VERIFY.md, and src/",
    templates: ["README.md", "INSTALL.md", "VERIFY.md", "src/tools/", "src/workflows/"]
  }
};

function showHelp() {
  console.log(`
Create Skill Guide - Skill Creation Framework

USAGE:
  bun run skill-creator.ts [skill-type] [skill-name]

SKILL TYPES:
  basic  - ${SKILL_TYPES.basic.description}
  tool   - ${SKILL_TYPES.tool.description}
  hook   - ${SKILL_TYPES.hook.description}
  pack   - ${SKILL_TYPES.pack.description}

EXAMPLES:
  bun run skill-creator.ts basic my-skill
  bun run skill-creator.ts pack my-advanced-skill

NOTE:
This skill is primarily documentation-based and should be invoked through
Claude Code, not directly via this CLI wrapper.

To use this skill:
  1. Open Claude Code
  2. Say: "create a new skill called [name]"
  3. Claude will guide you through the creation process using templates

For full workflow documentation, see:
  - src/workflows/
  - src/templates/
  - SKILL.md (skill definition)
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    process.exit(0);
  }

  const skillType = args[0];
  const skillName = args[1];

  if (!SKILL_TYPES[skillType as keyof typeof SKILL_TYPES]) {
    console.error(`❌ Invalid skill type: ${skillType}`);
    console.error(`Valid types: basic, tool, hook, pack\n`);
    showHelp();
    process.exit(1);
  }

  if (!skillName) {
    console.error("❌ Skill name is required\n");
    showHelp();
    process.exit(1);
  }

  const typeInfo = SKILL_TYPES[skillType as keyof typeof SKILL_TYPES];

  console.log(`
📦 ${typeInfo.name}
📋 Skill Name: "${skillName}"
📄 Templates: ${typeInfo.templates.join(", ")}

⚠️  WARNING: This CLI wrapper is for demonstration only.
    The Create Skill guide should be invoked through Claude Code.

To actually create this skill:
  1. Open Claude Code
  2. Say: "create a ${skillType} skill called ${skillName}"
  3. Claude will use templates from src/templates/ to create the skill

See SKILL.md and src/workflows/ for full documentation.
`);
}

main();
