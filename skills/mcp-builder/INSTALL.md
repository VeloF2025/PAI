# mcp-builder - Installation Guide

**Pack Version**: 2.0
**Installation Time**: 10-15 minutes
**Complexity**: Low (Verification only, MCP server dependencies vary by project)

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

### MCP Server Development Prerequisites (Install Based on Your Choice)

**For TypeScript MCP Servers** (Recommended):
- **Node.js**: 18.0.0 or higher
- **Check**: `node --version`
- **Install**: [Download from nodejs.org](https://nodejs.org/)
- **npm**: Comes with Node.js
- **Check**: `npm --version`

**For Python MCP Servers**:
- **Python**: 3.8 or higher
- **Check**: `python --version` or `python3 --version`
- **Install**: [Download from python.org](https://www.python.org/)
- **pip**: Usually comes with Python
- **Check**: `pip --version` or `pip3 --version`

### Optional (For Evaluation Scripts)

**Python 3.8+** (if not already installed):
- Required to run `scripts/evaluation.py` and `scripts/connections.py`
- **Check**: `python --version`

---

## Installation Steps

### Step 1: Verify Skill Files Exist

The mcp-builder skill should already be installed in your PAI skills directory.

**Unix/Mac:**
```bash
ls -la "$HOME/.claude/skills/mcp-builder/"
```

**Windows (PowerShell):**
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\skills\mcp-builder\" -Force
```

**Expected Files and Directories:**
```
mcp-builder/
├── SKILL.md                    # Main skill documentation (loaded by Claude Code)
├── LICENSE.txt                 # License terms
├── PACK_README.md              # This pack overview (on-demand)
├── PACK_INSTALL.md             # This installation guide (on-demand)
├── PACK_VERIFY.md              # Verification checklist (on-demand)
├── reference/                  # Implementation guides (4 files)
│   ├── mcp_best_practices.md   # Universal MCP guidelines
│   ├── python_mcp_server.md    # Python/FastMCP patterns
│   ├── node_mcp_server.md      # TypeScript/MCP SDK patterns
│   └── evaluation.md           # Evaluation creation guide
└── scripts/                    # Evaluation tools (4 files)
    ├── evaluation.py           # Run evaluations
    ├── connections.py          # Test MCP connections
    ├── example_evaluation.xml  # Example format
    └── requirements.txt        # Python dependencies
```

**If files are missing**: The skill may not be installed. Check your PAI installation or contact your PAI administrator.

---

### Step 2: Verify Skill Loading

Start a Claude Code session in any project:

```bash
claude
```

In the session, type:
```
@mcp-builder
```

**Expected Behavior**:
- Skill activates
- Kai loads mcp-builder context
- Ready to guide MCP server development

**If skill doesn't load**:
- Check that SKILL.md exists in the skill directory
- Verify Claude Code is recognizing the ~/.claude/skills/ directory
- Try restarting Claude Code session

---

### Step 3: Install Development Prerequisites

**Choose your MCP server development stack:**

#### Option A: TypeScript (Recommended)

**Install Node.js** (if not already installed):

```bash
# Check current version
node --version

# If not installed or version < 18.0.0, download from:
# https://nodejs.org/
```

**Verify npm**:
```bash
npm --version
```

**Install MCP Inspector** (for testing):
```bash
# Global installation
npm install -g @modelcontextprotocol/inspector

# Or use npx (no installation needed)
npx @modelcontextprotocol/inspector
```

**Why TypeScript is Recommended**:
- High-quality SDK support
- Good compatibility across execution environments
- AI models excel at generating TypeScript code
- Static typing + linting tools
- Broad community usage

---

#### Option B: Python

**Install Python** (if not already installed):

```bash
# Check current version
python --version
# or
python3 --version

# If not installed or version < 3.8, download from:
# https://www.python.org/
```

**Verify pip**:
```bash
pip --version
# or
pip3 --version
```

**Install MCP Inspector** (requires Node.js):
```bash
# Even for Python MCP servers, MCP Inspector uses Node.js
npm install -g @modelcontextprotocol/inspector
```

---

### Step 4: Install Evaluation Script Dependencies (Optional)

**If you plan to create evaluations** (recommended for quality MCP servers):

```bash
# Navigate to scripts directory
cd "$HOME/.claude/skills/mcp-builder/scripts/"

# Install Python dependencies
pip install -r requirements.txt
```

**Expected dependencies**:
- HTTP client libraries (for testing MCP servers)
- XML parsing libraries
- Evaluation framework dependencies

**Verify installation**:
```bash
python evaluation.py --help
python connections.py --help
```

---

### Step 5: Test Basic Functionality

In a Claude Code session, try a simple MCP server creation request:

```
I want to build an MCP server for the GitHub API
```

**Expected Response**:
- Kai activates mcp-builder skill
- Begins Phase 1: Deep Research and Planning
- Asks key questions:
  1. Which language do you prefer (TypeScript recommended, or Python)?
  2. Which GitHub API endpoints do you want to implement?
  3. What authentication method (Personal Access Token, OAuth, GitHub App)?
  4. What transport mechanism (streamable HTTP or stdio)?

**If Kai doesn't activate the skill**:
- Try explicit activation: `Use mcp-builder to create an MCP server for GitHub`
- Verify skill files are in correct location
- Check Claude Code session logs for errors

---

### Step 6: Verify Pack Documentation Access

Test on-demand loading of Pack documentation:

```
Load the mcp-builder Pack README
```

**Expected Behavior**:
- Kai reads PACK_README.md
- Provides overview of four-phase development system
- Describes key features (research-driven, dual-language, best practices, evaluation, BOSS Ghost reference)

**Alternative Test**:
```
Read the mcp-builder installation guide
```

**Expected Behavior**:
- Kai reads PACK_INSTALL.md (this file)

---

### Step 7: Verify Reference File Access

Check that reference guides are accessible:

**Unix/Mac:**
```bash
cat "$HOME/.claude/skills/mcp-builder/reference/mcp_best_practices.md" | head -50
```

**Windows (PowerShell):**
```powershell
Get-Content "$env:USERPROFILE\.claude\skills\mcp-builder\reference\mcp_best_practices.md" | Select-Object -First 50
```

**Expected Output**: First 50 lines of MCP best practices guide

**In Claude Code session**:
```
Show me MCP best practices for tool naming
```

**Expected Behavior**:
- Kai reads `reference/mcp_best_practices.md`
- Explains snake_case with service prefix
- Provides examples: `slack_send_message`, `github_create_issue`

---

### Step 8: Verify Evaluation Scripts Work (If Python Installed)

**Test evaluation script**:

```bash
# Navigate to scripts directory
cd "$HOME/.claude/skills/mcp-builder/scripts/"

# Test with example evaluation
python evaluation.py example_evaluation.xml
```

**Expected Output**:
- Script loads example evaluation
- Shows evaluation format
- If MCP server not running, shows connection error (expected)

**Test connections script**:

```bash
python connections.py --help
```

**Expected Output**:
- Shows usage instructions
- Lists available options

---

## Configuration (Optional)

### No Configuration Required

mcp-builder works out-of-the-box with no configuration files, environment variables, or settings to adjust.

**The skill is entirely workflow-driven:**
- Activated by user request (building an MCP server)
- Guided by four-phase workflow
- Adapts to user's language choice (TypeScript or Python)
- References loaded on-demand during development

---

### MCP Server Configuration (Created During Development)

**During MCP server development**, mcp-builder will guide you to create:

**For TypeScript servers:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript compiler configuration
- `.mcp.json` - MCP server configuration for Claude Code CLI

**For Python servers:**
- `requirements.txt` or `setup.py` - Dependencies
- `.mcp.json` - MCP server configuration for Claude Code CLI

**Transport configuration examples:**

**Streamable HTTP** (recommended for remote servers):
```json
{
  "mcpServers": {
    "your-service": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

**stdio** (for local tools):
```json
{
  "mcpServers": {
    "your-service": {
      "command": "node",
      "args": ["dist/index.js"]
    }
  }
}
```

---

## Troubleshooting

### Issue 1: Skill Not Activating

**Symptoms**:
- User says "build an MCP server" but mcp-builder skill doesn't activate
- Kai doesn't enter guided workflow

**Possible Causes**:
1. Skill files missing or incorrectly placed
2. SKILL.md not readable by Claude Code
3. Skill name mismatch

**Solutions**:

**A. Verify file structure:**
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/mcp-builder/SKILL.md"

# Windows PowerShell
Test-Path "$env:USERPROFILE\.claude\skills\mcp-builder\SKILL.md"
```

Expected: File exists and is readable

**B. Check SKILL.md frontmatter:**
```bash
# Unix/Mac
head -10 "$HOME/.claude/skills/mcp-builder/SKILL.md"

# Windows PowerShell
Get-Content "$env:USERPROFILE\.claude\skills\mcp-builder\SKILL.md" | Select-Object -First 10
```

Expected frontmatter:
```yaml
---
name: mcp-builder
description: Guide for creating high-quality MCP servers...
---
```

**C. Explicit activation:**
Instead of relying on auto-detection, explicitly request:
```
Use mcp-builder to create an MCP server for [service name]
```

---

### Issue 2: Pack Files Not Loading

**Symptoms**:
- PACK_README.md, PACK_INSTALL.md, or PACK_VERIFY.md not found
- "File not found" errors when trying to read Pack docs

**Possible Causes**:
1. Pack files not installed
2. Incorrect file permissions
3. Path issues

**Solutions**:

**A. Verify all Pack files exist:**
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/mcp-builder/PACK_"*

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\mcp-builder\PACK_*"
```

Expected: PACK_README.md, PACK_INSTALL.md, PACK_VERIFY.md

**B. Check file permissions:**
```bash
# Unix/Mac - ensure files are readable
chmod 644 "$HOME/.claude/skills/mcp-builder/PACK_"*
```

**C. Use absolute paths:**
If relative paths fail, use absolute paths:
```
Read C:\Users\<Username>\.claude\skills\mcp-builder\PACK_README.md
```

---

### Issue 3: Reference Files Not Found

**Symptoms**:
- `reference/mcp_best_practices.md` or other reference files not loading
- Errors when trying to load Python/TypeScript implementation guides

**Possible Causes**:
1. reference/ directory missing
2. Individual reference files missing or corrupted

**Solutions**:

**A. Verify reference directory:**
```bash
# Unix/Mac
ls -la "$HOME/.claude/skills/mcp-builder/reference/"

# Windows PowerShell
Get-ChildItem "$env:USERPROFILE\.claude\skills\mcp-builder\reference\"
```

Expected files (4 total):
- mcp_best_practices.md (~7.5 KB)
- python_mcp_server.md (~25 KB)
- node_mcp_server.md (~29 KB)
- evaluation.md (~22 KB)

**B. Check file integrity:**
```bash
# Unix/Mac
wc -l "$HOME/.claude/skills/mcp-builder/reference/mcp_best_practices.md"
```

Expected: ~200+ lines

**C. Re-download if corrupted:**
If files appear corrupted, re-download the mcp-builder skill from your PAI source.

---

### Issue 4: Node.js or Python Not Installed

**Symptoms**:
- `node --version` or `python --version` fails
- Cannot install MCP SDK or dependencies

**Solutions**:

**For Node.js**:
1. Download from [https://nodejs.org/](https://nodejs.org/)
2. Install LTS version (18.x or higher)
3. Verify installation: `node --version` and `npm --version`
4. Restart terminal/shell

**For Python**:
1. Download from [https://www.python.org/](https://www.python.org/)
2. Install Python 3.8 or higher
3. Ensure "Add to PATH" is checked during installation
4. Verify installation: `python --version` and `pip --version`
5. Restart terminal/shell

**If both are installed but not recognized**:
- Check PATH environment variable
- Restart terminal/shell
- On Windows, use full path: `C:\Program Files\nodejs\node.exe --version`

---

### Issue 5: MCP Inspector Fails to Start

**Symptoms**:
- `npx @modelcontextprotocol/inspector` fails
- Inspector doesn't launch in browser

**Possible Causes**:
1. Node.js not installed or outdated
2. npm permissions issues
3. Firewall blocking localhost

**Solutions**:

**A. Verify Node.js version:**
```bash
node --version
```

Expected: v18.0.0 or higher

**B. Install globally if npx fails:**
```bash
npm install -g @modelcontextprotocol/inspector
@modelcontextprotocol/inspector
```

**C. Check npm permissions (Unix/Mac):**
```bash
# Fix npm permissions
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**D. Firewall/antivirus:**
- Ensure localhost connections are allowed
- Temporarily disable antivirus/firewall to test

---

### Issue 6: Evaluation Scripts Fail

**Symptoms**:
- `python evaluation.py` fails with import errors
- Dependencies not found

**Possible Causes**:
1. Python dependencies not installed
2. Wrong Python version
3. requirements.txt not found

**Solutions**:

**A. Install dependencies:**
```bash
cd "$HOME/.claude/skills/mcp-builder/scripts/"
pip install -r requirements.txt
```

**B. Check Python version:**
```bash
python --version
```

Expected: 3.8 or higher

**C. Use pip3 if needed:**
```bash
pip3 install -r requirements.txt
python3 evaluation.py --help
```

**D. Virtual environment (recommended):**
```bash
# Create virtual environment
python -m venv venv

# Activate
# Unix/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run scripts
python evaluation.py --help
```

---

### Issue 7: WebFetch Fails to Load MCP Docs

**Symptoms**:
- Cannot fetch `https://modelcontextprotocol.io/sitemap.xml`
- Cannot load TypeScript/Python SDK from GitHub

**Possible Causes**:
1. Network connectivity issues
2. URLs changed
3. WebFetch restrictions

**Solutions**:

**A. Test connectivity:**
```bash
# Test MCP site
curl https://modelcontextprotocol.io/sitemap.xml

# Test GitHub SDK
curl https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md
```

**B. Use alternative sources:**
If modelcontextprotocol.io is down, clone repositories:
```bash
# TypeScript SDK
git clone https://github.com/modelcontextprotocol/typescript-sdk.git

# Python SDK
git clone https://github.com/modelcontextprotocol/python-sdk.git
```

**C. Manual documentation:**
Load reference files instead:
```
Read the TypeScript implementation guide from mcp-builder reference files
```

---

### Issue 8: BOSS Ghost MCP Reference Not Available

**Symptoms**:
- BOSS Ghost protocol documentation not found
- `~/.claude/protocols/boss-ghost-testing.md` missing

**Possible Causes**:
1. BOSS Ghost MCP not installed
2. Protocol file not created

**Solutions**:

**A. Check if BOSS Ghost installed:**
```bash
# Unix/Mac
ls -la "$HOME/.boss-ghost-mcp/"

# Check for MCP configuration
cat "$HOME/.claude/.mcp.json" | grep boss-ghost
```

**B. BOSS Ghost is optional:**
- BOSS Ghost is a reference implementation, not required
- You can build MCP servers without it
- Skip BOSS Ghost references if not installed

**C. Install BOSS Ghost (if desired):**
```
Ask Kai: "How do I install BOSS Ghost MCP?"
```

---

## Production Optimizations

### For MCP Server Developers

**1. Use TypeScript for New Servers**
- Better tooling, type safety, AI code generation
- Recommended stack: TypeScript + Streamable HTTP transport

**2. Create Template Projects**
After creating your first MCP server:
- Save project structure as template
- Reuse authentication patterns
- Copy error handling utilities
- Speed up Phase 2 (Implementation)

**3. Build Evaluation Library**
Maintain a library of:
- Common evaluation question patterns
- Answer verification strategies
- Evaluation running scripts
- Quality benchmarks

**4. Automate Testing**
Set up CI/CD for MCP servers:
- Automatic evaluation running on commit
- Integration tests with MCP Inspector
- Deployment pipelines for streamable HTTP servers

**5. Use MCP Inspector in Development**
Always test with MCP Inspector during development:
```bash
# Run your MCP server
npm run dev  # or python server.py

# In another terminal, launch inspector
npx @modelcontextprotocol/inspector

# Connect to your local server
```

---

### For Organizations Building Multiple MCP Servers

**1. Standardize Technology Stack**
- Choose TypeScript or Python (or both) organization-wide
- Document internal patterns and conventions
- Create shared utilities library

**2. Create Internal Templates**
- Authentication helpers for common services
- Error handling patterns
- Pagination utilities
- Response formatting helpers

**3. Establish Quality Gates**
- Require 10 evaluations for all MCP servers
- Set minimum pass rate (e.g., 80% of questions answered correctly)
- Code review checklist based on MCP best practices

**4. Build MCP Server Registry**
- Internal catalog of available MCP servers
- Documentation on which services are covered
- Usage statistics and quality metrics

**5. Training and Documentation**
- Onboard developers using mcp-builder workflow
- Create internal MCP development guide
- Share learnings from successful MCP servers

---

## Next Steps

After successful installation and verification:

1. **Build Your First MCP Server**
   - Choose a simple REST API (e.g., JSONPlaceholder, OpenWeather)
   - Follow complete Phase 1-4 workflow
   - Create full evaluation with 10 questions

2. **Review Pack Documentation**
   - Read PACK_README.md for comprehensive overview
   - Study 5 detailed use cases
   - Understand four-phase development system

3. **Complete Verification**
   - Follow PACK_VERIFY.md checklist
   - Test all four phases
   - Validate evaluation script functionality

4. **Study Reference Implementation**
   - Review BOSS Ghost MCP patterns (if installed)
   - Understand autonomous features
   - Learn session persistence patterns

5. **Build Production MCP Server**
   - Apply learnings to real-world service
   - Create comprehensive evaluations
   - Deploy with streamable HTTP transport

---

## Support

### Documentation

- **PACK_README.md**: Framework overview, architecture, use cases
- **PACK_VERIFY.md**: Comprehensive verification checklist
- **reference/mcp_best_practices.md**: Universal MCP guidelines
- **reference/python_mcp_server.md**: Python implementation patterns
- **reference/node_mcp_server.md**: TypeScript implementation patterns
- **reference/evaluation.md**: Evaluation creation guide

### Learning Resources

- **MCP Specification**: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)
- **TypeScript SDK**: [GitHub Repository](https://github.com/modelcontextprotocol/typescript-sdk)
- **Python SDK**: [GitHub Repository](https://github.com/modelcontextprotocol/python-sdk)
- **MCP Inspector**: Built-in testing tool (`npx @modelcontextprotocol/inspector`)

### Getting Help

**Within Claude Code Session**:
```
Help me troubleshoot mcp-builder - [describe issue]
```

**PAI Community**:
- Share MCP server development experiences
- Exchange evaluation question examples
- Discuss best practices and patterns

**MCP Community**:
- Official MCP Discord/forums
- GitHub discussions on SDK repositories

---

**Installation Guide Version**: 2.0
**Last Updated**: 2026-01-03
**Estimated Installation Time**: 10-15 minutes (verification only)
**License**: See LICENSE.txt for complete terms
