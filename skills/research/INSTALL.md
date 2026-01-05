# Research Pack - Installation Guide

**Pack Version**: 2.0
**Installation Time**: 15-30 minutes
**Difficulty**: Medium

---

## Overview

This guide walks through installing the Research Pack, which provides massively parallel multi-source research capabilities by orchestrating up to 24 concurrent research agents.

---

## Prerequisites

### Required

- [ ] **Claude Code CLI** (version 0.2.0 or later)
  - Check version: `claude --version`
  - Install/upgrade: https://docs.anthropic.com/claude-code

- [ ] **Anthropic API Key** (for claude-researcher agents)
  - Sign up: https://console.anthropic.com/
  - Minimum: Claude 3 Sonnet access
  - Recommended: Claude 3.5 Sonnet or newer

- [ ] **Perplexity API Key** (for perplexity-researcher agents)
  - Sign up: https://www.perplexity.ai/settings/api
  - Minimum: Basic plan with API access
  - Recommended: Pro plan for higher rate limits

- [ ] **Google Gemini API Key** (for gemini-researcher agents)
  - Sign up: https://makersuite.google.com/app/apikey
  - Minimum: Free tier with API access
  - Recommended: Paid tier for higher quotas

### Recommended

- [ ] **PAI_DIR environment variable** set to your Personal AI Infrastructure directory
  - Example: `export PAI_DIR="$HOME/.claude"` or `C:\Users\YourName\.claude`
  - Used for scratchpad and history directory organization

- [ ] **be-creative skill** installed (for Extensive Research Mode)
  - Location: `${PAI_DIR}/skills/be-creative/`
  - Used to generate 24 diverse research queries in Extensive Mode

- [ ] **Git** (for managing research history and version control)
  - Useful for tracking research archives over time

---

## Installation Steps

### Step 1: Verify Claude Code Installation

```bash
# Check Claude Code is installed
claude --version

# Should show: claude-code version 0.2.0 or later
# If not installed or outdated, visit: https://docs.anthropic.com/claude-code
```

**Expected Output**:
```
claude-code version 0.2.x
```

**If command not found**:
- Install Claude Code CLI following official documentation
- Restart terminal after installation
- Verify installation with `claude --version`

---

### Step 2: Configure API Keys

**Set environment variables for all three research agents:**

#### On macOS/Linux

```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile

# Anthropic API (for claude-researcher)
export ANTHROPIC_API_KEY="sk-ant-api03-..."

# Perplexity API (for perplexity-researcher)
export PERPLEXITY_API_KEY="pplx-..."

# Google Gemini API (for gemini-researcher)
export GEMINI_API_KEY="AIza..."

# Reload shell configuration
source ~/.bashrc  # or ~/.zshrc
```

#### On Windows (PowerShell)

```powershell
# Add to PowerShell profile ($PROFILE)

# Anthropic API (for claude-researcher)
$env:ANTHROPIC_API_KEY = "sk-ant-api03-..."

# Perplexity API (for perplexity-researcher)
$env:PERPLEXITY_API_KEY = "pplx-..."

# Google Gemini API (for gemini-researcher)
$env:GEMINI_API_KEY = "AIza..."

# Or set permanently via System Environment Variables
[System.Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "sk-ant-api03-...", "User")
[System.Environment]::SetEnvironmentVariable("PERPLEXITY_API_KEY", "pplx-...", "User")
[System.Environment]::SetEnvironmentVariable("GEMINI_API_KEY", "AIza...", "User")
```

**Verify API Keys**:
```bash
# Check environment variables are set (should show first few characters)
echo $ANTHROPIC_API_KEY | cut -c1-10  # macOS/Linux
echo $env:ANTHROPIC_API_KEY.Substring(0,10)  # Windows PowerShell

# Verify with Claude Code
claude --version  # Should detect API key automatically
```

---

### Step 3: Set PAI_DIR Environment Variable

**Set PAI_DIR to your Personal AI Infrastructure directory:**

#### On macOS/Linux

```bash
# Add to ~/.bashrc, ~/.zshrc, or ~/.profile
export PAI_DIR="$HOME/.claude"

# Create directory if it doesn't exist
mkdir -p "$PAI_DIR"

# Reload shell
source ~/.bashrc  # or ~/.zshrc
```

#### On Windows (PowerShell)

