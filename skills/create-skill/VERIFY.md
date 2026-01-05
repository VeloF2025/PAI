# create-skill - Verification Guide

**Pack Version**: 2.0
**Verification Time**: 45-60 minutes (comprehensive)
**Complexity**: Medium (Multiple components and skill types)

---

## Prerequisites for Verification

Before starting verification, ensure you have:

- ✅ Claude Code CLI installed and working
- ✅ create-skill Pack files installed (PACK_README.md, PACK_INSTALL.md, PACK_VERIFY.md)
- ✅ Python 3.8+ installed (for scripts/ pattern verification - optional)
- ✅ Basic understanding of skill structure (from PACK_README.md)

---

## Quick Verification Checklist

Use this checklist for rapid verification. Detailed tests follow in subsequent sections.

### Core Functionality
- [ ] create-skill framework activates on request
- [ ] All 6 templates accessible
- [ ] All 3 workflows execute
- [ ] Can create Simple skill
- [ ] Can create Standard skill (with scripts)
- [ ] Can create Complex skill

### Documentation
- [ ] SKILL.md exists and loads
- [ ] CLAUDE.md exists and loads
- [ ] All Pack files exist (README, INSTALL, VERIFY)
- [ ] All 6 templates exist
- [ ] All 3 workflows exist

### Integration
- [ ] Works with research skill (research-enhanced creation)
- [ ] Created skills activate properly
- [ ] Scripts pattern works (if Python installed)

### Quality
- [ ] Generated skills follow Anthropic standards
- [ ] Progressive disclosure implemented correctly
- [ ] No hallucinated methods or files
- [ ] Naming conventions followed

---

## 1. File Verification

### 1.1 Core Skill Files

**Verify SKILL.md exists:**

```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/create-skill/SKILL.md"

# Windows PowerShell
Test-Path "$env:USERPROFILE\.claude\skills\create-skill\SKILL.md"
```

**Expected**: File exists (~191 lines)

**Verify CLAUDE.md exists:**

```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/create-skill/CLAUDE.md"

# Windows PowerShell
Test-Path "$env:USERPROFILE\.claude\skills\create-skill\CLAUDE.md"
```

**Expected**: File exists (comprehensive methodology documentation)

**Verification:**
- [ ] SKILL.md exists and is readable
- [ ] CLAUDE.md exists and is readable
- [ ] Both files contain frontmatter
- [ ] Description includes activation triggers

---

### 1.2 Pack Files

**Verify all Pack files exist:**

```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/create-skill/PACK_"*

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\create-skill\PACK_*"
```

**Expected Files:**
- PACK_README.md (~700 lines)
- PACK_INSTALL.md (~600 lines)
- PACK_VERIFY.md (this file, ~650 lines)

**Verification:**
- [ ] PACK_README.md exists
- [ ] PACK_INSTALL.md exists
- [ ] PACK_VERIFY.md exists
- [ ] All Pack files are readable

---

### 1.3 Templates Directory

**Verify templates/ directory structure:**

```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/create-skill/templates/"

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\create-skill\templates\" -Recurse
```

**Expected Files** (6 templates):
1. `simple-skill-template.md` - Single SKILL.md pattern
2. `standard-skill-template.md` - SKILL.md + workflows + scripts (NEW)
3. `complex-skill-template.md` - Full package with CLAUDE.md
4. `workflow-template.md` - Individual workflow file
5. `claude-md-template.md` - Comprehensive CLAUDE.md structure
6. `script-template.py` - Python script for "scripts as tools" pattern

**Verification:**
- [ ] templates/ directory exists
- [ ] All 6 template files exist
- [ ] simple-skill-template.md is readable
- [ ] standard-skill-template.md is readable (NEW Anthropic pattern)
- [ ] complex-skill-template.md is readable
- [ ] workflow-template.md is readable
- [ ] claude-md-template.md is readable
- [ ] script-template.py is readable

---

### 1.4 Workflows Directory

**Verify workflows/ directory structure:**

```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/create-skill/workflows/"

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\create-skill\workflows\"
```

**Expected Files** (3 workflows):
1. `create-new.md` - Basic skill creation workflow
2. `create-new-with-research.md` - Research-enhanced skill creation
3. `update-existing.md` - Skill modification workflow

**Verification:**
- [ ] workflows/ directory exists
- [ ] create-new.md exists
- [ ] create-new-with-research.md exists
- [ ] update-existing.md exists
- [ ] All workflows are readable

---

### 1.5 Documentation Directory

**Verify docs/ directory:**

```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/create-skill/docs/"

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\create-skill\docs\"
```

**Expected Files**:
- `anthropic-patterns.md` - Anthropic skill development best practices

**Verification:**
- [ ] docs/ directory exists
- [ ] anthropic-patterns.md exists
- [ ] Documentation is readable

---

## 2. Skill Loading Verification

### 2.1 Test Skill Activation

Start a Claude Code session:

```bash
claude
```

In the session, explicitly activate create-skill:

```
Use create-skill to create a new productivity skill
```

**Expected Behavior:**
- create-skill framework activates
- Kai loads create-skill context
- Begins Phase 1: Planning (asks about purpose, type, dependencies)

**Verification:**
- [ ] Skill activates on explicit request
- [ ] Kai enters guided workflow
- [ ] Asks discovery questions (purpose, activation triggers, type)
- [ ] No errors in activation

---

### 2.2 Test Auto-Detection

In a Claude Code session, use natural language without explicit skill name:

```
I want to create a new skill for analyzing code quality
```

**Expected Behavior:**
- Claude detects skill creation intent
- Activates create-skill framework automatically
- Begins planning workflow

**Verification:**
- [ ] Auto-detection works
- [ ] create-skill activates without explicit mention
- [ ] Workflow starts naturally

---

### 2.3 Test Pack Documentation Loading

Request Pack documentation:

```
Load the create-skill Pack README
```

**Expected Behavior:**
- Kai reads PACK_README.md
- Provides overview of skill creation framework
- Mentions three skill types, templates, Anthropic patterns

**Verification:**
- [ ] Pack README loads on-demand
- [ ] Contains architecture information
- [ ] Describes all skill types (Simple, Standard, Complex)
- [ ] Documents NEW Anthropic "scripts as tools" pattern

---

## 3. Template Access Verification

### 3.1 Verify Simple Skill Template

Request simple skill template:

```
Show me the simple skill template structure
```

**Expected Response:**
- Kai reads `templates/simple-skill-template.md`
- Shows single SKILL.md structure
- Includes frontmatter example
- Explains when to use (single focused capability)

**Verification:**
- [ ] Template accessible
- [ ] Contains frontmatter structure
- [ ] Includes activation trigger guidance
- [ ] Provides usage examples

---

### 3.2 Verify Standard Skill Template (NEW Anthropic Pattern)

Request standard skill template:

```
Show me the standard skill template with scripts pattern
```

**Expected Response:**
- Kai reads `templates/standard-skill-template.md`
- Shows SKILL.md + workflows/ + scripts/ structure
- Explains Anthropic "scripts as tools" pattern
- Provides script integration guidance

**Verification:**
- [ ] Template accessible
- [ ] Includes scripts/ directory pattern
- [ ] Documents Anthropic pattern
- [ ] Shows script naming conventions
- [ ] Provides script template reference

---

### 3.3 Verify Complex Skill Template

Request complex skill template:

```
Show me the complex skill template structure
```

**Expected Response:**
- Kai reads `templates/complex-skill-template.md`
- Shows full package: SKILL.md + CLAUDE.md + subdirectories
- Explains progressive disclosure (Layer 1/2/3)
- Documents when to use (multi-component systems)

**Verification:**
- [ ] Template accessible
- [ ] Includes CLAUDE.md structure
- [ ] Documents progressive disclosure
- [ ] Shows full directory tree

---

### 3.4 Verify Workflow Template

Request workflow template:

```
Show me the workflow template format
```

**Expected Response:**
- Kai reads `templates/workflow-template.md`
- Shows workflow file structure
- Provides step-by-step format guidance
- Includes examples and decision points

**Verification:**
- [ ] Template accessible
- [ ] Contains workflow structure
- [ ] Includes step numbering format
- [ ] Shows decision point syntax

---

### 3.5 Verify CLAUDE.md Template

Request CLAUDE.md template:

```
Show me the CLAUDE.md template for comprehensive skills
```

**Expected Response:**
- Kai reads `templates/claude-md-template.md`
- Shows comprehensive context structure
- Documents sections (architecture, workflows, examples)
- Explains when Layer 3 loading is appropriate

**Verification:**
- [ ] Template accessible
- [ ] Contains full CLAUDE.md structure
- [ ] Includes section templates
- [ ] Documents progressive disclosure usage

---

### 3.6 Verify Script Template (Anthropic Pattern)

Request script template:

```
Show me the Python script template for the scripts as tools pattern
```

**Expected Response:**
- Kai reads `templates/script-template.py`
- Shows self-documenting script structure
- Includes argparse boilerplate
- Documents error handling pattern

**Verification:**
- [ ] Template accessible
- [ ] Includes docstring structure
- [ ] Shows argparse usage
- [ ] Documents error handling
- [ ] Includes execution guard (`if __name__ == "__main__"`)

---

## 4. Workflow Execution Verification

### 4.1 Test create-new.md Workflow

Request basic skill creation:

```
Walk me through creating a new skill using the basic workflow
```

**Expected Workflow Phases:**
1. **Define Skill Purpose** - Asks 4 key questions (what, when, tools, complexity)
2. **Choose Structure** - Determines Simple vs. Complex
3. **Create Files** - Generates appropriate template
4. **Add Activation Logic** - Helps write description with triggers
5. **Test & Iterate** - Guides testing

