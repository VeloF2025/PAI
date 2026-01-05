# Create Skill - Pack v2.0

**Pack Version**: 2.0
**Created**: 2026-01-03
**Complexity**: Medium (Skill creation framework with templates and workflows)

---

## Overview

**Create Skill** is a comprehensive framework for creating new skills in Kai's Personal AI Infrastructure (PAI). It combines Anthropic's official skill methodology with PAI-specific patterns to help you extend Claude's capabilities through modular, self-contained skills. The framework includes templates, workflows, best practices, and the "scripts as tools" pattern from Anthropic.

**What's Included:**
- Skill creation framework (`create-skill`)
- 3 guided workflows (create new, create with research, update existing)
- 6 skill templates (simple, complex, agents, CLAUDE.md, script, README)
- Anthropic patterns documentation ("scripts as tools")
- Complete skill architecture guide

---

## Architecture

### The Skill Creation System

```
User Request: "Create a new skill for X"
    ↓
create-skill Framework Activated
    ↓
Phase 1: Planning
    ├─ Understand purpose (what, when, dependencies)
    ├─ Choose skill type (simple, standard, complex)
    └─ Determine structure (SKILL.md only vs. full package)
    ↓
Phase 2: Structure Creation
    ├─ Create directory (skills/skill-name/)
    ├─ Add workflows/ if needed
    ├─ Add scripts/ if needed (Anthropic "scripts as tools")
    └─ Add templates/ or docs/ if complex
    ↓
Phase 3: Content Creation
    ├─ Write SKILL.md (frontmatter + quick reference)
    ├─ Write workflows/*.md (task-specific workflows)
    ├─ Create scripts/*.py (reusable tools - NEW)
    └─ Write CLAUDE.md if complex (full methodology)
    ↓
Phase 4: Integration
    ├─ Update KAI.md available_skills list
    ├─ Test activation triggers
    └─ Verify skill loads correctly
    ↓
Complete Skill Package Ready
```

### Three-Layer Loading System

```
Layer 1: Metadata (Always Loaded in System Prompt)
---
name: skill-name
description: What it does + USE WHEN triggers
---
    ↓
Layer 2: SKILL.md Body (Loaded When Skill Activates)
    ├─ When to Activate This Skill
    ├─ Core Workflow
    ├─ Available Tools (scripts)
    ├─ Examples
    └─ Supplementary Resources
    ↓
Layer 3: Supporting Resources (Loaded As Needed)
    ├─ CLAUDE.md (comprehensive methodology)
    ├─ workflows/*.md (task-specific workflows)
    ├─ scripts/*.py (executable tools)
    └─ templates/, docs/, assets/
```

---

## Key Features

### 1. Three Skill Type Patterns

**Simple Skill** (SKILL.md only):
```
skills/fabric-patterns/
└── SKILL.md          # Everything in one file
```

**Use When:**
- Single focused capability
- Minimal dependencies
- Quick reference suffices
- Examples: fabric-patterns, youtube-extraction

**Standard Skill** (SKILL.md + workflows + scripts - NEW):
```
skills/research/
├── SKILL.md           # Quick reference + tool inventory
├── workflows/         # Task-specific workflows
│   └── conduct.md
└── scripts/           # Executable tools (Anthropic pattern)
    └── research-web-scrape.py
```

**Use When:**
- Multiple workflows for different tasks
- Reusable scripts Claude can execute directly
- Follows Anthropic "scripts as tools" pattern
- Examples: research, content-creation, data-analysis

**Complex Skill** (SKILL.md + CLAUDE.md + supporting files):
```
skills/development/
├── SKILL.md                      # Quick reference
├── CLAUDE.md                     # Full methodology
├── primary-stack/                # Reusable components
│   ├── auth-setup.md
│   ├── stripe-billing.md
│   └── business-metrics.md
├── style-guide/                  # UI patterns
└── scripts/                      # Executable tools
```

**Use When:**
- Multi-step workflows
- Extensive methodology
- Multiple sub-components
- Deep context required
- Examples: development, website, consulting

---

### 2. Scripts as Tools (Anthropic Pattern) - NEW

**Key Insight from Anthropic**:
> "We kept seeing Claude write the same Python script over and over again... So we just ask Claude to save it inside of the skill as a tool"

**When to Add Scripts:**
- Claude repeatedly writes similar code for this skill
- The operation can be parameterized
- It's faster to run a script than regenerate code

**Script Requirements:**
1. **Self-documenting** - Clear docstring with purpose, args, output
2. **Single-purpose** - One task per script
3. **Proper error handling** - Graceful failures with clear messages
4. **Naming convention** - `[skill-name]-[action].py`