```powershell
# Set permanently
[System.Environment]::SetEnvironmentVariable("PAI_DIR", "$env:USERPROFILE\.claude", "User")

# Or add to PowerShell profile ($PROFILE)
$env:PAI_DIR = "$env:USERPROFILE\.claude"

# Create directory if it doesn't exist
New-Item -Path "$env:PAI_DIR" -ItemType Directory -Force
```

**Verify PAI_DIR**:
```bash
echo $PAI_DIR  # macOS/Linux
echo $env:PAI_DIR  # Windows PowerShell

# Should show: /home/username/.claude or C:\Users\YourName\.claude
```

---

### Step 4: Create Research Skill Directory Structure

```bash
# Navigate to skills directory
cd "$PAI_DIR/skills/" || cd "$env:PAI_DIR/skills/"

# Create research skill directory
mkdir -p research/workflows

# Verify structure
ls -la research/
```

**Expected Output**:
```
drwxr-xr-x  research/
drwxr-xr-x  research/workflows/
```

---

### Step 5: Install Research Pack Files

**Copy Pack v2.0 files to research skill directory:**

```bash
cd "$PAI_DIR/skills/research/"  # macOS/Linux
cd "$env:PAI_DIR/skills/research/"  # Windows PowerShell

# If you have the pack files in a download/distribution directory:
# cp /path/to/download/research/PACK_README.md .
# cp /path/to/download/research/PACK_INSTALL.md .
# cp /path/to/download/research/PACK_VERIFY.md .
# cp /path/to/download/research/SKILL.md .
# cp /path/to/download/research/workflows/conduct.md workflows/

# Verify all files present
ls -la
ls -la workflows/
```

**Expected Files**:
```
-rw-r--r--  PACK_README.md
-rw-r--r--  PACK_INSTALL.md
-rw-r--r--  PACK_VERIFY.md
-rw-r--r--  SKILL.md
-rw-r--r--  workflows/conduct.md
```

---

### Step 6: Create Scratchpad and History Directories

**Set up working directories for research projects:**

```bash
# Create scratchpad directory (temporary working files)
mkdir -p "$PAI_DIR/scratchpad"

# Create history directory (permanent research archive)
mkdir -p "$PAI_DIR/history/research"

# Verify directories
ls -la "$PAI_DIR/scratchpad"
ls -la "$PAI_DIR/history/research"
```

**Expected Structure**:
```
$PAI_DIR/
├── skills/
│   └── research/
├── scratchpad/  (empty initially)
└── history/
    └── research/  (empty initially)
```

---

### Step 7: Verify Research Agent Availability

**Check that research agent types are available in Claude Code:**

The research skill relies on three specialized agent types:
- **perplexity-researcher**
- **claude-researcher**
- **gemini-researcher**

These agents are typically provided by Claude Code or configured separately. Verify they are available:

```bash
# Start Claude Code session
claude

# In Claude Code, check available agents
# (This is typically done through Claude Code's agent system)
```

**If agents are not available**:
- Research agents may need to be configured separately
- Check Claude Code documentation for agent configuration
- Consult PAI documentation for agent setup
- Some agents may be part of separate skill packs

**Note**: The research skill can function with partial agent availability (e.g., only Claude and Perplexity if Gemini unavailable), but all three are recommended for best results.

---

### Step 8: Install be-creative Skill (Optional - For Extensive Mode)

**The be-creative skill is required for Extensive Research Mode (24 agents):**

```bash
# Navigate to skills directory
cd "$PAI_DIR/skills/"

# Check if be-creative already installed
ls -la be-creative/

# If not installed, install be-creative skill pack
# (Consult be-creative PACK_INSTALL.md for installation instructions)
```

**Extensive Mode Functionality**:
- Without be-creative: Extensive Mode will use standard query decomposition
- With be-creative: Extensive Mode uses UltraThink for maximum query diversity

**Impact**:
- Quick and Standard modes: No impact (work normally)
- Extensive Mode: Reduced query creativity without be-creative

---

### Step 9: Test Basic Research Functionality

**Verify research skill works with a simple test:**

```bash
# Start Claude Code session
claude

# Test Quick Research Mode
# In Claude Code, type:
# "Quick research: What is Claude Code?"
```

**Expected Behavior**:
1. Research skill activates (you see mode selection: Quick)
2. Query decomposition happens (3 sub-questions)
3. Three agents launch in parallel (perplexity, claude, gemini)
4. Agents execute concurrently
5. Results synthesized within 2 minutes
6. Comprehensive report returned