**Verification:**
- [ ] Workflow executes all 5 phases
- [ ] Asks appropriate discovery questions
- [ ] Recommends correct skill type based on answers
- [ ] Generates files from templates
- [ ] Provides testing guidance

---

### 4.2 Test create-new-with-research.md Workflow

Request research-enhanced creation:

```
Create a new skill with research-enhanced workflow for web scraping
```

**Expected Workflow Phases:**
1. **Initial Research** - Launches research skill to investigate domain
2. **Research Synthesis** - Analyzes findings for patterns/tools
3. **Define Skill Purpose** - Uses research to inform structure
4. **Choose Structure** - Determines appropriate complexity
5. **Create Files** - Generates enhanced template with research insights
6. **Add Activation Logic** - Creates informed triggers
7. **Test & Iterate** - Validates against research findings

**Verification:**
- [ ] Workflow integrates research skill
- [ ] Research results inform skill design
- [ ] Generated skill includes domain-specific patterns
- [ ] Description references research findings
- [ ] All 7 phases complete

---

### 4.3 Test update-existing.md Workflow

Request skill update:

```
Update an existing skill to add a new workflow
```

**Expected Workflow Phases:**
1. **Identify Skill** - Asks which skill to update
2. **Read Current Structure** - Analyzes existing files
3. **Determine Changes** - Plans modifications
4. **Update Files** - Modifies appropriate templates
5. **Test Changes** - Validates updates don't break existing functionality

**Verification:**
- [ ] Workflow reads existing skill files
- [ ] Preserves existing functionality
- [ ] Adds new components correctly
- [ ] Maintains naming conventions
- [ ] Tests updated skill

---

## 5. Functional Testing - Create Simple Skill

### 5.1 Complete Simple Skill Creation

Create a minimal skill from scratch:

```
Create a simple skill called "quote-of-day" that fetches inspirational quotes
```

**Expected Outputs:**

**File created**: `~/.claude/skills/quote-of-day/SKILL.md`

**Expected structure:**
```markdown
---
name: quote-of-day
description: Fetch inspirational quotes from various sources. USE WHEN user says 'quote', 'inspiration', 'motivate me', or requests daily wisdom.
---

## What This Skill Does

Retrieves inspirational quotes from curated sources and presents them to the user.

## When to Use

- User requests inspiration or motivation
- User asks for "quote of the day"
- User needs creative spark or positive reinforcement

## How It Works

1. User triggers with "give me a quote" or similar
2. Skill fetches quote from source (API or curated list)
3. Presents quote with attribution

## Example Usage

User: "I need some motivation"
Assistant: [Activates quote-of-day skill, fetches and presents quote]
```

**Verification:**
- [ ] SKILL.md created in correct location
- [ ] Frontmatter includes name and description
- [ ] Description includes USE WHEN triggers
- [ ] Body contains clear instructions
- [ ] Structure follows simple-skill-template.md
- [ ] No unnecessary files created (no CLAUDE.md, workflows/)

---

### 5.2 Test Created Simple Skill

Activate the newly created skill:

```
Give me a quote
```

**Expected Behavior:**
- quote-of-day skill activates (appears in available_skills)
- Kai follows the skill instructions
- Fetches and presents a quote

**Verification:**
- [ ] Skill appears in available_skills list
- [ ] Activation triggers work
- [ ] Skill executes as designed
- [ ] No errors during execution

---

## 6. Functional Testing - Create Standard Skill (with Scripts)

### 6.1 Complete Standard Skill Creation (NEW Anthropic Pattern)

Create a skill using the "scripts as tools" pattern:

```
Create a standard skill called "json-validator" that validates JSON against schemas using the scripts as tools pattern
```

**Expected Outputs:**

**Directory structure:**
```
json-validator/
├── SKILL.md
├── workflows/
│   └── validate-json.md
└── scripts/
    ├── validate-schema.py
    └── format-errors.py
```

**SKILL.md structure:**
```markdown
---
name: json-validator
description: Validate JSON data against JSON Schema definitions. Supports draft-07 schemas. USE WHEN user says 'validate json', 'check schema', or provides JSON data to verify.
---

## What This Skill Does

Validates JSON documents against JSON Schema, providing detailed error reporting.

## When to Use

- User needs to validate JSON data
- User wants to check schema compliance
- User requests format validation

## How It Works

1. User provides JSON data and schema
2. Skill executes `scripts/validate-schema.py`
3. If errors, executes `scripts/format-errors.py` for readable output
4. Returns validation results

## Available Scripts

### validate-schema.py
Validates JSON against schema, returns structured errors.

Usage: `python scripts/validate-schema.py data.json schema.json`

### format-errors.py
Formats validation errors for human readability.

Usage: `python scripts/format-errors.py errors.json`
```