**Example Script Structure**:
```python
#!/usr/bin/env python3
"""
research-web-scrape.py - Web scraping tool for research skill

Purpose: Extract structured data from web pages
Args: URL, selector pattern
Output: JSON data
Dependencies: requests, beautifulsoup4
"""

import sys
import json
import requests
from bs4 import BeautifulSoup

def scrape_url(url: str, selector: str) -> dict:
    """Scrape structured data from URL using CSS selector"""
    # Implementation...
    pass

if __name__ == "__main__":
    # CLI interface
    # Error handling
    # JSON output
    pass
```

**Benefits:**
- ✅ Faster execution (run script vs. regenerate code)
- ✅ Consistency (same script every time)
- ✅ Reusability (parameterized for different inputs)
- ✅ Testability (scripts can be unit tested)

---

### 3. Six Professional Templates

**1. simple-skill-template.md**
- Minimal structure
- Single SKILL.md file
- Quick reference format
- For straightforward capabilities

**2. complex-skill-template.md**
- Full skill package structure
- SKILL.md + CLAUDE.md
- Workflow directories
- For multi-component skills

**3. skill-with-agents-template.md**
- Sub-agent orchestration patterns
- Parallel agent launch examples
- Result synthesis workflows
- For skills that delegate to agents

**4. CLAUDE-template.md**
- Comprehensive methodology structure
- Detailed workflow documentation
- Integration instructions
- For complex skill context files

**5. script-template.py** (NEW)
- Anthropic "scripts as tools" pattern
- Self-documenting code structure
- CLI interface example
- Error handling best practices

**6. README.md (templates/)**
- Template overview
- Usage instructions
- Template selection guide
- Customization examples

---

### 4. Guided Workflows

**create-new.md** - Basic skill creation:
- Define purpose (5 discovery questions)
- Choose structure (simple/complex)
- Write SKILL.md with frontmatter
- Add workflows if needed
- Test activation triggers

**create-new-with-research.md** - Research-enhanced creation:
- User provides skill concept
- Launch research agents to gather best practices
- Analyze existing skills for patterns
- Generate skill based on research findings
- Include discovered patterns and methodologies
- Comprehensive documentation from research

**update-existing.md** - Skill improvement:
- Identify skill to update
- Determine update type (content, structure, patterns)
- Modify relevant files
- Maintain backward compatibility
- Test updated functionality

---

### 5. Skill Architecture Guide

**Progressive Disclosure Pattern**:
- **SKILL.md**: Quick reference (always loaded when skill activates)
- **CLAUDE.md**: Deep dive (loaded when user needs full context)
- **Supporting Resources**: On-demand loading (workflows, scripts, docs)

**Token Efficiency**:
- Metadata always in system prompt (50-100 tokens)
- SKILL.md body loaded on activation (500-2000 tokens)
- CLAUDE.md + resources only when explicitly needed (5,000-20,000 tokens)

**Context Inheritance**:
- Skills automatically inherit global context from KAI.md
- No need to duplicate contact lists, security rules, or core principles
- Reference global context, don't replicate it

---

### 6. Activation Trigger Best Practices

**Description Best Practices**:

Your description should:
1. Clearly state what the skill does
2. Include trigger phrases (e.g., "USE WHEN user says...")
3. Mention key tools/methods used
4. Be concise but complete (1-3 sentences)

**Good Examples from PAI**:

**research skill**:
```yaml
description: Multi-source comprehensive research using perplexity-researcher, claude-researcher, and gemini-researcher agents. Launches up to 10 parallel research agents for fast results. USE WHEN user says 'do research', 'research X', 'find information about', 'investigate', 'analyze trends', 'current events', or any research-related request.
```
✅ Clear what it does (multi-source research)
✅ Mentions tools (3 researcher types)
✅ Lists explicit triggers
✅ Explains benefit (parallel, fast)

**chrome-devtools skill**:
```yaml
description: Chrome DevTools MCP for web application debugging, visual testing, and browser automation. The ONLY acceptable way to debug web apps - NEVER use curl, fetch, or wget. Provides screenshots, console inspection, network monitoring, and DOM analysis.
```
✅ States purpose (debugging, testing)
✅ Strong negative trigger (never use curl)
✅ Lists capabilities
✅ Clear domain (web applications)

**Bad example**:
```yaml
description: A skill for development tasks
```
❌ Too vague
❌ No triggers
❌ No tools mentioned
❌ Unclear when to use

---

## Use Cases

### 1. Creating a Simple Skill

**Scenario**: Creating a skill for YouTube video metadata extraction

**Workflow**:
1. User: "Create a skill for extracting YouTube video metadata"
2. create-skill activates
3. Discovery questions:
   - What does it do? Extract title, description, views, duration from YouTube URLs
   - When should it activate? When user provides YouTube URL or asks about video info
   - Tools? yt-dlp or YouTube API
   - Complexity? Simple (single focused task)