**Success Indicators**:
- ✅ All three agent types launch successfully
- ✅ Results returned within timeout (2 minutes for Quick)
- ✅ Report includes findings with sources
- ✅ Confidence levels assigned to findings
- ✅ No API authentication errors

**If test fails**, see Troubleshooting section below.

---

### Step 10: Test All Three Research Modes

**Verify each research mode functions correctly:**

#### Test 1: Quick Research (3 agents)

```bash
# In Claude Code
"Quick research: When was TypeScript released?"
```

**Expected**:
- 3 agents launch (1 of each type)
- Timeout: 2 minutes
- Results: ~15-30 seconds
- Report: Brief answer with sources

---

#### Test 2: Standard Research (9 agents - Default)

```bash
# In Claude Code
"Research the benefits of solar energy"
```

**Expected**:
- 9 agents launch (3 of each type)
- Timeout: 3 minutes
- Results: ~30-90 seconds
- Report: Comprehensive with multiple perspectives

---

#### Test 3: Extensive Research (24 agents)

```bash
# In Claude Code
"Do extensive research on quantum computing applications"
```

**Expected**:
- be-creative skill activates (if installed)
- 24 diverse queries generated
- 24 agents launch (8 of each type)
- Timeout: 10 minutes
- Results: ~45-180 seconds
- Report: Exhaustive multi-section report

---

## Configuration Customization

### Adjusting Timeouts

**Default timeouts can be modified in SKILL.md:**

```javascript
// Edit ${PAI_DIR}/skills/research/SKILL.md

// Find timeout configuration section
const TIMEOUTS = {
  quick: 120000,      // 2 minutes (120 seconds)
  standard: 180000,   // 3 minutes (180 seconds)
  extensive: 600000   // 10 minutes (600 seconds)
};

// Adjust as needed (values in milliseconds)
const TIMEOUTS = {
  quick: 90000,       // 1.5 minutes
  standard: 240000,   // 4 minutes
  extensive: 900000   // 15 minutes
};
```

**When to adjust**:
- Increase: If agents frequently timeout before completing
- Decrease: If you prefer faster responses with partial results
- Network: Slower networks may need longer timeouts

---

### Customizing Agent Distribution

**Default distribution can be modified for specialized research:**

```javascript
// Edit ${PAI_DIR}/skills/research/SKILL.md

// Default distribution
const AGENT_DISTRIBUTION = {
  quick: { perplexity: 1, claude: 1, gemini: 1 },
  standard: { perplexity: 3, claude: 3, gemini: 3 },
  extensive: { perplexity: 8, claude: 8, gemini: 8 }
};

// Example: Current events research (favor Perplexity)
const AGENT_DISTRIBUTION = {
  quick: { perplexity: 2, claude: 1, gemini: 0 },
  standard: { perplexity: 5, claude: 2, gemini: 2 },
  extensive: { perplexity: 12, claude: 6, gemini: 6 }
};

// Example: Technical research (favor Claude)
const AGENT_DISTRIBUTION = {
  quick: { perplexity: 1, claude: 2, gemini: 0 },
  standard: { perplexity: 2, claude: 5, gemini: 2 },
  extensive: { perplexity: 6, claude: 12, gemini: 6 }
};
```

**Use cases**:
- **Current events**: More Perplexity agents
- **Technical depth**: More Claude agents
- **Multi-perspective**: More Gemini agents
- **API cost optimization**: Fewer total agents

---

### Configuring Scratchpad Retention

**Control how long scratchpad files are kept:**

```bash
# Create cleanup script (optional)
cat > "$PAI_DIR/scripts/cleanup-scratchpad.sh" << 'EOF'
#!/bin/bash
# Delete scratchpad directories older than 7 days
find "$PAI_DIR/scratchpad" -type d -name "*_research-*" -mtime +7 -exec rm -rf {} +
EOF

chmod +x "$PAI_DIR/scripts/cleanup-scratchpad.sh"

# Add to cron (optional - run weekly)
# crontab -e
# 0 0 * * 0 /path/to/cleanup-scratchpad.sh
```

---

## Troubleshooting

### Issue 1: "API key not found" Error

**Symptoms**: Agents fail to launch with authentication errors

**Causes**:
- Environment variables not set
- Environment variables not loaded in current session
- Incorrect API key format

