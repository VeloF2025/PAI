# Prompt Enhancement Pack - Installation Guide

**Complete installation and configuration instructions for the Prompt Enhancement Pack v2.0**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [MCP Server Configuration](#mcp-server-configuration)
4. [PAI Prompts Setup](#pai-prompts-setup)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

### Required Software

**Claude Code CLI**:
- Version: 2.0 or higher
- Purpose: MCP server integration, Task tool, PAI agents
- Check version: `claude --version`
- Installation: https://claude.com/claude-code

**Node.js**:
- Version: 18.0.0 or higher (20+ recommended)
- Purpose: Run claude-prompts-mcp server
- Check version: `node --version`
- Installation: https://nodejs.org/

**npm or npx**:
- Version: 9.0.0 or higher
- Purpose: Install and run MCP server
- Check version: `npm --version`
- Included with Node.js installation

### System Requirements

**Operating System**:
- Windows 10/11 (tested)
- macOS 10.15+ (tested)
- Linux (Ubuntu 20.04+, tested)

**Disk Space**:
- MCP server: ~50 MB
- Prompt templates: ~5 MB
- Total: ~60 MB

**Memory**:
- Minimum: 4 GB RAM
- Recommended: 8 GB+ RAM
- MCP server uses ~100-200 MB during operation

**Network**:
- Required for: npm package installation
- Optional for: Prompt template updates

### PAI Requirements

**PAI Installation**:
- Personal AI Infrastructure must be installed
- Location: `~/.claude/` or `C:\Users\{username}\.claude\`
- Verify: Check that `~/.claude/skills/` directory exists

**Task Tool Availability**:
- Built into Claude Code CLI 2.0+
- Verify: Run any Claude Code session and check for `Task` tool availability

**PAI Agents**:
- At least one agent should be available (engineer, architect, researcher, etc.)
- Verify: Check `~/.claude/agents/` directory exists

---

## Installation Steps

### Step 1: Install MCP Server Package

The claude-prompts-mcp server provides all 8 enhancement tools.

**Using npx (Recommended)**:

No installation required - npx automatically downloads and runs the latest version:

```bash
# Test that npx can run the server
npx -y @minipuft/claude-prompts-mcp --help
```

Expected output:
```
claude-prompts MCP server
Version: x.x.x
Available tools: 8 enhancement tools
```

**Using npm (Alternative)**:

Install globally if you prefer permanent installation:

```bash
# Install globally
npm install -g @minipuft/claude-prompts-mcp

# Verify installation
claude-prompts-mcp --help
```

**Verify Installation**:

```bash
# Check that the package is accessible
npx @minipuft/claude-prompts-mcp --version
```

Expected output:
```
@minipuft/claude-prompts-mcp v1.0.0
```

**Troubleshooting Step 1**:

If npx fails with "command not found":
```bash
# Verify npm is installed
npm --version

# If npm is missing, reinstall Node.js from https://nodejs.org/
```

If package cannot be found:
```bash
# Try with explicit registry
npx --registry https://registry.npmjs.org @minipuft/claude-prompts-mcp --version
```

---

### Step 2: Configure Claude Code Settings

Add the MCP server to Claude Code's configuration.

**Windows Configuration Path**:
```
C:\Users\{username}\.claude\settings.json
```

**macOS/Linux Configuration Path**:
```
~/.claude/settings.json
```

**Add MCP Server Configuration**:

Open `settings.json` in your text editor and add the following to the `mcpServers` section:

```json
{
  "mcpServers": {
    "claude-prompts": {
      "command": "npx",
      "args": [
        "-y",
        "@minipuft/claude-prompts-mcp"
      ]
    }
  }
}
```

**Complete Example** (if `mcpServers` doesn't exist):

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "mcpServers": {
    "claude-prompts": {
      "command": "npx",
      "args": [
        "-y",
        "@minipuft/claude-prompts-mcp"
      ]
    }
  }
}
```

**Complete Example** (adding to existing `mcpServers`):

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@1.0.31"]
    },
    "claude-prompts": {
      "command": "npx",
      "args": [
        "-y",
        "@minipuft/claude-prompts-mcp"
      ]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Save and Close** the settings file.

**Restart Claude Code**:

```bash
# If Claude Code is running, restart it
# Windows: Close terminal and reopen
# macOS/Linux: Exit and restart Claude Code
```

**Verify MCP Server Connection**:

```bash
# Start a new Claude Code session
claude

# In the session, check for MCP tools
# They should appear as: mcp__claude-prompts__*
```

Expected tools:
- `mcp__claude-prompts__prompt_engine`

**Troubleshooting Step 2**:

If MCP server doesn't appear:

```bash
# Check Claude Code logs for errors
# Windows: %USERPROFILE%\.claude\logs\
# macOS/Linux: ~/.claude/logs/

# Look for lines containing "claude-prompts" or "MCP"
```

Common issues:
- **JSON syntax error**: Validate JSON at https://jsonlint.com/
- **npx not in PATH**: Ensure Node.js bin directory is in system PATH
- **Permission denied**: Run with admin/sudo privileges for global npm install

---

### Step 3: Create Prompt Templates Directory

Set up the directory structure for prompt templates.

**Windows Setup**:

```powershell
# Create prompts directory structure
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\prompts"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\prompts\research"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\prompts\coding"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\prompts\agents"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\prompts\frameworks"

# Verify structure
Get-ChildItem -Path "$env:USERPROFILE\.claude\prompts" -Recurse
```

**macOS/Linux Setup**:

```bash
# Create prompts directory structure
mkdir -p ~/.claude/prompts/{research,coding,agents,frameworks}

# Verify structure
tree ~/.claude/prompts
# or
ls -R ~/.claude/prompts
```

**Expected Directory Structure**:

```
~/.claude/prompts/
├── research/        # Research enhancement templates
├── coding/          # Coding enhancement templates
├── agents/          # Agent-specific templates
└── frameworks/      # Framework-specific templates (CAGEERF, ReACT, etc.)
```

**Troubleshooting Step 3**:

If directory creation fails:

```bash
# Check permissions
ls -la ~/.claude/

# If .claude doesn't exist, PAI may not be installed
# Install PAI first, then retry
```

---

### Step 4: Install Default Prompt Templates (Optional)

The MCP server includes default templates, but you can customize them.

**Default Templates Location**:

Templates are bundled with the MCP server package:
```
node_modules/@minipuft/claude-prompts-mcp/templates/
```

**Copy Default Templates** (optional customization):

**Windows**:

```powershell
# Navigate to MCP package directory
cd $env:APPDATA\npm\node_modules\@minipuft\claude-prompts-mcp\templates

# Copy templates to PAI prompts directory
Copy-Item -Path .\* -Destination "$env:USERPROFILE\.claude\prompts\" -Recurse -Force
```

**macOS/Linux**:

```bash
# Find MCP package location
npm list -g @minipuft/claude-prompts-mcp

# Copy templates (replace /path/to/npm/global/ with actual path)
cp -r /path/to/npm/global/node_modules/@minipuft/claude-prompts-mcp/templates/* ~/.claude/prompts/
```

**Verify Template Installation**:

```bash
# Check that templates exist
ls ~/.claude/prompts/research/
ls ~/.claude/prompts/coding/
```

Expected files (examples):
- `research/comprehensive.md`
- `coding/feature-implementation.md`
- `agents/engineer-task.md`
- `frameworks/cageerf.md`

**Troubleshooting Step 4**:

If templates are not found:

```bash
# Templates are optional - MCP server works with built-in defaults
# Skip this step if you don't need custom templates
```

---

### Step 5: Configure Hot-Reload (Optional)

Enable automatic template reloading when files change.

**Add to settings.json**:

```json
{
  "mcpServers": {
    "claude-prompts": {
      "command": "npx",
      "args": [
        "-y",
        "@minipuft/claude-prompts-mcp"
      ],
      "env": {
        "PROMPTS_DIR": "${HOME}/.claude/prompts",
        "HOT_RELOAD": "true",
        "WATCH_INTERVAL": "1000"
      }
    }
  }
}
```

**Configuration Options**:

- `PROMPTS_DIR`: Custom prompts directory (default: built-in templates)
- `HOT_RELOAD`: Enable file watching (default: `false`)
- `WATCH_INTERVAL`: Check interval in milliseconds (default: `1000`)

**Verify Hot-Reload**:

```bash
# Start Claude Code session
claude

# Edit a template file
echo "Test change" >> ~/.claude/prompts/research/test.md

# Wait 1-2 seconds for reload
# MCP server should log: "Templates reloaded"
```

**Troubleshooting Step 5**:

Hot-reload not working:

```bash
# Check MCP server logs
cat ~/.claude/logs/mcp-claude-prompts.log

# Look for:
# "File watcher initialized"
# "Templates reloaded"
```

If logs show "File watcher failed":
- Ensure `PROMPTS_DIR` path is correct
- Check file permissions on prompts directory
- Verify `HOT_RELOAD` is set to `"true"` (string, not boolean)

---

## MCP Server Configuration

### Basic Configuration

**Minimal Setup** (default templates):

```json
{
  "mcpServers": {
    "claude-prompts": {
      "command": "npx",
      "args": ["-y", "@minipuft/claude-prompts-mcp"]
    }
  }
}
```

This configuration:
- Uses built-in templates
- No hot-reload
- Standard timeout (30s)
- No custom environment variables

---

### Advanced Configuration

**Full Configuration** (all options):

```json
{
  "mcpServers": {
    "claude-prompts": {
      "command": "npx",
      "args": [
        "-y",
        "@minipuft/claude-prompts-mcp"
      ],
      "env": {
        "PROMPTS_DIR": "${HOME}/.claude/prompts",
        "HOT_RELOAD": "true",
        "WATCH_INTERVAL": "1000",
        "LOG_LEVEL": "info",
        "CACHE_TTL": "3600",
        "MAX_PROMPT_SIZE": "100000"
      },
      "timeout": 60000
    }
  }
}
```

**Configuration Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `PROMPTS_DIR` | string | built-in | Custom templates directory path |
| `HOT_RELOAD` | boolean | `false` | Enable automatic template reloading |
| `WATCH_INTERVAL` | number | `1000` | File watch check interval (ms) |
| `LOG_LEVEL` | string | `"info"` | Logging level: `debug`, `info`, `warn`, `error` |
| `CACHE_TTL` | number | `3600` | Prompt cache time-to-live (seconds) |
| `MAX_PROMPT_SIZE` | number | `50000` | Maximum prompt size (characters) |
| `timeout` | number | `30000` | MCP server timeout (ms) |

---

### Environment Variables

**Using System Environment Variables**:

**Windows**:

```powershell
# Set environment variable
[System.Environment]::SetEnvironmentVariable('CLAUDE_PROMPTS_DIR', 'C:\Users\username\.claude\prompts', 'User')

# Verify
$env:CLAUDE_PROMPTS_DIR
```

**macOS/Linux**:

```bash
# Add to ~/.bashrc or ~/.zshrc
export CLAUDE_PROMPTS_DIR="$HOME/.claude/prompts"

# Reload shell
source ~/.bashrc

# Verify
echo $CLAUDE_PROMPTS_DIR
```

**Reference in settings.json**:

```json
{
  "mcpServers": {
    "claude-prompts": {
      "command": "npx",
      "args": ["-y", "@minipuft/claude-prompts-mcp"],
      "env": {
        "PROMPTS_DIR": "${CLAUDE_PROMPTS_DIR}"
      }
    }
  }
}
```

---

### Performance Tuning

**High-Performance Configuration**:

```json
{
  "mcpServers": {
    "claude-prompts": {
      "command": "npx",
      "args": ["-y", "@minipuft/claude-prompts-mcp"],
      "env": {
        "CACHE_TTL": "7200",
        "MAX_PROMPT_SIZE": "200000",
        "LOG_LEVEL": "warn"
      },
      "timeout": 90000
    }
  }
}
```

Benefits:
- **Longer cache** (2 hours): Reuse enhanced prompts more frequently
- **Larger prompts**: Support very long enhancement requests
- **Reduced logging**: Faster operation, less I/O
- **Extended timeout**: Handle complex multi-stage enhancements

**Low-Resource Configuration**:

```json
{
  "mcpServers": {
    "claude-prompts": {
      "command": "npx",
      "args": ["-y", "@minipuft/claude-prompts-mcp"],
      "env": {
        "CACHE_TTL": "1800",
        "MAX_PROMPT_SIZE": "50000",
        "HOT_RELOAD": "false"
      },
      "timeout": 30000
    }
  }
}
```

Benefits:
- **Shorter cache** (30 min): Lower memory usage
- **Smaller prompts**: Faster processing
- **No hot-reload**: Less CPU overhead
- **Standard timeout**: Faster failure detection

---

## PAI Prompts Setup

### Prompt Template Structure

**Template Format** (Nunjucks syntax):

```markdown
<!-- File: ~/.claude/prompts/research/comprehensive.md -->

# Research Task: {{ topic }}

## Objective
Conduct {{ depth_level }} research on: {{ topic }}

## Research Areas
{% for area in research_areas %}
- {{ area }}
{% endfor %}

## Deliverables
- Markdown report with {{ num_sources }} cited sources
- {{ deliverable_format }} format
{% if include_examples %}
- Include 2-3 real-world examples
{% endif %}

## Timeline
Expected completion: {{ timeline | default("Standard research timeframe") }}
```

**Using Template in Enhancement**:

```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_research_prompt topic=\"JWT security\" depth_level=\"extensive\" research_areas=[\"vulnerabilities\",\"best practices\",\"implementation\"] include_examples=true"
})
```

---

### Default Template Categories

**1. Research Templates** (`~/.claude/prompts/research/`):

- `comprehensive.md` - Extensive research with citations
- `quick.md` - Fast research for immediate answers
- `comparative.md` - Compare multiple options/technologies
- `tutorial.md` - Research for creating tutorials

**2. Coding Templates** (`~/.claude/prompts/coding/`):

- `feature-implementation.md` - New feature development
- `bug-fix.md` - Debugging and fixing issues
- `refactoring.md` - Code refactoring tasks
- `optimization.md` - Performance optimization

**3. Agent Templates** (`~/.claude/prompts/agents/`):

- `engineer.md` - Engineering-focused tasks
- `architect.md` - System design tasks
- `pentester.md` - Security testing tasks
- `designer.md` - UX/UI design tasks

**4. Framework Templates** (`~/.claude/prompts/frameworks/`):

- `cageerf.md` - CAGEERF framework structure
- `react.md` - ReACT reasoning framework
- `5w1h.md` - 5W1H analysis framework
- `scamper.md` - SCAMPER creative framework

---

### Creating Custom Templates

**Example: Custom Research Template**

Create file: `~/.claude/prompts/research/api-security.md`

```markdown
# API Security Research: {{ api_type }}

## Security Analysis Framework

### 1. Authentication & Authorization
- OAuth 2.0 / OpenID Connect implementation
- JWT token security
- API key management
{% if include_mfa %}
- Multi-factor authentication
{% endif %}

### 2. Common Vulnerabilities
- SQL injection prevention
- XSS protection
- CSRF tokens
- Rate limiting strategies

### 3. Best Practices
- HTTPS enforcement
- Input validation
- Output encoding
- Security headers (CORS, CSP, etc.)

### 4. Deliverables
- Security assessment report
- Vulnerability checklist
- Recommended security controls
{% if include_code_examples %}
- Code examples for each control
{% endif %}

## Research Depth: {{ depth_level | default("standard") }}
## Timeline: {{ timeline | default("2-3 hours") }}
```

**Using Custom Template**:

```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_research_prompt template=\"api-security\" api_type=\"REST API\" include_mfa=true include_code_examples=true depth_level=\"extensive\""
})
```

---

### Template Variables Reference

**Common Variables**:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `topic` | string | Main research/task topic | `"JWT security"` |
| `depth_level` | string | Detail level | `"quick"`, `"standard"`, `"extensive"` |
| `agent_type` | string | Target agent | `"engineer"`, `"architect"` |
| `complexity` | string | Task complexity | `"low"`, `"medium"`, `"high"` |
| `timeline` | string | Expected timeframe | `"1 hour"`, `"1 week"` |
| `include_examples` | boolean | Include examples | `true`, `false` |
| `num_examples` | number | Example count | `2`, `3`, `5` |
| `project_context` | string | Project info | `"Next.js app with PostgreSQL"` |

**Nunjucks Syntax**:

```nunjucks
{{ variable }}                    <!-- Output variable -->
{{ variable | default("value") }} <!-- Default if undefined -->
{% if condition %}...{% endif %}  <!-- Conditional -->
{% for item in array %}...{% endfor %} <!-- Loop -->
```

---

## Verification

### Quick Verification

**Test MCP Server Connection**:

```bash
# Start Claude Code session
claude

# In session, try basic enhancement
```

Request in Claude Code:
```
Test the enhance_research_prompt tool with: "research Docker security"
```

Expected: Tool should execute and return enhanced prompt specification.

**Verify All 8 Tools Available**:

Check that these MCP tools appear:
- `mcp__claude-prompts__prompt_engine`

And that it supports these commands:
- `>>enhance_research_prompt`
- `>>enhance_coding_prompt`
- `>>enhance_agent_task`
- `>>add_chain_of_thought`
- `>>add_few_shot_examples`
- `>>optimize_for_claude`
- `>>compress_prompt`
- `>>multi_agent_router`

---

### Full Verification

See **PACK_VERIFY.md** for comprehensive verification tests including:
- Quick verification (5 tests)
- Tool availability tests (8 tools)
- Integration tests (3 patterns)
- Performance benchmarks
- MCP connectivity tests

---

## Troubleshooting

### Issue 1: MCP Tools Not Showing Up

**Symptom**: `mcp__claude-prompts__*` tools don't appear in Claude Code session

**Diagnosis**:

```bash
# Check Claude Code logs
cat ~/.claude/logs/main.log | grep -i "claude-prompts"

# Check MCP server logs
cat ~/.claude/logs/mcp-claude-prompts.log
```

**Common Causes**:

**1. MCP Server Not Configured**

Check `~/.claude/settings.json`:
```bash
cat ~/.claude/settings.json | grep -A 5 "claude-prompts"
```

Expected:
```json
"claude-prompts": {
  "command": "npx",
  "args": ["-y", "@minipuft/claude-prompts-mcp"]
}
```

**Fix**: Add MCP server configuration (see Step 2)

**2. npx Not in PATH**

Test:
```bash
which npx  # macOS/Linux
where npx  # Windows
```

If not found:
```bash
# Add Node.js bin to PATH
export PATH="$PATH:/usr/local/bin"  # macOS/Linux

# Windows: Add to System PATH via Environment Variables
```

**3. MCP Server Failed to Start**

Check logs:
```bash
cat ~/.claude/logs/mcp-claude-prompts.log
```

Look for errors like:
- `Error: Cannot find module`
- `Permission denied`
- `ENOENT: no such file or directory`

**Fix**: Reinstall MCP server:
```bash
npm cache clean --force
npx -y @minipuft/claude-prompts-mcp --version
```

**4. JSON Syntax Error in settings.json**

Validate JSON:
```bash
# macOS/Linux
python -m json.tool ~/.claude/settings.json

# Windows
Get-Content $env:USERPROFILE\.claude\settings.json | ConvertFrom-Json
```

If validation fails, fix syntax errors (missing commas, quotes, brackets)

---

### Issue 2: MCP Server Starts But Tools Don't Work

**Symptom**: Tools appear but return errors when called

**Diagnosis**:

Try a simple enhancement:
```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_research_prompt short_prompt=\"test\" depth_level=\"quick\""
})
```

**Common Errors**:

**1. "Unknown command: >>enhance_research_prompt"**

**Cause**: Old version of MCP server

**Fix**:
```bash
# Update to latest version
npx -y @minipuft/claude-prompts-mcp@latest --version

# Update settings.json to use latest
"args": ["-y", "@minipuft/claude-prompts-mcp@latest"]
```

**2. "Template not found"**

**Cause**: Custom template reference doesn't exist

**Fix**:
```bash
# Check template exists
ls ~/.claude/prompts/research/

# Use built-in templates (don't specify template parameter)
```

**3. "Invalid parameter: X"**

**Cause**: Wrong parameter name or type

**Fix**: Check tool documentation in PACK_README.md for correct parameter names

---

### Issue 3: Prompt Templates Not Loading

**Symptom**: Custom templates not being used, built-in templates always used

**Diagnosis**:

```bash
# Check PROMPTS_DIR is set
cat ~/.claude/settings.json | grep PROMPTS_DIR

# Check templates exist
ls -la ~/.claude/prompts/research/
```

**Common Causes**:

**1. PROMPTS_DIR Not Configured**

**Fix**: Add to settings.json:
```json
"env": {
  "PROMPTS_DIR": "${HOME}/.claude/prompts"
}
```

**2. Incorrect Path**

Test path:
```bash
# Expand path manually
echo ~/.claude/prompts
ls ~/.claude/prompts
```

If directory doesn't exist:
```bash
mkdir -p ~/.claude/prompts/{research,coding,agents,frameworks}
```

**3. File Permissions**

Check permissions:
```bash
ls -la ~/.claude/prompts/

# Should show read permissions for current user
# Fix if needed:
chmod -R u+r ~/.claude/prompts/
```

---

### Issue 4: Hot-Reload Not Working

**Symptom**: Template changes not reflected without restarting Claude Code

**Diagnosis**:

```bash
# Check hot-reload is enabled
cat ~/.claude/settings.json | grep -i hot_reload

# Check MCP server logs for file watcher
cat ~/.claude/logs/mcp-claude-prompts.log | grep -i "watch"
```

**Common Causes**:

**1. HOT_RELOAD Not Enabled**

**Fix**: Add to settings.json:
```json
"env": {
  "HOT_RELOAD": "true"
}
```

Note: Must be string `"true"`, not boolean `true`

**2. File Watcher Failed**

Check logs for:
- `File watcher initialization failed`
- `ENOSPC: System limit for number of file watchers reached` (Linux)

**Fix for Linux (ENOSPC)**:
```bash
# Increase file watcher limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**3. Incorrect WATCH_INTERVAL**

Try increasing interval:
```json
"env": {
  "HOT_RELOAD": "true",
  "WATCH_INTERVAL": "2000"
}
```

---

### Issue 5: Performance Issues / Slow Enhancements

**Symptom**: Enhancement tools take >10 seconds to respond

**Diagnosis**:

```bash
# Check MCP server timeout
cat ~/.claude/settings.json | grep -A 10 "claude-prompts" | grep timeout

# Check system resources
top  # macOS/Linux
taskmgr  # Windows
```

**Common Causes**:

**1. Timeout Too Short**

**Fix**: Increase timeout in settings.json:
```json
"claude-prompts": {
  "command": "npx",
  "args": ["-y", "@minipuft/claude-prompts-mcp"],
  "timeout": 60000
}
```

**2. Large Prompts / Complex Templates**

**Fix**: Reduce prompt size or complexity:
```json
"env": {
  "MAX_PROMPT_SIZE": "100000"
}
```

**3. Cache Disabled**

**Fix**: Enable caching:
```json
"env": {
  "CACHE_TTL": "3600"
}
```

**4. Debug Logging Enabled**

**Fix**: Reduce log level:
```json
"env": {
  "LOG_LEVEL": "warn"
}
```

---

### Issue 6: "Package Not Found" Error

**Symptom**: npx cannot find `@minipuft/claude-prompts-mcp` package

**Diagnosis**:

```bash
# Test npm registry access
npm search @minipuft/claude-prompts-mcp

# Check npm configuration
npm config list
```

**Common Causes**:

**1. Network / Firewall Issues**

Test registry access:
```bash
curl https://registry.npmjs.org/@minipuft/claude-prompts-mcp
```

If fails:
- Check firewall settings
- Check proxy configuration
- Try different network

**2. Corporate Proxy**

**Fix**: Configure npm proxy:
```bash
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

**3. Private Registry**

**Fix**: Ensure public registry is accessible:
```bash
npm config set registry https://registry.npmjs.org/
```

---

### Issue 7: "Permission Denied" Errors

**Symptom**: Cannot install MCP server or access prompts directory

**Diagnosis**:

```bash
# Check directory permissions
ls -la ~/.claude/

# Check npm global directory
npm config get prefix
ls -la $(npm config get prefix)
```

**Common Causes**:

**1. No Write Permission to Global npm**

**Fix**: Use npx (no installation) or install with user permissions:
```bash
# Use npx (recommended)
npx -y @minipuft/claude-prompts-mcp --version

# Or configure npm to use user directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

**2. No Write Permission to ~/.claude/**

**Fix**:
```bash
# Take ownership (macOS/Linux)
sudo chown -R $USER:$USER ~/.claude/

# Fix permissions
chmod -R u+rw ~/.claude/
```

---

## Advanced Configuration

### Multiple Prompt Directories

**Use Case**: Different prompt sets for different projects

**Configuration**:

```json
{
  "mcpServers": {
    "claude-prompts-personal": {
      "command": "npx",
      "args": ["-y", "@minipuft/claude-prompts-mcp"],
      "env": {
        "PROMPTS_DIR": "${HOME}/.claude/prompts/personal"
      }
    },
    "claude-prompts-work": {
      "command": "npx",
      "args": ["-y", "@minipuft/claude-prompts-mcp"],
      "env": {
        "PROMPTS_DIR": "${HOME}/.claude/prompts/work"
      }
    }
  }
}
```

Usage:
- Personal prompts: `mcp__claude-prompts-personal__prompt_engine`
- Work prompts: `mcp__claude-prompts-work__prompt_engine`

---

### Custom Framework Integration

**Use Case**: Add custom enhancement frameworks beyond CAGEERF, ReACT, 5W1H, SCAMPER

**Create Framework Template**:

File: `~/.claude/prompts/frameworks/custom-framework.md`

```markdown
# {{ framework_name }} Framework Enhancement

## Framework Structure
{% for step in framework_steps %}
### {{ loop.index }}. {{ step.name }}
{{ step.description }}

{% if step.questions %}
**Key Questions:**
{% for question in step.questions %}
- {{ question }}
{% endfor %}
{% endif %}
{% endfor %}

## Application to Task: {{ task }}

{{ task_application }}

## Expected Output Format
{{ output_format }}
```

**Use Custom Framework**:

```typescript
mcp__claude-prompts__prompt_engine({
  command: ">>enhance_research_prompt template=\"custom-framework\" framework_name=\"CUSTOM\" framework_steps=[...] task=\"research topic\""
})
```

---

### Batch Enhancement Scripts

**Use Case**: Enhance multiple prompts in bulk

**Script**: `batch-enhance.sh`

```bash
#!/bin/bash

# File: batch-enhance.sh
# Usage: ./batch-enhance.sh prompts.txt

while IFS= read -r prompt; do
  echo "Enhancing: $prompt"

  # Call MCP server via Claude Code API (requires API setup)
  curl -X POST http://localhost:8080/mcp/claude-prompts/prompt_engine \
    -H "Content-Type: application/json" \
    -d "{\"command\": \">>enhance_research_prompt short_prompt=\\\"$prompt\\\" depth_level=\\\"standard\\\"\"}"

  echo "---"
done < "$1"
```

**Usage**:

```bash
# Create prompts file
cat > prompts.txt <<EOF
research Docker security
research Kubernetes networking
research API authentication
EOF

# Run batch enhancement
./batch-enhance.sh prompts.txt
```

---

### Integration with CI/CD

**Use Case**: Automatically enhance prompts in automated workflows

**GitHub Actions Example**:

```yaml
# .github/workflows/enhance-prompts.yml

name: Enhance Prompts

on:
  push:
    paths:
      - 'prompts/**'

jobs:
  enhance:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install MCP Server
        run: npm install -g @minipuft/claude-prompts-mcp

      - name: Enhance Prompts
        run: |
          for file in prompts/*.txt; do
            prompt=$(cat "$file")
            claude-prompts-mcp enhance "$prompt" > "enhanced/$(basename "$file")"
          done

      - name: Commit Enhanced Prompts
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add enhanced/
          git commit -m "Auto-enhance prompts" || true
          git push
```

---

## Next Steps

### After Installation

1. **Run Verification Tests**: See PACK_VERIFY.md for comprehensive testing
2. **Try Example Use Cases**: See PACK_README.md for detailed use case walkthroughs
3. **Create Custom Templates**: Customize prompts for your specific workflows
4. **Integrate with PAI Agents**: Use enhanced prompts with Task tool and agents

### Learning Resources

- **PACK_README.md**: Architecture, features, use cases
- **PACK_VERIFY.md**: Verification tests and benchmarks
- **MCP Documentation**: https://modelcontextprotocol.io/
- **Nunjucks Template Syntax**: https://mozilla.github.io/nunjucks/

---

**Installation Guide Version**: 1.0
**Pack Version**: 2.0
**Last Updated**: 2026-01-04

*Complete installation guide for Prompt Enhancement Pack v2.0*

---

## Pack v2.0 Source Files

This pack follows Dan Miesler's Pack v2.0 structure with real code files in `src/`:

**Configuration Files** (`src/config/`):
- `mcp-server.json` - Complete MCP server configuration for claude-prompts-mcp

**Tool Helpers** (`src/tools/`):
- `enhancement-helpers.ts` - TypeScript utilities for using enhancement tools

These files are referenced in the installation steps below. Copy them as needed for your PAI setup.

---