4. Choose Simple Skill structure (SKILL.md only)
5. Use simple-skill-template.md
6. Write SKILL.md with:
   - Frontmatter: `name: youtube-metadata`, description with triggers
   - When to Activate section: YouTube URL patterns, video info requests
   - Core workflow: Extract metadata using yt-dlp
   - Examples: Sample YouTube URLs and expected output
7. Test: Provide YouTube URL, verify skill activates
8. Update KAI.md available_skills list

**Result**: youtube-metadata skill (SKILL.md only, ~100 lines)

---

### 2. Creating a Standard Skill with Scripts

**Scenario**: Creating a skill for JSON schema validation with reusable scripts

**Workflow**:
1. User: "Create a skill for validating JSON data against schemas"
2. create-skill activates
3. Discovery questions reveal:
   - Repeated validation operations
   - Need for parameterized schema checks
   - Multiple validation types (structure, types, required fields)
4. Choose Standard Skill structure (SKILL.md + scripts/)
5. Create directory:
   ```
   skills/validate-json/
   ├── SKILL.md
   └── scripts/
       ├── validate-json-schema.py
       ├── validate-json-structure.py
       └── validate-json-types.py
   ```
6. Use script-template.py for each validation script
7. Write SKILL.md with Available Tools section:
   | Script | Purpose | Usage |
   |--------|---------|-------|
   | `validate-json-schema.py` | Validate against JSON Schema | `python scripts/validate-json-schema.py <file> <schema>` |
8. Test scripts execute correctly
9. Update KAI.md

**Result**: validate-json skill with 3 reusable scripts (Standard Skill pattern)

---

### 3. Creating a Complex Skill

**Scenario**: Creating a comprehensive web development skill with full methodology

**Workflow**:
1. User: "Create a skill for full-stack web development with Next.js"
2. create-skill activates
3. Discovery reveals:
   - Multi-step workflows (setup, auth, database, deployment)
   - Extensive methodology needed
   - Multiple sub-components (primary stack, style guide, deployment)
4. Choose Complex Skill structure
5. Use complex-skill-template.md
6. Create directory:
   ```
   skills/nextjs-development/
   ├── SKILL.md                      # Quick reference
   ├── CLAUDE.md                     # Full methodology
   ├── primary-stack/
   │   ├── nextjs-setup.md
   │   ├── auth-clerk.md
   │   ├── database-drizzle.md
   │   └── deployment-vercel.md
   ├── style-guide/
   │   └── tailwind-conventions.md
   └── scripts/
       └── nextjs-create-component.py
   ```
7. Write SKILL.md (quick reference to workflows)
8. Write CLAUDE.md using CLAUDE-template.md (comprehensive methodology)
9. Populate primary-stack/ with setup guides
10. Test complete workflow

**Result**: nextjs-development complex skill (10+ files, comprehensive)

---

### 4. Creating a Skill with Research

**Scenario**: Creating a skill for threat modeling with industry best practices

**Workflow**:
1. User: "Create a skill for threat modeling using STRIDE methodology"
2. create-skill activates create-new-with-research.md workflow
3. Launch research agents to gather:
   - STRIDE methodology documentation
   - Threat modeling best practices
   - Security frameworks (OWASP, NIST)
   - Real-world threat model examples
4. Research agents return findings (9 agents, 30-90 seconds)
5. Synthesize research into skill structure:
   - STRIDE framework components
   - Threat category templates
   - Mitigation strategies
   - Example threat models
6. Generate SKILL.md with research-backed content
7. Include discovered patterns in workflows/
8. Add threat model templates to templates/

**Result**: threat-modeling skill with research-backed methodology

---

### 5. Updating an Existing Skill

**Scenario**: Adding "scripts as tools" pattern to research skill

**Workflow**:
1. User: "Add web scraping script to research skill"
2. create-skill activates update-existing.md workflow
3. Identify skill: research
4. Update type: Add scripts/ directory (new pattern)
5. Determine repeated operation: Web scraping during research
6. Create scripts/research-web-scrape.py using script-template.py
7. Update SKILL.md to include Available Tools section
8. Test script execution within research workflow
9. Verify backward compatibility (existing workflows still work)

**Result**: research skill now has reusable web scraping script

---

## Installation

**Prerequisites**: Claude Code CLI (create-skill is a PAI built-in framework)

**Installation Steps**:
1. Skill files already installed at `~/.claude/skills/create-skill/`
2. No additional setup required (framework-only skill)

See `PACK_INSTALL.md` for detailed verification and template access.

---

## Verification