**Fixes**:
```bash
# Verify environment variables are set
env | grep API_KEY  # macOS/Linux
Get-ChildItem Env:*API_KEY*  # Windows PowerShell

# If not set, add to shell profile and reload
source ~/.bashrc  # macOS/Linux
. $PROFILE  # Windows PowerShell

# Verify API keys are valid (test individually)
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" https://api.anthropic.com/v1/messages
curl -H "Authorization: Bearer $PERPLEXITY_API_KEY" https://api.perplexity.ai/chat/completions
```

---

### Issue 2: Agents Timeout Before Completing

**Symptoms**: Frequent timeouts, incomplete results

**Causes**:
- Slow network connection
- API rate limiting
- Complex queries requiring more time
- Timeouts set too aggressively

**Fixes**:
```bash
# Increase timeout values in SKILL.md
const TIMEOUTS = {
  quick: 180000,      // Increase from 2 to 3 minutes
  standard: 300000,   // Increase from 3 to 5 minutes
  extensive: 900000   // Increase from 10 to 15 minutes
};

# Check network latency
ping api.anthropic.com
ping api.perplexity.ai

# Verify API rate limits not exceeded (check provider dashboards)
```

---

### Issue 3: Some Agents Not Available

**Symptoms**: "Agent type not found" errors, only some agents launch

**Causes**:
- Agent types not configured in Claude Code
- Missing agent dependencies
- Agent installation incomplete

**Fixes**:
```bash
# Check which agents are available in Claude Code
# (Consult Claude Code documentation for agent management)

# Install missing agent types if possible
# (Varies by Claude Code version and configuration)

# Workaround: Modify agent distribution to use only available agents
# Edit SKILL.md to remove unavailable agent types
const AGENT_DISTRIBUTION = {
  standard: { perplexity: 4, claude: 5, gemini: 0 }  // If Gemini unavailable
};
```

---

### Issue 4: be-creative Skill Not Found (Extensive Mode)

**Symptoms**: Extensive Mode works but uses standard query decomposition

**Causes**:
- be-creative skill not installed
- be-creative skill location incorrect
- Skill not in PAI skills directory

**Fixes**:
```bash
# Check if be-creative installed
ls -la "$PAI_DIR/skills/be-creative/"

# If not installed, install be-creative pack
# (Consult be-creative PACK_INSTALL.md)

# Verify skill loads in Claude Code
# Start session and check available skills

# Workaround: Extensive Mode will work without be-creative
# (Uses standard query decomposition instead of UltraThink)
```

---

### Issue 5: Scratchpad/History Directories Not Created

**Symptoms**: Errors writing research outputs, missing archive files

**Causes**:
- PAI_DIR not set correctly
- Directory permissions issues
- Path does not exist

**Fixes**:
```bash
# Verify PAI_DIR
echo $PAI_DIR  # Should show correct path

# Create directories manually
mkdir -p "$PAI_DIR/scratchpad"
mkdir -p "$PAI_DIR/history/research"

# Check permissions (should be writable)
ls -la "$PAI_DIR"

# Fix permissions if needed
chmod -R u+w "$PAI_DIR/scratchpad"
chmod -R u+w "$PAI_DIR/history"
```

---

### Issue 6: High API Costs

**Symptoms**: Unexpectedly high API usage, expensive research requests

**Causes**:
- Using Extensive Mode (24 agents) frequently
- High API pricing tiers
- Redundant research on same topics

**Fixes**:
```bash
# Use Quick Mode for simple queries
"Quick research: ..."  # Only 3 agents

# Reduce agent count in Standard Mode
const AGENT_DISTRIBUTION = {
  standard: { perplexity: 2, claude: 2, gemini: 1 }  # 5 total instead of 9
};

# Implement result caching (future enhancement)
# Check research history before launching new research

# Monitor API usage dashboards
# Set up billing alerts on API provider accounts
```

---

### Issue 7: Research Results Low Quality

**Symptoms**: Incomplete findings, low confidence scores, conflicting information

**Causes**:
- Query decomposition too broad
- Agents returning off-topic results
- Insufficient agent coverage
- Poor synthesis

**Fixes**:
```bash
# Use more specific research queries
# Instead of: "Research AI"
# Try: "Research transformer architecture in large language models"

# Increase agent count for better coverage
# Use Standard Mode (9 agents) instead of Quick (3 agents)

# Use Extensive Mode for deep-dive topics
"Do extensive research on [specific topic]"

# Review query decomposition in scratchpad
# Check query-decomposition.md to see how queries were split
# Adjust if queries are too broad or off-topic
```

---

### Issue 8: PAI_DIR Environment Variable Not Persisting

**Symptoms**: PAI_DIR works in current session but resets after restart

