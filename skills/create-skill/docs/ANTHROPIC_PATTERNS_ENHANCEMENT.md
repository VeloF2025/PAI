# Anthropic Agent Skills Patterns - Enhancement Guide

**Source:** Anthropic YouTube Video - "Agents & Tools: Skills" by Barry and Mahes
**Key Message:** "Stop building agents, start building skills"

---

## Executive Summary

This document captures key patterns from Anthropic's Agent Skills architecture and maps them to improvements for our PAI skill system.

### What We Already Do Well
- Progressive disclosure (metadata → SKILL.md → workflows)
- Clear trigger phrases and natural language routing
- Workflow organization with assets
- Self-contained skill containers

### Key Improvements to Implement
1. **Scripts as Tools** - Add executable scripts within skills
2. **Tool Metadata Format** - Self-documenting tool structure
3. **Dynamic Skill Growth** - Skills save reusable code as tools
4. **Skill Categories** - Foundational, Third-Party, Enterprise

---

## Pattern 1: Scripts as Tools (HIGH PRIORITY)

### Anthropic's Approach
> "We kept seeing Claude write the same Python script over and over again... So we just ask Claude to save it inside of the skill as a tool"

**File Structure:**
```
skill-name/
├── SKILL.md
├── workflows/
├── assets/
└── scripts/           # NEW - Executable tools
    ├── analyze.py     # Python script Claude can run
    ├── generate.sh    # Bash script
    └── validate.js    # Node script
```

### Implementation Pattern
Each script should be:
1. **Self-documenting** - Clear docstring with purpose, args, output
2. **Single-purpose** - One task per script
3. **Idempotent** - Safe to run multiple times
4. **Error-handling** - Clear error messages

**Example Script Template:**
```python
#!/usr/bin/env python3
"""
[skill-name]-[action].py

Purpose: [What this script does]
Usage: python [script-name].py <arg1> <arg2>
Args:
    arg1: Description of argument 1
    arg2: Description of argument 2
Output: [What the script returns/prints]

Example:
    python research-extract.py "https://example.com" --format json
"""

import argparse
import sys

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', help='Input to process')
    parser.add_argument('--format', choices=['json', 'text'], default='text')
    args = parser.parse_args()

    # Implementation
    result = process(args.input, args.format)
    print(result)
    return 0

def process(input_data, output_format):
    """Core processing logic."""
    # Implementation here
    pass

if __name__ == '__main__':
    sys.exit(main())
```

### SKILL.md Enhancement
Add a "Available Tools" section:
```markdown
## Available Tools

This skill includes executable scripts in `scripts/`:

| Script | Purpose | Usage |
|--------|---------|-------|
| `analyze.py` | Analyze input data | `python scripts/analyze.py <input>` |
| `generate.sh` | Generate output files | `bash scripts/generate.sh <template>` |

Claude can run these directly when needed for this skill's tasks.
```

---

## Pattern 2: Tool Metadata Format

### Anthropic's Approach
Scripts should be instantly understandable by Claude without reading the full file.

**Naming Convention:**
```
[skill-name]-[action]-[modifier].py
```

**Examples:**
- `research-web-scrape.py`
- `research-summarize-article.py`
- `validate-json-schema.py`
- `generate-report-pdf.py`

**Self-Documentation Requirements:**
1. Purpose in first line docstring
2. Usage pattern with examples
3. Input/output format specifications
4. Error conditions and handling

---

## Pattern 3: Dynamic Skill Growth

### Anthropic's Approach
> "Skills can create new tools for themselves"

When Claude writes useful code during a task, it should be captured:

**Workflow Addition to SKILL.md:**
```markdown
## Skill Maintenance

### Adding New Tools
When you write reusable code during skill execution:
1. Extract the code into a standalone script
2. Add proper documentation (see template above)
3. Save to `scripts/[action-name].py`
4. Update this SKILL.md's "Available Tools" section

### Tool Evolution
- Track which tools are used most frequently
- Refine tools based on actual usage patterns
- Deprecate tools that aren't being used
```