**Basic Verification**:
```bash
# 1. Verify skill files exist
ls -la "$HOME/.claude/skills/create-skill/"

# 2. Test skill activation
# In Claude Code session, say: "Create a new skill for X"
```

See `PACK_VERIFY.md` for comprehensive verification checklist.

---

## Dependencies

### Required
- **Claude Code CLI**: Skill execution environment

### Optional
- **Python 3.8+**: For creating skills with scripts/ directory
- **Templates**: Included in create-skill/templates/ directory

---

## Skill Integration Points

### Reads From
- User input (skill concept, requirements)
- Existing skill structures (for pattern analysis)
- Templates from create-skill/templates/
- Anthropic patterns documentation

### Writes To
- New skill directories under ~/.claude/skills/
- SKILL.md files (all new skills)
- CLAUDE.md files (complex skills)
- workflows/*.md (guided workflows)
- scripts/*.py (reusable tools)

### Integrates With
- **research skill**: Can use research agents to gather best practices
- **validation skills**: Can validate created skill structure
- **KAI.md**: Updates available_skills list for discoverability

---

## Configuration

**No configuration required** - create-skill is a framework with templates and workflows.

**Customization Options**:
- Modify templates in create-skill/templates/ for your patterns
- Add new workflows to create-skill/workflows/
- Extend Anthropic patterns in docs/ANTHROPIC_PATTERNS_ENHANCEMENT.md

---

## Performance Characteristics

### Speed
- **Simple skill creation**: 5-10 minutes (SKILL.md only)
- **Standard skill creation**: 15-20 minutes (SKILL.md + workflows + scripts)
- **Complex skill creation**: 30-60 minutes (full package)
- **Skill with research**: +5-10 minutes (research phase)

### Quality
- **Template-driven**: Consistent structure across all created skills
- **Best practices**: Follows Anthropic + PAI patterns
- **Anthropic patterns**: "Scripts as tools" pattern for reusability
- **Progressive disclosure**: Proper Layer 1/2/3 resource organization

### Token Efficiency
- **Metadata**: 50-100 tokens (always loaded)
- **SKILL.md**: 500-2000 tokens (loaded on activation)
- **CLAUDE.md**: 5,000-20,000 tokens (loaded on-demand)
- **Total savings**: 60-80% vs. loading everything upfront

---

## Naming Conventions

### Skill Names
- **Lowercase with hyphens**: `create-skill`, `web-scraping`
- **Descriptive, not generic**: `fabric-patterns` not `text-processing`
- **Action or domain focused**: `ai-image-generation`, `chrome-devtools`

### Script Names (NEW)
- **Format**: `[skill-name]-[action]-[modifier].py`
- **Examples**:
  - `research-web-scrape.py`
  - `research-summarize-article.py`
  - `validate-json-schema.py`
  - `generate-report-pdf.py`

---

## Anthropic Patterns Integration

### "Scripts as Tools" Pattern (NEW)

**Before** (Claude regenerates code every time):
```
User: "Validate this JSON against the schema"
Claude: [Writes 50-line validation script from scratch]

User: "Validate this other JSON"
Claude: [Writes same 50-line script again]
```

**After** (Claude uses saved script):
```
User: "Validate this JSON against the schema"
Claude: python scripts/validate-json-schema.py data.json schema.json
[Instant execution, consistent behavior]
```

**Implementation**:
1. Identify repeated operations in your skill
2. Create script using script-template.py
3. Add to scripts/ directory
4. Document in SKILL.md Available Tools section
5. Claude now executes script instead of regenerating code

---

## Security Considerations

### Data Privacy
- All skill creation happens locally
- No external API calls during skill generation
- Templates stored in PAI directory

### Code Safety
- Scripts should validate inputs
- Error handling prevents unsafe operations
- Follow PAI security rules from global context

---

## Additional Resources

**Anthropic Patterns**:
- `docs/ANTHROPIC_PATTERNS_ENHANCEMENT.md` - "Scripts as tools" pattern details
- Official Anthropic skill methodology integration

**Templates Directory**:
- `templates/simple-skill-template.md`
- `templates/complex-skill-template.md`
- `templates/skill-with-agents-template.md`
- `templates/CLAUDE-template.md`
- `templates/script-template.py` (NEW)
- `templates/README.md` (template guide)

**Workflows**:
- `workflows/create-new.md` - Basic skill creation
- `workflows/create-new-with-research.md` - Research-enhanced creation
- `workflows/update-existing.md` - Skill modification

**Comprehensive Guide**:
- `CLAUDE.md` - Full skill creation methodology

---

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

---

**Pack Version**: 2.0
**Last Updated**: 2026-01-03
**Maintained By**: PAI Core Team