**Causes**:
- Environment variable not added to shell profile
- Wrong profile file edited
- Profile not being sourced on shell startup

**Fixes (macOS/Linux)**:
```bash
# Determine which shell you're using
echo $SHELL  # Shows /bin/bash or /bin/zsh

# For Bash: Edit ~/.bashrc or ~/.bash_profile
echo 'export PAI_DIR="$HOME/.claude"' >> ~/.bashrc

# For Zsh: Edit ~/.zshrc
echo 'export PAI_DIR="$HOME/.claude"' >> ~/.zshrc

# Reload profile
source ~/.bashrc  # or ~/.zshrc

# Verify persists after restart
# Close terminal, reopen, and check:
echo $PAI_DIR
```

**Fixes (Windows)**:
```powershell
# Set permanently via System Environment Variables
[System.Environment]::SetEnvironmentVariable("PAI_DIR", "$env:USERPROFILE\.claude", "User")

# Restart PowerShell and verify
echo $env:PAI_DIR

# Should persist across restarts
```

---

## Optional: Production Optimizations

### 1. Result Caching

**Implement basic caching to avoid redundant API calls:**

```bash
# Create cache directory
mkdir -p "$PAI_DIR/cache/research"

# Implement cache lookup before research
# (Requires custom scripting or future enhancement)
```

**Benefits**:
- Reduce API costs for repeated queries
- Faster results for common questions
- Lower rate limit pressure

---

### 2. Batch Research Script

**Create script to research multiple topics sequentially:**

```bash
cat > "$PAI_DIR/scripts/batch-research.sh" << 'EOF'
#!/bin/bash
# Batch research script
TOPICS_FILE="$1"

while IFS= read -r topic; do
  echo "Researching: $topic"
  claude "Research: $topic"
  sleep 10  # Delay between requests to avoid rate limits
done < "$TOPICS_FILE"
EOF

chmod +x "$PAI_DIR/scripts/batch-research.sh"

# Usage
echo "Quantum computing" > topics.txt
echo "Renewable energy" >> topics.txt
./batch-research.sh topics.txt
```

---

### 3. Automated History Cleanup

**Set up automatic scratchpad cleanup:**

```bash
# Already covered in Configuration Customization section
# See "Configuring Scratchpad Retention" above
```

---

### 4. API Rate Limit Monitoring

**Monitor API usage to stay within limits:**

```bash
# Create monitoring script (example)
cat > "$PAI_DIR/scripts/check-api-usage.sh" << 'EOF'
#!/bin/bash
# Check API usage across providers
# (Requires API-specific monitoring - varies by provider)

echo "Checking Anthropic API usage..."
# (Use Anthropic API or dashboard to check usage)

echo "Checking Perplexity API usage..."
# (Use Perplexity API or dashboard to check usage)

echo "Checking Gemini API usage..."
# (Use Google Cloud Console to check usage)
EOF

chmod +x "$PAI_DIR/scripts/check-api-usage.sh"
```

---

## Uninstallation

**To remove the Research Pack:**

```bash
# Remove research skill directory
rm -rf "$PAI_DIR/skills/research"

# Optionally remove research history
rm -rf "$PAI_DIR/history/research"

# Optionally remove scratchpad files
rm -rf "$PAI_DIR/scratchpad/*_research-*"

# Remove environment variables from shell profile
# Edit ~/.bashrc or ~/.zshrc and remove:
# export PERPLEXITY_API_KEY="..."
# export GEMINI_API_KEY="..."
# (Keep ANTHROPIC_API_KEY if using for other purposes)
```

---

## Next Steps

After successful installation:

1. **Run Verification Checklist**: Follow `PACK_VERIFY.md` to verify complete installation
2. **Test All Three Modes**: Try Quick, Standard, and Extensive research
3. **Review Research Reports**: Check scratchpad and history for output quality
4. **Optimize Configuration**: Adjust timeouts and agent distribution for your needs
5. **Monitor API Costs**: Track usage across all three providers
6. **Explore Use Cases**: Try different research scenarios (current events, technical, etc.)

---

**Installation Complete!**

For verification, proceed to: `PACK_VERIFY.md`
For usage instructions, see: `PACK_README.md` and `SKILL.md`
For workflow details, see: `workflows/conduct.md`

---

**Document Version**: 1.0
**Last Updated**: 2026-01-03
**Compatibility**: Claude Code 0.2.0+, Anthropic API, Perplexity API, Gemini API