**scripts/validate-schema.py structure:**
```python
#!/usr/bin/env python3
"""
JSON Schema Validator

Validates JSON data against JSON Schema (draft-07).
Returns structured error output for processing.
"""

import argparse
import json
import sys
from jsonschema import validate, ValidationError

def main():
    parser = argparse.ArgumentParser(description="Validate JSON against schema")
    parser.add_argument("data", help="Path to JSON data file")
    parser.add_argument("schema", help="Path to JSON schema file")
    args = parser.parse_args()

    # Implementation here

if __name__ == "__main__":
    main()
```

**Verification:**
- [ ] Directory created with correct structure
- [ ] SKILL.md exists with frontmatter
- [ ] workflows/ directory created
- [ ] scripts/ directory created
- [ ] Scripts are executable Python files
- [ ] Scripts include docstrings
- [ ] Scripts use argparse for parameters
- [ ] Scripts follow script-template.py pattern
- [ ] SKILL.md documents how to use scripts

---

### 6.2 Test Standard Skill Scripts Pattern

If Python is installed, test the created skill:

```
Validate this JSON: {"name": "test"} against schema: {"type": "object", "required": ["name"]}
```

**Expected Behavior:**
- json-validator skill activates
- Kai executes `python scripts/validate-schema.py ...`
- Returns validation result (valid in this case)

**Verification (if Python installed):**
- [ ] Skill activates correctly
- [ ] Script executes without errors
- [ ] Validation result is accurate
- [ ] Error handling works (test invalid JSON)

**Verification (if Python NOT installed):**
- [ ] Skill structure created correctly
- [ ] Scripts have proper syntax
- [ ] Documentation is clear
- [ ] Skip execution test

---

## 7. Functional Testing - Create Complex Skill

### 7.1 Complete Complex Skill Creation

Create a multi-component skill:

```
Create a complex skill called "api-client-generator" that generates API client code for REST APIs
```

**Expected Outputs:**

**Directory structure:**
```
api-client-generator/
├── SKILL.md
├── CLAUDE.md
├── workflows/
│   ├── analyze-api.md
│   ├── generate-client.md
│   └── test-client.md
├── templates/
│   ├── rest-client.ts
│   └── graphql-client.ts
└── docs/
    └── supported-patterns.md
```

**SKILL.md structure** (brief, references CLAUDE.md):
```markdown
---
name: api-client-generator
description: Generate type-safe API client code from OpenAPI specs, GraphQL schemas, or REST documentation. Supports TypeScript, Python, Go. USE WHEN user says 'generate api client', 'create rest client', or provides API specification.
---

## Quick Reference

Generates production-ready API client code from specifications.

**Supported Input Formats:**
- OpenAPI 3.0+ (YAML/JSON)
- GraphQL schemas
- REST documentation

**Supported Languages:**
- TypeScript (preferred)
- Python
- Go

## Basic Usage

User: "Generate TypeScript client for this OpenAPI spec"
Assistant: [Runs analyze-api workflow → generate-client workflow → outputs code]

## Full Documentation

For comprehensive workflow details, architecture, and examples, see CLAUDE.md.
```

**CLAUDE.md structure** (comprehensive):
```markdown
# 🏗️ API Client Generator - Comprehensive Documentation

## Architecture

### Three-Phase Generation System

```
API Specification
    ↓
Phase 1: Analysis (analyze-api.md)
    ├─ Parse specification format
    ├─ Extract endpoints/schemas
    └─ Identify patterns
    ↓
Phase 2: Generation (generate-client.md)
    ├─ Choose template (REST/GraphQL)
    ├─ Generate type definitions
    ├─ Generate client methods
    └─ Add error handling
    ↓
Phase 3: Testing (test-client.md)
    ├─ Generate test suite
    ├─ Mock API responses
    └─ Validate type safety
```

## Detailed Workflows

### Workflow 1: analyze-api.md
[Full workflow steps...]

### Workflow 2: generate-client.md
[Full workflow steps...]

## Templates Documentation
[Template details...]
```

**Verification:**
- [ ] Both SKILL.md and CLAUDE.md created
- [ ] SKILL.md is brief (quick reference only)
- [ ] CLAUDE.md is comprehensive (full architecture)
- [ ] All subdirectories created (workflows/, templates/, docs/)
- [ ] Progressive disclosure implemented (Layer 1/2/3)
- [ ] Structure follows complex-skill-template.md

---

### 7.2 Test Complex Skill Progressive Disclosure

**Layer 1 Test** (Metadata only):

```bash
# Check available_skills list
claude
# Look for api-client-generator in system prompt
```

**Expected**: Skill appears with description, not loaded yet

**Layer 2 Test** (SKILL.md loaded):

```
Use api-client-generator to create a client
```

**Expected**: SKILL.md loads, provides quick reference

**Layer 3 Test** (CLAUDE.md loaded):

```
Show me the full architecture for api-client-generator
```

**Expected**: CLAUDE.md loads with comprehensive documentation

**Verification:**
- [ ] Layer 1 works (metadata visible)
- [ ] Layer 2 works (SKILL.md loads on activation)
- [ ] Layer 3 works (CLAUDE.md loads on-demand)
- [ ] No upfront token waste (only metadata loaded initially)