---

## Pattern 4: Skill Categories

### Anthropic's Framework

**Foundational Skills** (Built-in, always available):
- Core reasoning and analysis
- File operations
- Basic coding patterns

**Third-Party Skills** (MCP servers, external tools):
- Database connections
- API integrations
- Specialized tools (Playwright, etc.)

**Enterprise/Team Skills** (Custom, domain-specific):
- Company-specific workflows
- Project templates
- Team conventions

### PAI Implementation
Update skill organization to reflect categories:

```
~/.claude/skills/
├── foundational/     # Always available
│   ├── reasoning/
│   ├── coding/
│   └── file-ops/
├── third-party/      # MCP server integrations
│   ├── playwright/
│   ├── github/
│   └── database/
├── enterprise/       # Custom domain skills
│   ├── research/
│   ├── content/
│   └── automation/
└── create-skill/     # Meta-skill for creating skills
```

---

## Pattern 5: Skills + MCP = Expertise + Connectivity

### Anthropic's Insight
> "Skills are expertise, MCP servers are connectivity"

**Separation of Concerns:**
- **Skills**: Know HOW to do something (methodology, patterns)
- **MCP Servers**: Provide ACCESS to something (APIs, databases)

**Integration Pattern:**
```markdown
## MCP Integration

This skill works with these MCP servers:
- `@github` - For repository operations
- `@playwright` - For browser automation
- `@memory` - For knowledge persistence

When using this skill, ensure these MCP servers are connected.
```

---

## Implementation Roadmap

### Phase 1: Add Scripts Directory (Immediate)
1. Add `scripts/` directory to skill template
2. Create script template with proper documentation
3. Update SKILL.md template to include "Available Tools" section

### Phase 2: Update Existing Skills (Short-term)
1. Identify reusable code patterns in existing skills
2. Extract to standalone scripts
3. Document and test each script

### Phase 3: Skill Categories (Medium-term)
1. Reorganize skill directory structure
2. Create foundational skills that others depend on
3. Document skill dependencies

### Phase 4: Dynamic Growth System (Long-term)
1. Create workflow for capturing useful code as tools
2. Implement tool usage tracking
3. Build tool recommendation system

---

## Updated Skill Template

### Directory Structure (Enhanced)
```
skill-name/
├── SKILL.md              # Quick reference + routing
├── CLAUDE.md             # Deep context (if complex)
├── workflows/            # Task-specific workflows
│   ├── primary-task.md
│   └── secondary-task.md
├── scripts/              # NEW: Executable tools
│   ├── [skill]-action1.py
│   └── [skill]-action2.sh
├── assets/               # Templates, references
│   └── template.md
└── README.md             # Overview (optional)
```

### SKILL.md Template (Enhanced)
```markdown
---
name: skill-name
description: |
  What this skill does and when to use it.
  USE WHEN user says 'trigger phrase 1', 'trigger phrase 2'
---

# Skill Name

## When to Activate This Skill
- Trigger condition 1
- Trigger condition 2

## Core Workflow
[Main skill instructions]

## Available Tools

| Script | Purpose | Usage |
|--------|---------|-------|
| `script1.py` | Description | `python scripts/script1.py <args>` |
| `script2.sh` | Description | `bash scripts/script2.sh <args>` |

## MCP Integrations
- `@mcp-server` - What it provides

## Workflows
- `workflows/task1.md` - For specific task 1
- `workflows/task2.md` - For specific task 2

## Resources
For detailed context: `read ${PAI_DIR}/skills/skill-name/CLAUDE.md`
```

---

## Key Takeaways

1. **Skills are reusable expertise** - Not one-off solutions
2. **Scripts make skills actionable** - Claude can execute them
3. **Self-documentation is critical** - Tools must explain themselves
4. **Skills should grow over time** - Capture useful code as tools
5. **Separate expertise from connectivity** - Skills + MCP servers

---

*Document created based on Anthropic's Agent Skills architecture patterns*
*Last updated: December 2024*
