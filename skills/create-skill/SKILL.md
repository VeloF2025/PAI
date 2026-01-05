---
name: create-skill
description: Guide for creating new skills in Kai's personal AI infrastructure. Use when user wants to create, update, or structure a new skill that extends capabilities with specialized knowledge, workflows, or tool integrations. Follows both Anthropic skill standards and PAI-specific patterns.
---

# Create Skill - Skill Creation Framework

## When to Activate This Skill
- "Create a new skill for X"
- "Build a skill that does Y"
- "Add a skill for Z"
- "Update/improve existing skill"
- "Structure a skill properly"
- User wants to extend Kai's capabilities

## Core Skill Creation Workflow

### Step 1: Understand the Purpose
Ask these questions:
- **What does this skill do?** (Clear, specific purpose)
- **When should it activate?** (Trigger conditions)
- **What tools/commands does it use?** (Dependencies)
- **Does it need reusable scripts?** (Anthropic "scripts as tools" pattern)
- **Is it simple or complex?** (Determines structure)

### Step 2: Choose Skill Type

**Simple Skill** (SKILL.md only):
- Single focused capability
- Minimal dependencies
- Quick reference suffices
- Examples: fabric-patterns, youtube-extraction

**Standard Skill** (SKILL.md + workflows + scripts) - NEW:
- Multiple workflows for different tasks
- Reusable scripts Claude can execute directly
- Follows Anthropic "scripts as tools" pattern
- Examples: research, content-creation, data-analysis

**Complex Skill** (SKILL.md + CLAUDE.md + supporting files):
- Multi-step workflows
- Extensive context needed
- Multiple sub-components
- Examples: development, website, consulting

### Step 3: Create Directory Structure

```bash
# Simple skill
${PAI_DIR}/skills/[skill-name]/
└── SKILL.md

# Standard skill (with scripts - Anthropic pattern)
${PAI_DIR}/skills/[skill-name]/
├── SKILL.md           # Quick reference + tool inventory
├── workflows/         # Task-specific workflows
│   └── main-task.md
└── scripts/           # Executable tools
    └── [skill]-action.py

# Complex skill
${PAI_DIR}/skills/[skill-name]/
├── SKILL.md           # Quick reference
├── CLAUDE.md          # Full context
├── workflows/         # Task workflows
├── scripts/           # Executable tools
└── assets/            # Templates, references
```

### Step 4: Write SKILL.md (Required)

Use this structure:
```markdown
---
name: skill-name
description: Clear description of what skill does and when to use it. Should match activation triggers.
---

# Skill Name

## When to Activate This Skill
- Trigger condition 1
- Trigger condition 2
- User phrase examples

## [Main Content Sections]
- Core workflow
- Key commands
- Examples
- Best practices

## Available Tools (if scripts exist)
| Script | Purpose | Usage |
|--------|---------|-------|
| `skill-action.py` | What it does | `python scripts/skill-action.py <args>` |

## Supplementary Resources
For detailed context: `read ${PAI_DIR}/skills/[skill-name]/CLAUDE.md`
```

### Step 5: Add Scripts/Tools (Anthropic Pattern) - NEW

**Key Insight from Anthropic:** "We kept seeing Claude write the same Python script over and over again... So we just ask Claude to save it inside of the skill as a tool"

**When to add scripts:**
- Claude repeatedly writes similar code for this skill
- The operation can be parameterized
- It's faster to run a script than regenerate code

**Script Requirements:**
1. Self-documenting (clear docstring with purpose, args, output)
2. Single-purpose (one task per script)
3. Proper error handling
4. Named as `[skill-name]-[action].py`

Use template: `${PAI_DIR}/skills/create-skill/templates/script-template.py`

### Step 6: Write CLAUDE.md (If Complex)

Include:
- Comprehensive methodology
- Detailed workflows
- Component documentation
- Advanced usage patterns
- Integration instructions
- Troubleshooting guides

### Step 7: Add to Global Context

Update `${PAI_DIR}/global/KAI.md` available_skills section to include the new skill so it shows up in the system prompt.

### Step 8: Test the Skill

1. Trigger it with natural language
2. Verify it loads correctly
3. Check all references work
4. Test scripts execute properly
5. Validate against examples

## Skill Naming Conventions

- **Lowercase with hyphens**: `create-skill`, `web-scraping`
- **Descriptive, not generic**: `fabric-patterns` not `text-processing`
- **Action or domain focused**: `ai-image-generation`, `chrome-devtools`

## Script Naming Conventions - NEW

- Format: `[skill-name]-[action]-[modifier].py`
- Examples:
  - `research-web-scrape.py`
  - `research-summarize-article.py`
  - `validate-json-schema.py`
  - `generate-report-pdf.py`

## Description Best Practices

Your description should:
- Clearly state what the skill does
- Include trigger phrases (e.g., "USE WHEN user says...")
- Mention key tools/methods used
- Be concise but complete (1-3 sentences)

**Good examples:**
- "Multi-source comprehensive research using perplexity-researcher, claude-researcher, and gemini-researcher agents. Launches up to 10 parallel research agents for fast results. USE WHEN user says 'do research', 'research X', 'find information about'..."
- "Chrome DevTools MCP for web application debugging, visual testing, and browser automation. The ONLY acceptable way to debug web apps - NEVER use curl, fetch, or wget."

## Templates Available

- `simple-skill-template.md` - For straightforward capabilities
- `complex-skill-template.md` - For multi-component skills
- `skill-with-agents-template.md` - For skills using sub-agents
- `script-template.py` - For executable tools (NEW)

## Supplementary Resources

For complete guide with examples: `read ${PAI_DIR}/skills/create-skill/CLAUDE.md`
For templates: `ls ${PAI_DIR}/skills/create-skill/templates/`
For Anthropic patterns: `read ${PAI_DIR}/skills/create-skill/docs/ANTHROPIC_PATTERNS_ENHANCEMENT.md`

## Key Principles

1. **Progressive disclosure**: SKILL.md = quick reference, CLAUDE.md = deep dive
2. **Scripts as tools**: Reusable code lives in scripts/, not regenerated (NEW)
3. **Clear activation triggers**: User should know when skill applies
4. **Executable instructions**: Imperative/infinitive form (verb-first)
5. **Context inheritance**: Skills inherit global context automatically
6. **No duplication**: Reference global context, don't duplicate it
7. **Self-contained**: Skill should work independently
8. **Discoverable**: Description enables Kai to match user intent
9. **Skills + MCP**: Skills = expertise, MCP servers = connectivity (NEW)