---

## 8. Functional Testing - Create Skill with Research

### 8.1 Test Research-Enhanced Creation

**Prerequisites**: research skill must be installed

Create a skill using research workflow:

```
Create a skill for cryptocurrency price tracking using research-enhanced workflow
```

**Expected Workflow:**

1. **Research Phase** - Launches research skill:
   - Queries: "best cryptocurrency APIs 2026", "crypto price tracking libraries", "real-time crypto data sources"
   - Generates 3-9 research agents
   - Synthesizes findings

2. **Design Phase** - Uses research to inform skill:
   - Recommends APIs (CoinGecko, CryptoCompare, Binance based on research)
   - Suggests libraries (ccxt, crypto-api-client based on findings)
   - Determines complexity (likely Standard skill with scripts)

3. **Creation Phase** - Generates skill with research insights:
   - Scripts for API integration (based on researched best practices)
   - Workflows for price alerts, portfolio tracking
   - Documentation referencing research sources

**Verification:**
- [ ] Research skill launches successfully
- [ ] Research results influence skill design
- [ ] Generated skill includes researched APIs/libraries
- [ ] Documentation cites research findings
- [ ] Skill is more informed than without research

**If research skill not installed:**
- [ ] Workflow gracefully falls back to basic creation
- [ ] Warns user research skill unavailable
- [ ] Completes skill creation without research

---

## 9. Functional Testing - Update Existing Skill

### 9.1 Test Skill Modification

Update one of the previously created skills:

```
Update the quote-of-day skill to add a workflow for filtering quotes by category
```

**Expected Workflow:**

1. **Identify Skill** - Confirms skill to update (quote-of-day)
2. **Read Current Structure** - Analyzes existing SKILL.md
3. **Determine Changes**:
   - Add workflows/ directory (upgrading Simple → Standard)
   - Create workflow: filter-by-category.md
   - Update SKILL.md to reference new workflow
4. **Update Files**:
   - Creates workflows/filter-by-category.md
   - Updates SKILL.md with new usage section
   - Preserves existing frontmatter and instructions
5. **Test Changes** - Validates updated skill activates correctly

**Verification:**
- [ ] Existing SKILL.md preserved (not overwritten)
- [ ] New workflows/ directory added
- [ ] New workflow created with correct structure
- [ ] SKILL.md updated with new capability
- [ ] Frontmatter unchanged
- [ ] Skill still activates correctly
- [ ] No existing functionality broken

---

## 10. Anthropic Pattern Verification ("Scripts as Tools")

### 10.1 Verify Pattern Documentation

Read Anthropic patterns documentation:

```
Show me the Anthropic scripts as tools pattern documentation
```

**Expected Response:**
- Kai reads `docs/anthropic-patterns.md`
- Explains key insight: "We kept seeing Claude write the same Python script over and over again..."
- Documents when to use scripts (repetitive operations, parameterizable tasks)
- Shows before/after examples

**Verification:**
- [ ] Documentation exists and loads
- [ ] Contains Anthropic insight quote
- [ ] Explains benefits (faster, consistent, reusable, testable)
- [ ] Provides clear before/after comparison
- [ ] Documents requirements (self-documenting, single-purpose, error handling)

---

### 10.2 Verify Script Naming Convention

Check that generated scripts follow Anthropic naming guidelines:

**Convention**: `verb-noun.py` (e.g., `validate-schema.py`, `format-errors.py`)

Review scripts created in Standard skill test:

```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/json-validator/scripts/"

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\json-validator\scripts\"
```

**Expected Naming**:
- ✅ `validate-schema.py` (verb-noun format)
- ✅ `format-errors.py` (verb-noun format)
- ❌ NOT: `validator.py`, `schemaValidator.py`, `validate_schema.py`

**Verification:**
- [ ] Scripts use verb-noun.py format
- [ ] Names are descriptive
- [ ] No camelCase or snake_case
- [ ] Follows Anthropic convention

---

### 10.3 Verify Script Self-Documentation

Check that scripts are self-documenting:

```bash
# Unix/Mac
python "$HOME/.claude/skills/json-validator/scripts/validate-schema.py" --help

# Windows PowerShell
python "$env:USERPROFILE\.claude\skills\json-validator\scripts\validate-schema.py" --help
```

**Expected Output**:
```
usage: validate-schema.py [-h] data schema

Validate JSON against schema

positional arguments:
  data        Path to JSON data file
  schema      Path to JSON schema file

optional arguments:
  -h, --help  show this help message and exit
```

**Verification:**
- [ ] Script includes docstring
- [ ] Uses argparse for parameters
- [ ] --help flag works
- [ ] Usage message is clear
- [ ] Self-documenting pattern followed

---

## 11. Integration Verification

### 11.1 Verify create-skill + research Integration

Test create-new-with-research workflow (already tested in section 8):

**Verification:**
- [ ] create-skill can invoke research skill
- [ ] Research results inform skill design
- [ ] Integration works seamlessly
- [ ] No errors when research skill unavailable (graceful fallback)

