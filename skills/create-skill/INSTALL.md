# Create Skill - Installation Guide

**Pack Version**: 2.0
**Installation Time**: 5 minutes (verification only)
**Complexity**: Medium (Framework with templates and workflows)

---

## Prerequisites

### Required

**1. Claude Code CLI**
- **Minimum Version**: Latest stable release
- **Check**: `claude --version`
- **Install**: See [Claude Code documentation](https://github.com/anthropics/claude-code)

**2. PAI Environment**
- **Required**: PAI_DIR environment variable set
- **Check**: `echo $PAI_DIR` (Unix/Mac) or `echo %PAI_DIR%` (Windows)
- **Typical Location**: `~/.claude/` or `C:\Users\<Username>\.claude\`

### Optional

**3. Python 3.8+** (For creating skills with scripts/)
- **Purpose**: If you want to create skills that use the Anthropic "scripts as tools" pattern
- **Check**: `python --version` or `python3 --version`
- **Install**: [python.org](https://www.python.org/downloads/)
- **Not required**: For creating simple skills (SKILL.md only)

---

## Installation Steps

### Step 1: Verify create-skill Directory Structure

The create-skill framework should already be installed in your PAI skills directory.

**Unix/Mac:**
```bash
ls -la "$HOME/.claude/skills/create-skill/"
```

**Windows (PowerShell):**
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\skills\create-skill\" -Recurse
```

**Expected Structure:**
```
create-skill/
├── SKILL.md                          # Quick reference framework
├── CLAUDE.md                         # Comprehensive methodology
├── PACK_README.md                    # This pack overview
├── PACK_INSTALL.md                   # This installation guide
├── PACK_VERIFY.md                    # Verification checklist
├── workflows/                        # Guided workflows
│   ├── create-new.md                 # Basic creation
│   ├── create-new-with-research.md   # Research-enhanced
│   └── update-existing.md            # Modification workflow
├── templates/                        # Skill templates
│   ├── simple-skill-template.md
│   ├── complex-skill-template.md
│   ├── skill-with-agents-template.md
│   ├── CLAUDE-template.md
│   ├── script-template.py            # NEW: Anthropic pattern
│   └── README.md                     # Template guide
└── docs/                             # Documentation
    └── ANTHROPIC_PATTERNS_ENHANCEMENT.md
```

**If files are missing**: The framework may not be installed. Check your PAI installation or contact your PAI administrator.

---

### Step 2: Verify Skill Loading

Start a Claude Code session in any project:

```bash
claude
```

In the session, type:
```
@create-skill
```

**Expected Behavior**:
- Skill activates
- Kai loads create-skill framework context
- Ready to guide skill creation

**If skill doesn't load**:
- Check that SKILL.md exists in the skill directory
- Verify Claude Code is recognizing the ~/.claude/skills/ directory
- Try restarting Claude Code session

---

### Step 3: Verify Templates Access

Check that all skill templates are accessible:

**Unix/Mac:**
```bash
ls -la "$HOME/.claude/skills/create-skill/templates/"
```

**Windows (PowerShell):**
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\skills\create-skill\templates\"
```

**Expected Templates (6 total)**:
1. ✅ `simple-skill-template.md` - Minimal structure (SKILL.md only)
2. ✅ `complex-skill-template.md` - Full package (SKILL.md + CLAUDE.md + subdirectories)
3. ✅ `skill-with-agents-template.md` - Sub-agent orchestration patterns
4. ✅ `CLAUDE-template.md` - Comprehensive methodology structure
5. ✅ `script-template.py` - Anthropic "scripts as tools" pattern (NEW)
6. ✅ `README.md` - Template usage guide

**If templates are missing**:
- Re-download create-skill framework from PAI source
- Check file permissions (templates should be readable)

---

### Step 4: Verify Workflows Access

Check that guided workflows are accessible:

**Unix/Mac:**
```bash
cat "$HOME/.claude/skills/create-skill/workflows/create-new.md" | head -20
```

**Windows (PowerShell):**
```powershell
Get-Content "$env:USERPROFILE\.claude\skills\create-skill\workflows\create-new.md" | Select-Object -First 20
```

**Expected Workflows (3 total)**:
1. ✅ `create-new.md` - Basic skill creation (5-step process)
2. ✅ `create-new-with-research.md` - Research-enhanced creation (launches research agents)
3. ✅ `update-existing.md` - Modify existing skills

---

### Step 5: Test Basic Functionality

In a Claude Code session, try a simple skill creation request:

```
Create a simple skill for extracting metadata from YouTube videos
```

**Expected Response**:
- Kai activates create-skill framework
- Begins Phase 1: Planning
- Asks discovery questions:
  1. What does this skill do?
  2. When should it activate?
  3. What tools/commands does it use?
  4. Does it need reusable scripts?
  5. Is it simple or complex?

**If Kai doesn't activate the framework**:
- Try explicit activation: `Use create-skill to build a skill for [purpose]`
- Verify skill files are in correct location
- Check Claude Code session logs for errors

---

### Step 6: Verify Pack Documentation Access

Test on-demand loading of Pack documentation:

```
Load the create-skill Pack README
```

**Expected Behavior**:
- Kai reads PACK_README.md
- Provides overview of framework, architecture, templates, use cases

**Alternative Test**:
```
Read the create-skill installation guide
```

**Expected Behavior**:
- Kai reads PACK_INSTALL.md (this file)

---

### Step 7: Verify Anthropic Patterns Documentation

Check that Anthropic "scripts as tools" pattern documentation is accessible:

**Unix/Mac:**
```bash
cat "$HOME/.claude/skills/create-skill/docs/ANTHROPIC_PATTERNS_ENHANCEMENT.md" | head -50
```

**Windows (PowerShell):**
```powershell
Get-Content "$env:USERPROFILE\.claude\skills\create-skill\docs\ANTHROPIC_PATTERNS_ENHANCEMENT.md" | Select-Object -First 50
```

**Expected Content**: Documentation of Anthropic's "scripts as tools" pattern, rationale, implementation examples

---

### Step 8: Optional - Verify Python Installation (For Scripts)

If you plan to create skills with scripts/ directories (Standard Skill pattern):

**Check Python version:**
```bash
python --version
# or
python3 --version
```

**Expected**: Python 3.8 or higher

**If Python not installed**:
- **Not a blocker**: You can still create Simple and Complex skills (no scripts required)
- **Install Python**: Only needed if you want to use "scripts as tools" pattern
- **Download**: [python.org/downloads](https://www.python.org/downloads/)

---

## Configuration (Optional)

### No Configuration Required

create-skill works out-of-the-box with no configuration files, environment variables, or settings to adjust.

**The framework is entirely workflow-driven:**
- Activated by user request
- Guided by interactive questions
- Uses templates for consistent structure
- Outputs to ~/.claude/skills/ directory

---

### Optional Customization

**1. Customize Templates**

If you want to modify default skill templates for your organization:

```bash
# Edit templates in create-skill/templates/
cd "$HOME/.claude/skills/create-skill/templates/"

# Modify any template
nano simple-skill-template.md
```

**Common customizations:**
- Add organization-specific sections
- Include standard license headers
- Add required documentation sections
- Customize naming conventions

---

**2. Add Custom Workflows**

If you have specialized skill creation workflows:

```bash
# Add new workflow to workflows/ directory
cd "$HOME/.claude/skills/create-skill/workflows/"

# Create custom workflow
nano create-internal-tool-skill.md
```

**Example custom workflows:**
- `create-api-integration-skill.md` - For API wrapper skills
- `create-database-skill.md` - For database operation skills
- `create-monitoring-skill.md` - For system monitoring skills

---

**3. Extend Anthropic Patterns**

If you discover new patterns worth documenting:

```bash
# Extend Anthropic patterns documentation
nano "$HOME/.claude/skills/create-skill/docs/ANTHROPIC_PATTERNS_ENHANCEMENT.md"
```

**Document:**
- New "scripts as tools" examples
- Additional Anthropic best practices
- PAI-specific pattern discoveries

---

## Troubleshooting

### Issue 1: create-skill Framework Not Activating

**Symptoms**:
- User says "create a skill" but create-skill doesn't activate
- Kai doesn't enter guided workflow

**Possible Causes**:
1. Skill files missing or incorrectly placed
2. SKILL.md not readable by Claude Code
3. Skill name mismatch in available_skills

**Solutions**:

**A. Verify file structure:**
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/create-skill/SKILL.md"

# Windows PowerShell
Test-Path "$env:USERPROFILE\.claude\skills\create-skill\SKILL.md"
```

Expected: File exists and is readable

**B. Check SKILL.md frontmatter:**
```bash
# Unix/Mac
head -10 "$HOME/.claude/skills/create-skill/SKILL.md"

# Windows PowerShell
Get-Content "$env:USERPROFILE\.claude\skills\create-skill\SKILL.md" | Select-Object -First 10
```

Expected frontmatter:
```yaml
---
name: create-skill
description: Guide for creating new skills in Kai's personal AI infrastructure...
---
```

**C. Explicit activation:**
Instead of relying on auto-detection, explicitly request:
```
Use create-skill framework to build a new skill for [purpose]
```

---

### Issue 2: Templates Not Found

**Symptoms**:
- "Template not found" errors when creating skills
- Missing template files

**Possible Causes**:
1. templates/ directory missing
2. Template files not readable
3. Incorrect file permissions

**Solutions**:

**A. Verify all templates exist:**
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/create-skill/templates/"

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\create-skill\templates\"
```

Expected: 6 template files

**B. Check file permissions:**
```bash
# Unix/Mac - ensure templates are readable
chmod 644 "$HOME/.claude/skills/create-skill/templates/"*.md
chmod 755 "$HOME/.claude/skills/create-skill/templates/"*.py
```

**C. Re-download if corrupted:**
If templates appear corrupted, re-download create-skill framework from PAI source

---

### Issue 3: Workflows Not Executing

**Symptoms**:
- create-new.md or other workflows don't run
- Kai skips workflow steps

**Possible Causes**:
1. workflows/ directory missing
2. Workflow files corrupted
3. Workflow not referenced in SKILL.md

**Solutions**:

**A. Verify workflows directory:**
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/create-skill/workflows/"

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\create-skill\workflows\"
```

Expected: 3 workflow files

**B. Check workflow file integrity:**
```bash
# Unix/Mac
wc -l "$HOME/.claude/skills/create-skill/workflows/create-new.md"

# Windows PowerShell
(Get-Content "$env:USERPROFILE\.claude\skills\create-skill\workflows\create-new.md").Count
```

Expected: ~70 lines for create-new.md

**C. Explicit workflow request:**
```
Guide me through the create-new workflow for building a skill
```

---

### Issue 4: Python Scripts Pattern Not Working

**Symptoms**:
- script-template.py not executable
- Scripts created from template don't run

**Possible Causes**:
1. Python not installed
2. Script template not executable
3. Missing shebang or permissions

**Solutions**:

**A. Verify Python installation:**
```bash
python --version
# or
python3 --version
```

Expected: Python 3.8+

**B. Make script-template.py executable:**
```bash
# Unix/Mac
chmod +x "$HOME/.claude/skills/create-skill/templates/script-template.py"
```

**C. Test script template:**
```bash
# Unix/Mac
python "$HOME/.claude/skills/create-skill/templates/script-template.py" --help

# Windows
python "%USERPROFILE%\.claude\skills\create-skill\templates\script-template.py" --help
```

Expected: Help message showing template structure

---

### Issue 5: Created Skill Doesn't Activate

**Symptoms**:
- New skill created successfully
- But skill doesn't activate when user triggers it

**Possible Causes**:
1. KAI.md available_skills list not updated
2. Description lacks clear triggers
3. Frontmatter name mismatch

**Solutions**:

**A. Update KAI.md:**
```
Update the available_skills section in KAI.md to include [new-skill-name]
```

**B. Verify frontmatter:**
Check that SKILL.md frontmatter `name:` matches directory name:
```bash
# Directory: ~/.claude/skills/youtube-metadata/
# SKILL.md frontmatter should have:
# name: youtube-metadata
```

**C. Add clear triggers to description:**
Ensure description includes "USE WHEN" phrases:
```yaml
description: Extract YouTube video metadata. USE WHEN user provides YouTube URL or asks about video information.
```

---

### Issue 6: Template Customization Lost on Update

**Symptoms**:
- Customized templates get overwritten
- Personal modifications disappear

**Possible Causes**:
1. Framework update overwrites custom templates
2. No backup of customizations

**Solutions**:

**A. Backup custom templates:**
```bash
# Before updating framework
cp -r "$HOME/.claude/skills/create-skill/templates/" \
     "$HOME/.claude/skills/create-skill/templates.backup/"
```

**B. Use custom template directory:**
Create separate directory for custom templates:
```bash
mkdir -p "$HOME/.claude/skills/create-skill/templates-custom/"
# Store your customizations here
```

**C. Document customizations:**
Create `CUSTOMIZATIONS.md` documenting your template changes

---

### Issue 7: Research-Enhanced Workflow Slow

**Symptoms**:
- create-new-with-research.md workflow takes too long
- Research agents don't complete

**Possible Causes**:
1. Research agents timing out
2. Too many agents launched
3. Network issues

**Solutions**:

**A. Use Quick Research mode:**
```
Create a skill for [purpose] using quick research (3 agents)
```

**B. Skip research for simple skills:**
For simple skills, use basic create-new.md workflow:
```
Create a simple skill for [purpose] without research
```

**C. Check research skill installation:**
Verify research skill is installed and functional:
```bash
ls -la "$HOME/.claude/skills/research/"
```

---

### Issue 8: Script Template Missing Dependencies

**Symptoms**:
- Scripts created from template fail to run
- Import errors for libraries

**Possible Causes**:
1. Script dependencies not installed
2. Virtual environment not activated
3. Missing requirements.txt

**Solutions**:

**A. Install common dependencies:**
```bash
pip install requests beautifulsoup4 pyyaml
```

**B. Create requirements.txt for your skill:**
```bash
cd "$HOME/.claude/skills/[skill-name]/"
echo "requests==2.31.0" > requirements.txt
echo "beautifulsoup4==4.12.2" >> requirements.txt
pip install -r requirements.txt
```

**C. Document dependencies in SKILL.md:**
Add Dependencies section to created skills:
```markdown
## Dependencies
- Python 3.8+
- requests
- beautifulsoup4
```

---

## Production Optimizations

### For Skill Creators (Building Multiple Skills)

**1. Create Skill Creation Workspace**
```bash
# Dedicated workspace for new skills
mkdir -p ~/skill-workspace/
cd ~/skill-workspace/
```

**2. Template Cheat Sheet**
Create quick reference for template selection:
```bash
cat > ~/skill-workspace/template-guide.md << 'EOF'
# Template Selection Guide

**Simple Skill** (simple-skill-template.md):
- Single focused task
- SKILL.md only
- Examples: youtube-metadata, json-parser

**Complex Skill** (complex-skill-template.md):
- Multi-component
- SKILL.md + CLAUDE.md + subdirectories
- Examples: development, consulting

**With Agents** (skill-with-agents-template.md):
- Delegates to sub-agents
- Parallel execution
- Examples: research, content-creation

**With Scripts** (script-template.py):
- Reusable operations
- Anthropic pattern
- Examples: validate-json, web-scrape
EOF
```

**3. Batch Skill Creation**
Create multiple related skills efficiently:
```
Create 3 skills for my data pipeline:
1. CSV parser skill
2. Data validation skill
3. Report generation skill
```

---

### For Organizations (Standard Skill Patterns)

**1. Organization-Wide Templates**
Customize templates with org standards:
```bash
# Add org header to all templates
sed -i '1i<!-- Copyright (c) Org Name. Licensed under MIT -->' \
    "$HOME/.claude/skills/create-skill/templates/"*.md
```

**2. Skill Naming Convention**
Document org-specific naming:
```bash
# Example: prefix with org name
# org-data-parser instead of data-parser
```

**3. Standard Dependencies**
Create org requirements template:
```bash
cat > "$HOME/.claude/skills/create-skill/templates/requirements-org.txt" << 'EOF'
# Organization Standard Dependencies
requests==2.31.0
pyyaml==6.0.1
python-dotenv==1.0.0
EOF
```

---

## Next Steps

After successful installation and verification:

1. **Test Skill Creation**
   - Create a simple test skill
   - Verify it activates correctly
   - Test workflows and templates

2. **Review Framework Documentation**
   - Read PACK_README.md for methodology deep-dive
   - Study template examples
   - Review Anthropic patterns documentation

3. **Complete Verification**
   - Follow PACK_VERIFY.md checklist
   - Test all templates
   - Validate workflow execution

4. **Create Your First Production Skill**
   - Identify capability gap in your PAI
   - Use create-skill framework to build it
   - Share with team if applicable

---

## Support

### Documentation
- **PACK_README.md**: Framework overview, architecture, templates, use cases
- **PACK_VERIFY.md**: Comprehensive verification checklist
- **CLAUDE.md**: Complete skill creation methodology
- **templates/README.md**: Template usage guide

### Learning Resources
- **Anthropic Patterns**: `docs/ANTHROPIC_PATTERNS_ENHANCEMENT.md`
- **Workflow Examples**: 3 guided workflows in workflows/ directory
- **Template Examples**: 6 professional templates

### Getting Help

**Within Claude Code Session**:
```
Help me troubleshoot create-skill framework - [describe issue]
```

**PAI Community**:
- Share skill creation experiences
- Exchange custom templates
- Discuss Anthropic pattern implementations

---

**Installation Guide Version**: 2.0
**Last Updated**: 2026-01-03
**Estimated Installation Time**: 5 minutes (verification only)
