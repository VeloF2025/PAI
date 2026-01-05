# Meta-Prompting Installation Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-04
**Compatibility**: Claude Code CLI v2.0+

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Hook Integration](#hook-integration)
4. [Storage Configuration](#storage-configuration)
5. [MCP Server Setup](#mcp-server-setup)
6. [Environment Variables](#environment-variables)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)
9. [Production Deployment](#production-deployment)

---

## Prerequisites

### Required Components

**Claude Code CLI**:
- Version: 2.0.0 or higher
- Installation: Follow [Claude Code installation guide](https://docs.anthropic.com/claude-code)
- Verify: `claude-code --version`

**Runtime Environment**:
- Node.js 18+ (for TypeScript hooks)
- Bun 1.0+ (recommended) or Node.js 20+
- TypeScript 5.0+

**MCP Servers** (Model Context Protocol):
- `@minipuft/claude-prompts-mcp` - Prompt enhancement tools
- `@modelcontextprotocol/server-memory` - Optional, for prompt history

**File System Access**:
- Read/write permissions to `~/.claude/` directory
- Storage space: ~50MB for prompt archives (grows over time)

### Recommended Components

**PAI Enhancement Tools** (Optional but recommended):
- `enhance_research_prompt` - For research task optimization
- `enhance_coding_prompt` - For development task optimization
- `add_chain_of_thought` - For complex reasoning tasks
- `add_xml_formatting` - For structured output tasks
- `optimize_for_claude` - Final optimization step (always applied)

**Voice Notifications** (Optional):
- ElevenLabs API key for voice feedback on prompt clarification
- Configure in `~/.claude/settings.json` env section

---

## Installation Steps

### Step 1: Create Directory Structure

```bash
# Create meta-prompting skill directory
mkdir -p ~/.claude/skills/meta-prompting/{workflows,templates,tests}

# Create storage directories
mkdir -p ~/.claude/prompts/{vague,clarified,completed,archived}
mkdir -p ~/.claude/prompts/templates

# Create logs directory
mkdir -p ~/.claude/logs/meta-prompting
```

**Expected Result**:
```
~/.claude/
├── skills/
│   └── meta-prompting/
│       ├── workflows/
│       ├── templates/
│       └── tests/
└── prompts/
    ├── vague/           # Stores original vague prompts
    ├── clarified/       # Stores enhanced prompts
    ├── completed/       # Stores successful executions
    ├── archived/        # Stores old prompts (auto-cleanup)
    └── templates/       # Reusable prompt templates
```

### Step 2: Install Skill Files

Copy the meta-prompting skill files to `~/.claude/skills/meta-prompting/`:

```bash
# From the PAI repository
cd /path/to/Personal_AI_Infrastructure

# Copy skill files
cp -r .claude/skills/meta-prompting/* ~/.claude/skills/meta-prompting/

# Verify installation
ls -la ~/.claude/skills/meta-prompting/
```

**Expected Files**:
- `SKILL.md` - Main skill documentation (645 lines)
- `README.md` - Overview and quick start (521 lines)
- `PACK_README.md` - Pack v2.0 overview (this was just created)
- `PACK_INSTALL.md` - This installation guide
- `TEST_RESULTS.md` - Test results and benchmarks (419 lines)
- `workflows/clarification.md` - Clarification workflow (477 lines)
- `workflows/execution.md` - Execution orchestration (485 lines)
- `templates/` - Prompt templates directory

### Step 3: Install Hook Integration

The meta-prompting system requires two hooks:

**UserPromptSubmit Hook** (Auto-detection):
```typescript
// ~/.claude/hooks/auto-meta-prompt-clarification.ts
// This hook is already installed in PAI
// Verifies automatic vague prompt detection
```

**PostToolUse Hook** (Archival):
```typescript
// ~/.claude/hooks/auto-prompt-archival.ts
// This hook is already installed in PAI
// Stores successful prompts for learning
```

**Verify hooks are registered** in `~/.claude/settings.json`:

```bash
# Check if hooks are present
grep -A 10 "UserPromptSubmit" ~/.claude/settings.json
grep -A 10 "PostToolUse" ~/.claude/settings.json
```

**Expected Output**:
```json
"UserPromptSubmit": [
  {
    "matcher": "",
    "hooks": [
      {
        "type": "command",
        "command": "bun.exe C:/Users/HeinvanVuuren/.claude/hooks/auto-meta-prompt-clarification.ts"
      }
    ]
  }
],
"PostToolUse": [
  {
    "matcher": "*",
    "hooks": [
      {
        "type": "command",
        "command": "bun.exe C:/Users/HeinvanVuuren/.claude/hooks/auto-prompt-archival.ts"
      }
    ]
  }
]
```

### Step 4: Install MCP Servers

**Install claude-prompts MCP** (required for PAI enhancement tools):

```bash
# Install via npx (auto-install on first use)
npx -y @minipuft/claude-prompts-mcp --help

# Or add to settings.json mcpServers section
```

**Add to `~/.claude/settings.json`**:

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

**Restart Claude Code CLI** to activate MCP server:

```bash
# Exit current session
exit

# Start new session (MCP auto-connects)
claude-code
```

**Verify MCP connection**:

```bash
# In Claude Code session
/mcp
```

**Expected Output**:
```
✅ claude-prompts - Connected
```

---

## Hook Integration

### UserPromptSubmit Hook Configuration

**Purpose**: Automatically detect vague prompts and trigger TÂCHES Phase 1 (Clarification).

**Detection Criteria** (all must be true):
1. Prompt length < 50 words
2. Contains vague terms: "something", "stuff", "thing", "maybe", "kinda", "sorta", "I guess"
3. Missing requirements keywords: "specific", "exactly", "must", "requirement", "constraint"
4. Missing technical specificity: No framework/language/technology mentioned

**Bypass Conditions** (any triggers bypass):
- Prompt starts with `[DIRECT]` or `[BYPASS]`
- User says "skip clarification" or "direct execution"
- Clarity score >= 8 (auto-calculated)
- Prompt length > 200 words (assumed detailed)

**Configuration in hook**:

```typescript
// ~/.claude/hooks/auto-meta-prompt-clarification.ts

const VAGUE_THRESHOLD = 50; // words
const CLARITY_BYPASS_SCORE = 8; // 0-10 scale
const DETAILED_THRESHOLD = 200; // words

const VAGUE_TERMS = [
  "something", "stuff", "thing", "maybe",
  "kinda", "sorta", "I guess", "whatever",
  "anything", "somehow", "some kind of"
];

const SPECIFICITY_KEYWORDS = [
  "specific", "exactly", "must", "requirement",
  "constraint", "precisely", "explicitly"
];
```

### PostToolUse Hook Configuration

**Purpose**: Archive successful prompts for learning and template generation.

**Archival Triggers**:
1. Task tool execution completes successfully (exit code 0)
2. Prompt was enhanced via meta-prompting (contains metadata)
3. User does not explicitly opt-out (no `[NO_ARCHIVE]` flag)

**Storage Locations**:
- `~/.claude/prompts/completed/` - Successful executions
- `~/.claude/prompts/archived/` - Auto-archived after 30 days
- `~/.claude/prompts/templates/` - User-promoted templates

**Configuration in hook**:

```typescript
// ~/.claude/hooks/auto-prompt-archival.ts

const ARCHIVE_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".claude/prompts/completed"
);

const AUTO_ARCHIVE_DAYS = 30; // Move to archived/ after 30 days
const MAX_COMPLETED_PROMPTS = 100; // Auto-cleanup threshold
```

---

## Storage Configuration

### Directory Permissions

**Set proper permissions** (Unix/Linux/macOS):

```bash
# Ensure directories are writable
chmod 755 ~/.claude/prompts
chmod 755 ~/.claude/prompts/{vague,clarified,completed,archived,templates}
chmod 755 ~/.claude/logs/meta-prompting
```

**Windows** (PowerShell):

```powershell
# Verify write access
Test-Path -Path "$env:USERPROFILE\.claude\prompts" -PathType Container
```

### Storage Quotas

**Default Quotas**:
- `vague/` - 50 prompts max (FIFO cleanup)
- `clarified/` - 100 prompts max (FIFO cleanup)
- `completed/` - 100 prompts max (auto-archive after 30 days)
- `archived/` - Unlimited (manual cleanup recommended)
- `templates/` - Unlimited

**Configure quotas** in environment variables:

```bash
# Add to ~/.bashrc or ~/.zshrc (Unix/Linux/macOS)
export META_PROMPT_MAX_VAGUE=50
export META_PROMPT_MAX_CLARIFIED=100
export META_PROMPT_MAX_COMPLETED=100
export META_PROMPT_ARCHIVE_DAYS=30

# Windows (System Environment Variables)
setx META_PROMPT_MAX_VAGUE 50
setx META_PROMPT_MAX_CLARIFIED 100
setx META_PROMPT_MAX_COMPLETED 100
setx META_PROMPT_ARCHIVE_DAYS 30
```

### Auto-Cleanup Configuration

**Cleanup Schedule**:
- Runs on SessionEnd hook (end of each Claude Code session)
- Moves old prompts from `completed/` to `archived/`
- Deletes oldest prompts from `vague/` and `clarified/` if quota exceeded

**Disable auto-cleanup**:

```bash
# Set to 0 to disable auto-cleanup
export META_PROMPT_AUTO_CLEANUP=0
```

---

## MCP Server Setup

### claude-prompts MCP Server

**Installation**:

```bash
# Verify npx can access the package
npx -y @minipuft/claude-prompts-mcp --version

# Expected output: v1.x.x or higher
```

**Configuration in settings.json**:

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
        "PROMPTS_DIR": "${HOME}/.claude/prompts"
      }
    }
  }
}
```

**Verify Tools Available**:

After MCP server starts, verify the following tools are available:

```typescript
// Should be accessible via mcp__claude-prompts__* prefix
mcp__claude-prompts__enhance_research_prompt
mcp__claude-prompts__enhance_coding_prompt
mcp__claude-prompts__add_chain_of_thought
mcp__claude-prompts__add_xml_formatting
mcp__claude-prompts__optimize_for_claude
```

**Test MCP connectivity**:

```bash
# In Claude Code session
# Ask Claude to use a PAI enhancement tool
"Can you enhance this prompt for research: 'Find information about AI'"
```

**Expected behavior**: Claude should invoke `mcp__claude-prompts__enhance_research_prompt` automatically.

### Optional: Memory MCP Server

**Purpose**: Store prompt history in knowledge graph for advanced learning.

**Installation**:

```bash
# Install memory MCP server
npx -y @modelcontextprotocol/server-memory --help
```

**Add to settings.json**:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    }
  }
}
```

**Integration**: Meta-prompting will automatically store successful prompts as entities in the memory graph if this MCP is available.

---

## Environment Variables

### Required Variables

**None** - Meta-prompting works out-of-the-box with defaults.

### Optional Variables

**PAI Enhancement Configuration**:

```bash
# Enable/disable PAI meta-prompt clarification
export PAI_META_PROMPT_ENABLED=true  # default: true

# Enable/disable automatic prompt archival
export PAI_META_PROMPT_ARCHIVAL=true  # default: true

# Minimum clarity score to bypass clarification (0-10)
export PAI_META_PROMPT_MIN_CLARITY=6  # default: 6

# Voice notifications for clarification prompts (requires ElevenLabs API)
export PAI_VOICE_ENABLED=false  # default: false
export ELEVENLABS_API_KEY=your_api_key_here
```

**Storage Configuration**:

```bash
# Custom storage directory (default: ~/.claude/prompts)
export META_PROMPT_STORAGE_DIR=/custom/path/prompts

# Storage quotas
export META_PROMPT_MAX_VAGUE=50
export META_PROMPT_MAX_CLARIFIED=100
export META_PROMPT_MAX_COMPLETED=100
export META_PROMPT_ARCHIVE_DAYS=30

# Auto-cleanup (default: enabled)
export META_PROMPT_AUTO_CLEANUP=1
```

**Execution Strategy Tuning**:

```bash
# Force execution strategy (overrides auto-detection)
# Options: "single", "sequential", "parallel"
export META_PROMPT_EXECUTION_STRATEGY=auto  # default: auto

# Model selection for different phases
export META_PROMPT_CLARIFICATION_MODEL=sonnet  # default: sonnet
export META_PROMPT_EXECUTION_MODEL=sonnet     # default: sonnet (or haiku for simple)
```

**Debug/Development**:

```bash
# Enable verbose logging
export META_PROMPT_DEBUG=true  # default: false

# Log file location
export META_PROMPT_LOG_FILE=~/.claude/logs/meta-prompting/debug.log
```

### Setting Environment Variables

**Unix/Linux/macOS** (add to `~/.bashrc` or `~/.zshrc`):

```bash
# Meta-Prompting Configuration
export PAI_META_PROMPT_ENABLED=true
export PAI_META_PROMPT_ARCHIVAL=true
export PAI_META_PROMPT_MIN_CLARITY=6
export META_PROMPT_DEBUG=false
```

**Windows** (PowerShell - persistent):

```powershell
# Set system environment variables
[System.Environment]::SetEnvironmentVariable("PAI_META_PROMPT_ENABLED", "true", "User")
[System.Environment]::SetEnvironmentVariable("PAI_META_PROMPT_ARCHIVAL", "true", "User")
[System.Environment]::SetEnvironmentVariable("PAI_META_PROMPT_MIN_CLARITY", "6", "User")
```

**Windows** (Command Prompt - persistent):

```cmd
setx PAI_META_PROMPT_ENABLED true
setx PAI_META_PROMPT_ARCHIVAL true
setx PAI_META_PROMPT_MIN_CLARITY 6
```

**Claude Code settings.json** (recommended for PAI users):

```json
{
  "env": {
    "PAI_META_PROMPT_ENABLED": "true",
    "PAI_META_PROMPT_ARCHIVAL": "true",
    "PAI_META_PROMPT_MIN_CLARITY": "6",
    "META_PROMPT_DEBUG": "false"
  }
}
```

---

## Verification

### Step 1: Verify Directory Structure

```bash
# Check all directories exist
test -d ~/.claude/skills/meta-prompting && echo "✅ Skill directory exists"
test -d ~/.claude/prompts/vague && echo "✅ Storage directories exist"
test -d ~/.claude/logs/meta-prompting && echo "✅ Log directory exists"
```

**Expected Output**:
```
✅ Skill directory exists
✅ Storage directories exist
✅ Log directory exists
```

### Step 2: Verify Hooks are Active

```bash
# Check UserPromptSubmit hook
grep -q "auto-meta-prompt-clarification.ts" ~/.claude/settings.json && echo "✅ UserPromptSubmit hook registered"

# Check PostToolUse hook
grep -q "auto-prompt-archival.ts" ~/.claude/settings.json && echo "✅ PostToolUse hook registered"
```

**Expected Output**:
```
✅ UserPromptSubmit hook registered
✅ PostToolUse hook registered
```

### Step 3: Verify MCP Server Connection

**Start Claude Code session**:

```bash
claude-code
```

**In Claude Code session**:

```
/mcp
```

**Expected Output**:
```
Connected MCP Servers:
✅ claude-prompts
✅ memory (if installed)
```

### Step 4: Test Vague Prompt Detection

**In Claude Code session, test with a deliberately vague prompt**:

```
"Can you help me build something with React?"
```

**Expected Behavior**:
1. UserPromptSubmit hook detects vague prompt (< 50 words, contains "something")
2. Meta-prompting Phase 1 activates (10-point clarity assessment)
3. Claude asks clarification questions about:
   - What "something" means (objective)
   - Technical requirements (React version, state management, etc.)
   - Scope and constraints
   - Success criteria

**If this happens**: ✅ Vague prompt detection working correctly

### Step 5: Test Auto-Bypass for Clear Prompts

**In Claude Code session, test with a detailed prompt**:

```
"Create a React 18 TypeScript component named UserProfile that displays user data from a /api/users/:id endpoint. Use TailwindCSS for styling, implement loading states, error handling with try-catch, and use React Query for data fetching. The component should render: avatar image, name, email, bio, and join date. Include PropTypes validation and export as default."
```

**Expected Behavior**:
1. UserPromptSubmit hook calculates clarity score >= 8
2. Meta-prompting automatically bypasses Phase 1 (no clarification needed)
3. Executes directly with PAI enhancement tools:
   - `enhance_coding_prompt` (adds best practices)
   - `optimize_for_claude` (final optimization)
4. Uses single-agent execution strategy (clear + simple scope)

**If this happens**: ✅ Auto-bypass working correctly

### Step 6: Verify Prompt Archival

**After completing a task successfully**:

```bash
# Check if prompt was archived
ls -la ~/.claude/prompts/completed/

# Should see timestamped JSON files
```

**Expected Output**:
```
-rw-r--r-- 1 user user 2048 Jan 04 07:30 2026-01-04_07-30-15_enhanced-prompt.json
```

**If files exist**: ✅ Prompt archival working correctly

### Step 7: Test PAI Enhancement Tools

**In Claude Code session**:

```
"Can you enhance this research prompt: 'Find information about transformer architecture'"
```

**Expected Behavior**:
1. Claude invokes `mcp__claude-prompts__enhance_research_prompt`
2. Returns enhanced prompt with:
   - Specific research objectives
   - Source credibility criteria
   - Citation requirements
   - Structured output format

**If enhancement happens**: ✅ PAI enhancement tools working correctly

### Complete Verification Checklist

Run all checks:

```bash
#!/bin/bash
# Meta-Prompting Verification Script

echo "🔍 Meta-Prompting Installation Verification"
echo "=========================================="

# Directory structure
test -d ~/.claude/skills/meta-prompting && echo "✅ Skill directory" || echo "❌ Skill directory missing"
test -d ~/.claude/prompts/vague && echo "✅ Storage directories" || echo "❌ Storage directories missing"
test -d ~/.claude/logs/meta-prompting && echo "✅ Log directory" || echo "❌ Log directory missing"

# Hooks
grep -q "auto-meta-prompt-clarification.ts" ~/.claude/settings.json && echo "✅ UserPromptSubmit hook" || echo "❌ UserPromptSubmit hook missing"
grep -q "auto-prompt-archival.ts" ~/.claude/settings.json && echo "✅ PostToolUse hook" || echo "❌ PostToolUse hook missing"

# Environment variables
[[ -n "$PAI_META_PROMPT_ENABLED" ]] && echo "✅ PAI_META_PROMPT_ENABLED set" || echo "⚠️  PAI_META_PROMPT_ENABLED not set (using defaults)"

# Files
test -f ~/.claude/skills/meta-prompting/SKILL.md && echo "✅ SKILL.md exists" || echo "❌ SKILL.md missing"
test -f ~/.claude/skills/meta-prompting/workflows/clarification.md && echo "✅ Workflows exist" || echo "❌ Workflows missing"

echo "=========================================="
echo "✅ Verification complete. Check for any ❌ items above."
```

**Save and run**:

```bash
chmod +x verify-meta-prompting.sh
./verify-meta-prompting.sh
```

---

## Troubleshooting

### Issue 1: Hooks Not Triggering

**Symptom**: Vague prompts are not triggering clarification phase.

**Diagnosis**:

```bash
# Check if hooks are registered
grep "UserPromptSubmit" ~/.claude/settings.json

# Check if hook file exists
test -f ~/.claude/hooks/auto-meta-prompt-clarification.ts && echo "Hook file exists"

# Check hook execution permissions (Unix/Linux/macOS)
ls -l ~/.claude/hooks/auto-meta-prompt-clarification.ts
```

**Solutions**:

1. **Hook not registered**:
   ```bash
   # Manually add to settings.json under "hooks" > "UserPromptSubmit"
   ```

2. **Hook file missing**:
   ```bash
   # Copy from PAI repository
   cp /path/to/PAI/.claude/hooks/auto-meta-prompt-clarification.ts ~/.claude/hooks/
   ```

3. **Permission issues** (Unix/Linux/macOS):
   ```bash
   chmod +x ~/.claude/hooks/auto-meta-prompt-clarification.ts
   ```

4. **Bun not found**:
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash

   # Or use Node.js instead (update settings.json)
   "command": "node ~/.claude/hooks/auto-meta-prompt-clarification.ts"
   ```

### Issue 2: MCP Server Not Connecting

**Symptom**: `/mcp` command shows claude-prompts as disconnected or missing.

**Diagnosis**:

```bash
# Test MCP server directly
npx -y @minipuft/claude-prompts-mcp --help

# Check settings.json configuration
grep -A 5 "claude-prompts" ~/.claude/settings.json
```

**Solutions**:

1. **Package not installed**:
   ```bash
   # Force install
   npm install -g @minipuft/claude-prompts-mcp
   ```

2. **npx not found**:
   ```bash
   # Install Node.js and npm
   # Visit: https://nodejs.org/
   ```

3. **Incorrect configuration**:
   ```json
   // Fix settings.json mcpServers section
   {
     "mcpServers": {
       "claude-prompts": {
         "command": "npx",
         "args": ["-y", "@minipuft/claude-prompts-mcp"]
       }
     }
   }
   ```

4. **Restart required**:
   ```bash
   # Exit Claude Code and restart
   exit
   claude-code
   ```

### Issue 3: Prompts Not Being Archived

**Symptom**: No files appear in `~/.claude/prompts/completed/` after successful task completion.

**Diagnosis**:

```bash
# Check if PostToolUse hook is registered
grep "auto-prompt-archival.ts" ~/.claude/settings.json

# Check directory permissions
ls -ld ~/.claude/prompts/completed/

# Check environment variable
echo $PAI_META_PROMPT_ARCHIVAL
```

**Solutions**:

1. **Hook not registered**: Add to settings.json PostToolUse hooks

2. **Directory not writable**:
   ```bash
   # Fix permissions (Unix/Linux/macOS)
   chmod 755 ~/.claude/prompts/completed/

   # Windows: Check folder properties > Security > Permissions
   ```

3. **Archival disabled**:
   ```bash
   # Enable archival
   export PAI_META_PROMPT_ARCHIVAL=true

   # Or add to settings.json env section
   ```

4. **Task did not complete successfully**: Hook only archives successful executions (exit code 0)

### Issue 4: Clarity Score Always Triggers Bypass

**Symptom**: Even vague prompts bypass clarification phase.

**Diagnosis**:

```bash
# Check minimum clarity threshold
echo $PAI_META_PROMPT_MIN_CLARITY

# Check hook logic
cat ~/.claude/hooks/auto-meta-prompt-clarification.ts | grep CLARITY_BYPASS_SCORE
```

**Solutions**:

1. **Threshold too low**:
   ```bash
   # Increase threshold (default: 6)
   export PAI_META_PROMPT_MIN_CLARITY=7
   ```

2. **Detection criteria too lenient**: Edit hook to adjust vague term detection

3. **Prompt contains bypass keywords**: Avoid using `[DIRECT]`, `[BYPASS]`, "skip clarification"

### Issue 5: PAI Enhancement Tools Not Working

**Symptom**: Claude does not invoke `mcp__claude-prompts__enhance_*` tools.

**Diagnosis**:

```bash
# Verify MCP server is connected
# In Claude Code session: /mcp

# Check if tools are available
# Ask Claude: "List available MCP tools for claude-prompts"
```

**Solutions**:

1. **MCP server not connected**: See Issue 2 solutions

2. **Tools not exposed**:
   ```bash
   # Reinstall claude-prompts MCP
   npm uninstall -g @minipuft/claude-prompts-mcp
   npm install -g @minipuft/claude-prompts-mcp
   ```

3. **Prompt not triggering enhancement**: Explicitly request enhancement:
   ```
   "Use enhance_research_prompt to improve this: [your prompt]"
   ```

### Issue 6: High Memory Usage

**Symptom**: Claude Code session uses excessive memory (> 2GB).

**Diagnosis**:

```bash
# Check prompt archive sizes
du -sh ~/.claude/prompts/*

# Count archived prompts
ls ~/.claude/prompts/completed/ | wc -l
```

**Solutions**:

1. **Too many archived prompts**:
   ```bash
   # Manual cleanup
   rm -rf ~/.claude/prompts/archived/*

   # Or reduce quotas
   export META_PROMPT_MAX_COMPLETED=50
   ```

2. **Large prompt files**:
   ```bash
   # Find large files (> 1MB)
   find ~/.claude/prompts/ -type f -size +1M

   # Delete if not needed
   ```

3. **Disable archival temporarily**:
   ```bash
   export PAI_META_PROMPT_ARCHIVAL=false
   ```

### Issue 7: Debug Logging

**Enable verbose logging** to diagnose issues:

```bash
# Enable debug mode
export META_PROMPT_DEBUG=true
export META_PROMPT_LOG_FILE=~/.claude/logs/meta-prompting/debug.log

# Restart Claude Code
exit
claude-code

# Monitor logs in real-time
tail -f ~/.claude/logs/meta-prompting/debug.log
```

**Log output will show**:
- Hook trigger events
- Clarity score calculations
- PAI enhancement tool invocations
- Storage operations
- MCP server communications

---

## Production Deployment

### Performance Optimization

**Recommended Settings for Production**:

```bash
# Reduce clarification interruptions (higher bypass threshold)
export PAI_META_PROMPT_MIN_CLARITY=7

# Disable archival for high-volume environments
export PAI_META_PROMPT_ARCHIVAL=false

# Use faster model for simple tasks
export META_PROMPT_EXECUTION_MODEL=haiku

# Disable debug logging
export META_PROMPT_DEBUG=false
```

### Scaling Considerations

**High-Volume Environments** (> 100 prompts/day):

1. **Disable auto-cleanup** (run manual cleanup weekly):
   ```bash
   export META_PROMPT_AUTO_CLEANUP=0
   ```

2. **Increase storage quotas**:
   ```bash
   export META_PROMPT_MAX_COMPLETED=500
   export META_PROMPT_MAX_CLARIFIED=500
   ```

3. **Use external storage** (S3, database):
   ```bash
   export META_PROMPT_STORAGE_DIR=/mnt/shared-storage/prompts
   ```

4. **Load balance MCP servers** (if using Memory MCP):
   - Run multiple Memory MCP instances
   - Configure round-robin connection

### Security Considerations

**Sensitive Data Handling**:

1. **Prompt Content**: Prompts may contain sensitive data (credentials, PII, proprietary info)
   - **Solution**: Encrypt `~/.claude/prompts/` directory at rest
   - **Solution**: Disable archival for sensitive projects (`PAI_META_PROMPT_ARCHIVAL=false`)

2. **API Keys**: PAI enhancement tools may require API keys
   - **Solution**: Store keys in system keychain, not environment variables
   - **Solution**: Use `.env` files with proper permissions (0600)

3. **Multi-User Environments**: Shared systems may expose prompt archives
   - **Solution**: Use user-specific storage paths
   - **Solution**: Set directory permissions to 700 (owner-only access)

```bash
# Secure permissions (Unix/Linux/macOS)
chmod 700 ~/.claude/prompts
chmod 600 ~/.claude/prompts/completed/*
```

### Monitoring and Alerting

**Key Metrics to Monitor**:

1. **Clarification Rate**: Percentage of prompts triggering Phase 1
   - Target: < 30% (most prompts should be clear)
   - Alert: > 50% (users may need training on prompt writing)

2. **Execution Success Rate**: Percentage of successful task completions
   - Target: > 90%
   - Alert: < 70% (may indicate poor prompt quality or execution issues)

3. **Storage Usage**: Disk space consumed by prompt archives
   - Target: < 1GB total
   - Alert: > 5GB (trigger cleanup)

4. **MCP Server Uptime**: claude-prompts availability
   - Target: > 99%
   - Alert: < 95% (investigate connection issues)

**Monitoring Script**:

```bash
#!/bin/bash
# Meta-Prompting Production Monitoring

COMPLETED_DIR=~/.claude/prompts/completed
ARCHIVED_DIR=~/.claude/prompts/archived

# Calculate clarification rate (last 100 prompts)
TOTAL=$(ls $COMPLETED_DIR | wc -l)
CLARIFIED=$(grep -l '"phase":"clarification"' $COMPLETED_DIR/* | wc -l)
RATE=$((CLARIFIED * 100 / TOTAL))

echo "Clarification Rate: $RATE% ($CLARIFIED/$TOTAL)"

# Check storage usage
STORAGE=$(du -sh ~/.claude/prompts | cut -f1)
echo "Storage Usage: $STORAGE"

# Check MCP server status
MCP_STATUS=$(pgrep -f "claude-prompts-mcp" && echo "Running" || echo "Down")
echo "MCP Server: $MCP_STATUS"

# Alert if needed
if [ $RATE -gt 50 ]; then
  echo "⚠️  ALERT: High clarification rate ($RATE% > 50%)"
fi

if [ "$MCP_STATUS" == "Down" ]; then
  echo "🚨 ALERT: MCP server is down"
fi
```

### Backup and Recovery

**Backup Strategy**:

```bash
# Daily backup of prompt archives
tar -czf ~/backups/meta-prompting-$(date +%Y%m%d).tar.gz \
  ~/.claude/prompts/completed \
  ~/.claude/prompts/templates

# Retention: 30 days
find ~/backups/meta-prompting-*.tar.gz -mtime +30 -delete
```

**Recovery**:

```bash
# Restore from backup
tar -xzf ~/backups/meta-prompting-20260104.tar.gz -C ~/
```

---

## Next Steps

After installation:

1. **Read PACK_VERIFY.md** for comprehensive verification tests
2. **Review SKILL.md** for detailed usage examples and workflows
3. **Explore workflows/** for advanced clarification and execution patterns
4. **Test with sample prompts** in TEST_RESULTS.md
5. **Customize templates** in `~/.claude/prompts/templates/` for your use cases

---

## Support and Documentation

**Primary Documentation**:
- `PACK_README.md` - Architecture and feature overview
- `SKILL.md` - Complete skill documentation (645 lines)
- `README.md` - Quick start guide (521 lines)
- `workflows/clarification.md` - Clarification workflow details
- `workflows/execution.md` - Execution orchestration details

**Testing**:
- `TEST_RESULTS.md` - Benchmark results and test cases
- `tests/` - Test suites for verification

**PAI Resources**:
- `~/.claude/docs/pack-v2-migrations.md` - Pack v2.0 migration guide
- `~/.claude/protocols/` - PAI protocol documentation

**Community**:
- GitHub Issues: Report bugs and request features
- Discord: Join PAI community for discussions

---

**Installation Complete!** 🎉

Run verification tests in PACK_VERIFY.md to ensure everything is working correctly.