---

### 11.2 Verify Created Skills Work with Other PAI Skills

Create a skill that integrates with fabric:

```
Create a skill called "content-analyzer" that uses fabric patterns for analysis
```

**Expected Skill**:
- Wraps fabric pattern selection
- Simplifies common analysis tasks
- References fabric skill in SKILL.md

**Verification:**
- [ ] create-skill generates skill that references fabric
- [ ] Generated skill documentation mentions integration
- [ ] Created skill can activate fabric patterns
- [ ] Integration pattern documented correctly

---

### 11.3 Verify Skills Inherit KAI.md Context

Check that generated skills don't duplicate global context:

Review generated SKILL.md files:

**Anti-pattern** (should NOT appear):
```markdown
## Global Safety Rules
[Duplicating content from KAI.md]
```

**Correct pattern**:
```markdown
## How It Works
[Skill-specific instructions only]
```

**Verification:**
- [ ] Generated skills don't duplicate KAI.md content
- [ ] Skills assume global context (safety rules, standards)
- [ ] Context inheritance principle followed
- [ ] No unnecessary redundancy

---

## 12. Edge Cases and Error Handling

### 12.1 Test Missing Templates

Temporarily rename a template:

```bash
# Unix/Mac
mv "$HOME/.claude/skills/create-skill/templates/simple-skill-template.md" \
   "$HOME/.claude/skills/create-skill/templates/simple-skill-template.md.bak"
```

Request skill creation:

```
Create a simple skill for timer functionality
```

**Expected Behavior:**
- Kai detects missing template
- Provides error message: "simple-skill-template.md not found"
- Suggests checking installation or restoring template
- Does NOT proceed with broken creation

**Restore template:**
```bash
# Unix/Mac
mv "$HOME/.claude/skills/create-skill/templates/simple-skill-template.md.bak" \
   "$HOME/.claude/skills/create-skill/templates/simple-skill-template.md"
```

**Verification:**
- [ ] Missing template detected
- [ ] Clear error message provided
- [ ] Creation does not proceed with errors
- [ ] Suggests corrective action

---

### 12.2 Test Python Not Installed (Scripts Pattern)

**If Python IS installed**, skip this test or temporarily rename python executable.

Request Standard skill creation:

```
Create a standard skill with scripts for data processing
```

**Expected Behavior:**
- Kai creates skill structure (SKILL.md, workflows/, scripts/)
- Warns: "Python not detected - scripts will be created but not executable"
- Generates script files with correct structure
- Includes installation instructions in SKILL.md

**Verification:**
- [ ] Skill structure created despite missing Python
- [ ] Warning provided about script execution
- [ ] Scripts have correct syntax
- [ ] Documentation includes Python requirement

---

### 12.3 Test Created Skill Doesn't Activate

Create a skill with intentionally broken frontmatter:

```
Create a simple skill but use invalid frontmatter (missing description)
```

**If Kai generates invalid frontmatter:**
```yaml
---
name: broken-skill
# Missing description field
---
```

Test activation:

```
Use broken-skill
```

**Expected Behavior:**
- Skill doesn't appear in available_skills
- Kai cannot activate skill
- Error message about invalid frontmatter

**Fix:**
Add description field manually, then test again.

**Verification:**
- [ ] Invalid frontmatter prevents activation
- [ ] Clear error message
- [ ] Manual fix resolves issue
- [ ] Skill activates after correction

---

### 12.4 Test Template Customization Conflicts

**Scenario**: User customized templates, then create-skill Pack is updated.

Modify a template:

```bash
# Unix/Mac
echo "# CUSTOM SECTION" >> "$HOME/.claude/skills/create-skill/templates/simple-skill-template.md"
```

Simulate Pack update (re-read PACK_INSTALL.md guidance):

```
What happens to my template customizations if I update create-skill Pack?
```

**Expected Guidance:**
- Custom templates should be backed up before updates
- Updates may overwrite templates
- Suggests keeping customizations in separate templates/
- Documents backup/restore procedure

**Verification:**
- [ ] Documentation warns about update conflicts
- [ ] Backup procedure documented
- [ ] Alternative approaches suggested (separate templates)
- [ ] Restore procedure clear

---

## 13. Performance Benchmarks

### 13.1 Simple Skill Creation Time

Measure time to create a simple skill from request to completion:

**Test:**
```
Create a simple skill for currency conversion
```

**Expected Time**: 5-10 minutes
- 1-2 min: Discovery (purpose, triggers, dependencies)
- 2-3 min: Template generation
- 1-2 min: File creation
- 1-2 min: Testing

**Verification:**
- [ ] Completes within 10 minutes
- [ ] No unnecessary delays
- [ ] Workflow efficient

---

### 13.2 Standard Skill Creation Time (with Scripts)

Measure time to create a Standard skill:

**Test:**
```
Create a standard skill for log parsing with scripts
```

**Expected Time**: 15-20 minutes
- 2-3 min: Discovery
- 3-5 min: Template generation (SKILL.md + workflows)
- 5-7 min: Script creation (2-3 scripts)
- 3-5 min: Testing and documentation

**Verification:**
- [ ] Completes within 20 minutes
- [ ] Scripts generated with proper structure
- [ ] Documentation complete

---

### 13.3 Complex Skill Creation Time

Measure time to create a Complex skill:

**Test:**
```
Create a complex skill for database migration management
```

**Expected Time**: 30-60 minutes
- 5-10 min: Discovery and research
- 10-15 min: Architecture planning
- 10-20 min: Template generation (SKILL.md + CLAUDE.md + workflows)
- 5-10 min: Subdirectory population (templates/, docs/)
- 5-10 min: Testing and validation

**Verification:**
- [ ] Completes within 60 minutes
- [ ] Full structure created
- [ ] Progressive disclosure implemented
- [ ] All components working

---

### 13.4 Research-Enhanced Creation Time

Measure additional time for research workflow:

**Test:**
```
Create a skill for stock market analysis using research-enhanced workflow
```

**Expected Additional Time**: +5-10 minutes on top of base creation time
- 3-5 min: Research phase (3-9 agents)
- 2-5 min: Research synthesis and design

**Total Expected**: 20-30 minutes (Standard + research) or 35-70 minutes (Complex + research)

**Verification:**
- [ ] Research phase completes in reasonable time
- [ ] Research improves skill quality (worth the time)
- [ ] Total time acceptable

---

## 14. Security and Quality Verification

### 14.1 Verify No Hallucinated Methods

Review generated skills for hallucinated code:

**Anti-pattern** (hallucinated method):
```markdown
## How It Works

Uses the built-in `claude.validateJSON()` method...
```

**Correct pattern**:
```markdown
## How It Works

Executes `scripts/validate-json.py` to validate data...
```

**Verification:**
- [ ] No references to non-existent Claude methods
- [ ] All tool calls are real (Bash, Read, Write, etc.)
- [ ] Scripts reference actual executable files
- [ ] No hallucinated APIs

---

### 14.2 Verify Activation Trigger Clarity

Check that all generated skills have clear, explicit triggers:

**Anti-pattern** (vague description):
```yaml
description: Helps with data analysis
```

**Correct pattern**:
```yaml
description: Analyze CSV data and generate summary statistics. USE WHEN user says 'analyze csv', 'data summary', provides CSV file, or requests statistical analysis.
```

**Verification:**
- [ ] All descriptions include "USE WHEN" clause
- [ ] Triggers are explicit (not vague)
- [ ] Multiple activation examples provided
- [ ] Intent clear from description

---

### 14.3 Verify Progressive Disclosure for Complex Skills

For Complex skills, verify Layer 1/2/3 separation:

**Layer 1** (Metadata):
- Only frontmatter, always loaded
- ~50-100 tokens

**Layer 2** (SKILL.md body):
- Quick reference, loaded on activation
- ~500-2000 tokens

**Layer 3** (CLAUDE.md + subdirectories):
- Comprehensive context, loaded on-demand
- ~5000-20000 tokens

**Verification:**
- [ ] SKILL.md is brief (quick reference only)
- [ ] CLAUDE.md is comprehensive (not duplicated in SKILL.md)
- [ ] Token usage appropriate for each layer
- [ ] No upfront token waste

---

## 15. Output Quality Verification

### 15.1 Verify Frontmatter Completeness

Check all generated skills have complete frontmatter:

**Required fields**:
```yaml
---
name: skill-name
description: Clear description with USE WHEN triggers
---
```

**Optional but recommended**:
```yaml
version: 1.0
author: [Your name]
dependencies: [List of required skills or tools]
```

**Verification:**
- [ ] All generated skills have frontmatter
- [ ] name field present and matches directory name
- [ ] description field present with triggers
- [ ] YAML is valid (no syntax errors)

---

### 15.2 Verify Naming Conventions Followed

**Skills**: lowercase-with-hyphens (e.g., `quote-of-day`, `api-client-generator`)
**Scripts**: verb-noun.py (e.g., `validate-schema.py`, `format-errors.py`)
**Workflows**: descriptive-action.md (e.g., `create-new.md`, `analyze-api.md`)

**Verification:**
- [ ] Skill directory names use lowercase-with-hyphens
- [ ] Script names use verb-noun.py format
- [ ] Workflow names are descriptive
- [ ] No camelCase, snake_case, or PascalCase (except in code)

---

### 15.3 Verify Documentation Completeness

For each generated skill, verify documentation sections:

**SKILL.md required sections**:
- Frontmatter
- "What This Skill Does"
- "When to Use"
- "How It Works"
- Example usage (at least one)

**CLAUDE.md required sections** (if Complex):
- Architecture diagram
- Detailed workflows
- Examples (3-5 examples)
- Integration points (if applicable)

**Verification:**
- [ ] All required sections present
- [ ] Content is clear and actionable
- [ ] Examples are concrete (not placeholders)
- [ ] Documentation matches implementation

---

## 16. Final Integration Test - Complete Skill Lifecycle

### End-to-End Test

Create, use, and update a skill through its complete lifecycle:

**Step 1: Create skill**
```
Create a simple skill for pomodoro timer tracking
```

**Step 2: Test activation**
```
Start a pomodoro timer
```

**Step 3: Update skill**
```
Update pomodoro-timer skill to add a workflow for break management
```

**Step 4: Test updated skill**
```
Take a pomodoro break
```

**Step 5: Verify persistence**
Restart Claude Code session, then:
```
Use pomodoro-timer
```

**Expected Results:**
- Skill created successfully
- Skill activates on first use
- Update adds workflow without breaking existing functionality
- Updated skill works correctly
- Skill persists across sessions (available after restart)

**Verification:**
- [ ] Complete lifecycle works end-to-end
- [ ] No errors at any stage
- [ ] Skill persists across sessions
- [ ] Updates don't break existing functionality

---

## 17. Sign-Off Checklist

Use this final checklist to confirm create-skill Pack v2.0 is fully operational:

### Installation Verification
- [ ] All core files exist (SKILL.md, CLAUDE.md, Pack files)
- [ ] All 6 templates exist and are readable
- [ ] All 3 workflows exist and are readable
- [ ] Documentation directory exists with Anthropic patterns

### Skill Loading Verification
- [ ] create-skill activates on explicit request
- [ ] Auto-detection works for skill creation intents
- [ ] Pack documentation loads on-demand
- [ ] No errors during activation

### Template Verification
- [ ] All 6 templates accessible
- [ ] simple-skill-template works
- [ ] standard-skill-template works (NEW Anthropic pattern)
- [ ] complex-skill-template works
- [ ] workflow-template works
- [ ] claude-md-template works
- [ ] script-template.py works

### Workflow Verification
- [ ] create-new.md workflow executes
- [ ] create-new-with-research.md workflow executes (with research skill)
- [ ] update-existing.md workflow executes

### Functional Verification
- [ ] Can create Simple skill (SKILL.md only)
- [ ] Can create Standard skill (with scripts pattern)
- [ ] Can create Complex skill (with CLAUDE.md)
- [ ] Can create skill with research (if research skill installed)
- [ ] Can update existing skill

### Anthropic Pattern Verification
- [ ] "Scripts as tools" pattern documented
- [ ] Scripts follow naming convention (verb-noun.py)
- [ ] Scripts are self-documenting
- [ ] Pattern benefits clear

### Integration Verification
- [ ] Works with research skill (research-enhanced creation)
- [ ] Created skills can integrate with other PAI skills (fabric, etc.)
- [ ] Skills inherit global context (don't duplicate KAI.md)

### Edge Case Verification
- [ ] Handles missing templates gracefully
- [ ] Works without Python (warns about scripts)
- [ ] Detects invalid frontmatter
- [ ] Documents template customization conflicts

### Performance Verification
- [ ] Simple skill creation: 5-10 minutes ✅
- [ ] Standard skill creation: 15-20 minutes ✅
- [ ] Complex skill creation: 30-60 minutes ✅
- [ ] Research-enhanced: +5-10 minutes ✅

### Quality Verification
- [ ] No hallucinated methods in generated skills
- [ ] Activation triggers are clear and explicit
- [ ] Progressive disclosure implemented (Complex skills)
- [ ] Frontmatter complete in all generated skills
- [ ] Naming conventions followed
- [ ] Documentation complete and accurate

### Final Integration Test
- [ ] Complete skill lifecycle works (create → use → update → persist)

---

## 18. Troubleshooting Reference

If any verification step fails, consult PACK_INSTALL.md troubleshooting section for:

- Issue 1: create-skill Framework Not Activating
- Issue 2: Templates Not Found
- Issue 3: Workflows Not Executing
- Issue 4: Python Scripts Pattern Not Working
- Issue 5: Created Skill Doesn't Activate
- Issue 6: Template Customization Lost on Update
- Issue 7: Research-Enhanced Workflow Slow
- Issue 8: Script Template Missing Dependencies

---

## Conclusion

If all checklist items are marked ✅, create-skill Pack v2.0 is **FULLY VERIFIED** and ready for production use.

**Total Verification Items**: 150+
**Estimated Verification Time**: 45-60 minutes (comprehensive), 15-20 minutes (quick checklist only)

**Next Steps After Verification**:
1. Create your first custom skill using create-skill
2. Experiment with all three skill types (Simple, Standard, Complex)
3. Try the NEW Anthropic "scripts as tools" pattern
4. Use research-enhanced workflow for domain-specific skills
5. Share your created skills with the PAI community

---

**Verification Guide Version**: 2.0
**Last Updated**: 2026-01-03
**Skill Pack**: create-skill v2.0
**Estimated Verification Time**: 45-60 minutes (comprehensive)
