# Fabric Pack - Installation Guide

**Version**: 2.0
**Estimated Time**: 10-15 minutes
**Difficulty**: Beginner to Intermediate

---

## Prerequisites

### Required

- [ ] **Python 3.8+** installed (`python --version` or `python3 --version`)
- [ ] **pip** (Python package manager)
- [ ] **Git** (`git --version`)
- [ ] **LLM API Key** (OpenAI, Anthropic, or other supported provider)
- [ ] **Internet connection** (for pattern repository clone)

### Recommended

- [ ] **Homebrew** (macOS) or **package manager** (Linux) for easier installation
- [ ] **curl** or **wget** for URL content fetching
- [ ] **yt-dlp** for YouTube video processing (optional)
- [ ] **jq** for JSON processing (optional)

### Check Prerequisites

```bash
# Verify Python
python --version
# Should show: Python 3.8.0 or higher

# Alternative: python3
python3 --version

# Verify pip
pip --version
# or
pip3 --version

# Verify Git
git --version
# Should show: git version 2.0.0 or higher

# Check internet connection
ping -c 3 github.com
```

---

## Installation Steps

### Step 1: Install Fabric CLI

**Option A: Using pip (Recommended)**

```bash
# Install Fabric globally
pip install fabric-ai

# Verify installation
fabric --version
```

**Option B: Using Homebrew (macOS)**

```bash
# Install via Homebrew
brew install fabric

# Verify installation
fabric --version
```

**Option C: From Source (Advanced)**

```bash
# Clone Fabric repository
git clone https://github.com/danielmiessler/fabric.git
cd fabric

# Install dependencies
pip install -r requirements.txt

# Install Fabric
pip install .

# Verify installation
fabric --version
```

**✅ Expected Output**: `fabric version X.X.X` or similar version info

**❌ If errors**: See troubleshooting section below

---

### Step 2: Configure API Keys

**Why**: Fabric uses LLM APIs to execute patterns. You need an API key from your chosen provider.

**Supported Providers**:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Local models (Ollama, LM Studio)

**Set API Key**:

```bash
# For OpenAI (most common)
export OPENAI_API_KEY="sk-..."

# Add to shell profile for persistence
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.bashrc  # Linux/WSL
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.zshrc   # macOS
source ~/.bashrc  # or ~/.zshrc

# For Windows PowerShell
$env:OPENAI_API_KEY = "sk-..."
# Add to PowerShell profile for persistence
echo '$env:OPENAI_API_KEY = "sk-..."' >> $PROFILE

# Verify
echo $OPENAI_API_KEY  # Linux/Mac
echo $env:OPENAI_API_KEY  # Windows
```

**Alternative: Use Fabric's Setup**

```bash
# Interactive setup (configures API keys + model selection)
fabric --setup

# Follow prompts to:
# 1. Select LLM provider
# 2. Enter API key
# 3. Choose default model
# 4. Set patterns directory
```

**✅ Expected**: API key stored securely in Fabric config

---

### Step 3: Clone Fabric Pattern Repository

**Purpose**: This skill includes the Fabric repository locally for offline pattern reference.

```bash
# Navigate to fabric skill directory
cd ~/.claude/skills/fabric/

# Check if fabric-repo already exists
if [ -d "fabric-repo" ]; then
  echo "Fabric repository already exists. Updating..."
  cd fabric-repo
  git pull origin main
else
  echo "Cloning Fabric repository..."
  git clone https://github.com/danielmiessler/fabric.git fabric-repo
fi

# Verify patterns directory
ls fabric-repo/data/patterns/ | head -10
```

**Windows PowerShell**:
```powershell
# Navigate to fabric skill directory
cd "$env:USERPROFILE\.claude\skills\fabric\"

# Check if fabric-repo exists
if (Test-Path "fabric-repo") {
  Write-Host "Fabric repository already exists. Updating..."
  cd fabric-repo
  git pull origin main
} else {
  Write-Host "Cloning Fabric repository..."
  git clone https://github.com/danielmiessler/fabric.git fabric-repo
}

# Verify patterns directory
Get-ChildItem fabric-repo\data\patterns\ | Select-Object -First 10
```

**✅ Expected**:
- `fabric-repo/` directory created
- `fabric-repo/data/patterns/` contains 242+ pattern directories
- Each pattern directory has `system.md` and `user.md` files

**❌ If clone fails**: Check internet connection, verify Git installed

---

### Step 4: Verify Fabric CLI Functionality

**Test basic command**:

```bash
# Test fabric CLI
fabric --help

# Expected output:
# Fabric CLI usage information
# Available commands and options
```

**Test pattern listing**:

```bash
# List all available patterns
fabric --list

# OR
fabric -l

# Expected output:
# List of 242+ pattern names
```

**Test simple pattern execution**:

```bash
# Test with simple pattern (no API call)
echo "Hello World" | fabric --list

# Test with actual pattern (makes API call - uses your API key)
echo "The quick brown fox jumps over the lazy dog." | fabric -p extract_main_idea

# Expected output:
# [Pattern execution result]
# Main idea: A quick fox jumps over a lazy dog
```

**✅ Expected**: Pattern executes successfully, returns formatted output

**❌ If API errors**: Verify API key is set correctly, check API quota/billing

---

### Step 5: Test Pattern Selection Skill

**In Claude Code session**, test the fabric skill:

```bash
# Start Claude Code
claude-code

# Test pattern selection
> "Create a threat model for a REST API with user authentication"

# Expected behavior:
# 1. Fabric skill activates
# 2. Recognizes "threat model" intent
# 3. Selects create_threat_model pattern
# 4. Executes: fabric "REST API with user auth..." -p create_threat_model
# 5. Returns threat model output
```

**✅ Expected**: Skill recognizes request, selects pattern, executes successfully

---

### Step 6: Install Optional Dependencies

**For YouTube Video Processing**:

```bash
# Install yt-dlp
pip install yt-dlp

# Verify
yt-dlp --version
```

**For Media Processing**:

```bash
# Install ffmpeg (macOS)
brew install ffmpeg

# Install ffmpeg (Linux - Ubuntu/Debian)
sudo apt-get install ffmpeg

# Install ffmpeg (Windows - via Chocolatey)
choco install ffmpeg

# Verify
ffmpeg -version
```

**For JSON Processing**:

```bash
# Install jq (macOS)
brew install jq

# Install jq (Linux - Ubuntu/Debian)
sudo apt-get install jq

# Install jq (Windows - via Chocolatey)
choco install jq

# Verify
jq --version
```

**✅ These are optional** - Fabric works without them, but they enable:
- yt-dlp: YouTube video transcription
- ffmpeg: Media file processing
- jq: Advanced JSON filtering in workflows

---

### Step 7: Configure Default Model (Optional)

**Set preferred model**:

```bash
# Via environment variable
export FABRIC_DEFAULT_MODEL="gpt-4-turbo"

# Or via Fabric config
fabric --setup
# Select model when prompted
```

**Model Options**:
- `gpt-4` - Highest quality (slower, more expensive)
- `gpt-4-turbo` - Balanced (recommended)
- `gpt-3.5-turbo` - Fastest (cheaper, lower quality)
- `claude-3-opus` - Anthropic Claude (if API key configured)
- `claude-3-sonnet` - Anthropic Claude (balanced)

**Cost Optimization**:
- Use `gpt-3.5-turbo` for simple patterns (summarization, extraction)
- Use `gpt-4` for complex patterns (threat modeling, PRD creation)
- Use `gpt-4-turbo` as balanced default

---

### Step 8: Update Patterns (Periodic Maintenance)

**Purpose**: Fabric patterns are updated regularly with new patterns and improvements.

```bash
# Update global Fabric installation
pip install --upgrade fabric-ai

# Update local pattern repository
cd ~/.claude/skills/fabric/fabric-repo/
git pull origin main

# Verify new patterns available
fabric --list | wc -l
# Should show total pattern count (242+ as of 2026-01-03)
```

**Recommended Schedule**:
- Global Fabric: Monthly (`pip install --upgrade fabric-ai`)
- Pattern repo: Weekly (`git pull` in fabric-repo/)

---

## Configuration Customization

### Change Patterns Directory

**If you want to use custom patterns location**:

```bash
# Set patterns directory
export FABRIC_PATTERNS_DIR="/path/to/custom/patterns"

# Or use Fabric's config
fabric --setup
# Enter custom patterns path when prompted
```

---

### Add Custom Patterns

**Create custom pattern**:

```bash
# Navigate to patterns directory
cd ~/.claude/skills/fabric/fabric-repo/data/patterns/

# Create new pattern directory
mkdir my_custom_pattern
cd my_custom_pattern

# Create system.md (system prompt)
cat > system.md << 'EOF'
# IDENTITY
You are an expert at [your specialty].

# GOAL
Your goal is to [what pattern does].

# STEPS
1. [Step 1]
2. [Step 2]

# OUTPUT INSTRUCTIONS
- Output in markdown format
- Use bullet points
- Be concise
EOF

# Create user.md (user prompt template)
cat > user.md << 'EOF'
# INPUT
$input

# INSTRUCTION
[What to do with input]
EOF

# Test custom pattern
echo "Test input" | fabric -p my_custom_pattern
```

**✅ Custom patterns now usable** via `fabric -p my_custom_pattern`

---

### Configure Multiple API Keys

**For different providers**:

```bash
# OpenAI
export OPENAI_API_KEY="sk-..."

# Anthropic
export ANTHROPIC_API_KEY="sk-ant-..."

# Google
export GOOGLE_API_KEY="AIza..."

# Select provider per pattern execution
fabric -p pattern_name --model claude-3-opus  # Uses Anthropic key
fabric -p pattern_name --model gpt-4          # Uses OpenAI key
```

---

## Troubleshooting

### Issue: "fabric: command not found"

**Symptoms**: Terminal doesn't recognize `fabric` command

**Solution**:

```bash
# Check if installed
pip list | grep fabric

# If not installed
pip install fabric-ai

# If installed but not in PATH
which fabric
# Shows installation path

# Add to PATH (Linux/Mac)
export PATH="$PATH:/path/to/fabric"
echo 'export PATH="$PATH:/path/to/fabric"' >> ~/.bashrc
source ~/.bashrc

# Windows: Add Python Scripts directory to PATH
# Control Panel → System → Advanced → Environment Variables
# Add: C:\Python3X\Scripts to PATH
```

---

### Issue: "API key not found" or "Authentication error"

**Symptoms**: Fabric executes but fails with authentication error

**Diagnosis**:

```bash
# Check if API key is set
echo $OPENAI_API_KEY  # Should show: sk-...

# If empty, set it
export OPENAI_API_KEY="your-key-here"

# Verify key is valid
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Should return JSON list of models, not error
```

**Solution**:

1. Verify API key is correct (copy-paste carefully)
2. Check API key has billing enabled (OpenAI requires payment method)
3. Ensure API key has necessary permissions
4. Try regenerating API key from provider dashboard

---

### Issue: "Pattern not found"

**Symptoms**: `fabric -p pattern_name` returns "pattern not found" error

**Diagnosis**:

```bash
# List all available patterns
fabric --list

# Search for pattern name
fabric --list | grep -i "pattern_name"

# Check patterns directory
ls ~/.config/fabric/patterns/
```

**Solution**:

1. Verify pattern name is correct (case-sensitive)
2. Update patterns: `fabric --update`
3. Check patterns directory exists
4. Re-run `fabric --setup` to configure patterns path

---

### Issue: "Rate limit exceeded"

**Symptoms**: API calls fail with rate limit error

**Solution**:

```bash
# Wait for rate limit to reset (usually 1 minute for OpenAI)

# Use different API key (if available)
export OPENAI_API_KEY="sk-alternate-key"

# Upgrade API tier (OpenAI offers higher rate limits for paid tiers)

# Use local model instead (no rate limits)
# Install Ollama: https://ollama.ai
ollama pull llama2
fabric -p pattern_name --model ollama/llama2
```

---

### Issue: "YouTube download failed"

**Symptoms**: YouTube patterns fail to process videos

**Solution**:

```bash
# Install yt-dlp
pip install yt-dlp

# Update yt-dlp (YouTube frequently changes, needs updates)
pip install --upgrade yt-dlp

# Test yt-dlp directly
yt-dlp --get-title "https://youtube.com/watch?v=..."

# If still failing, video may be:
# - Private/restricted
# - Geo-blocked
# - Removed

# Alternative: Download transcript manually, pipe to Fabric
# Use YouTube's "Show transcript" feature → copy text
echo "Transcript text here..." | fabric -p youtube_summary
```

---

### Issue: "Fabric repo clone failed"

**Symptoms**: `git clone` fails when setting up fabric-repo

**Solution**:

```bash
# Check internet connection
ping github.com

# Check Git installation
git --version

# Try HTTPS clone (instead of SSH)
git clone https://github.com/danielmiessler/fabric.git fabric-repo

# If still fails, download ZIP instead
curl -L https://github.com/danielmiessler/fabric/archive/refs/heads/main.zip -o fabric.zip
unzip fabric.zip
mv fabric-main fabric-repo
rm fabric.zip
```

---

### Issue: "Permission denied" on pattern execution

**Symptoms**: Fabric CLI installed but can't execute patterns

**Solution**:

```bash
# Fix permissions on Fabric installation
chmod +x $(which fabric)

# Fix permissions on patterns directory
chmod -R 755 ~/.config/fabric/patterns/

# On Linux, if installed globally
sudo pip install fabric-ai
```

---

## Post-Installation Verification

Once installation is complete, proceed to **PACK_VERIFY.md** to run the comprehensive verification checklist.

**Quick Verification Commands**:

```bash
# 1. Fabric CLI installed?
fabric --version

# 2. API key configured?
echo $OPENAI_API_KEY | head -c 10  # Should show "sk-..." prefix

# 3. Patterns available?
fabric --list | wc -l  # Should show 200+ patterns

# 4. Pattern execution works?
echo "Test" | fabric -p extract_main_idea

# 5. Pattern repo cloned?
ls ~/.claude/skills/fabric/fabric-repo/data/patterns/ | wc -l
```

**✅ All checks passing?** → Proceed to PACK_VERIFY.md

**❌ Issues?** → Review troubleshooting section above

---

## Optional: Production Optimizations

### Use Local LLM (Privacy + No API Costs)

**Install Ollama**:

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows: Download from https://ollama.ai

# Pull model
ollama pull llama2
# or
ollama pull mistral

# Use with Fabric
fabric -p pattern_name --model ollama/llama2
```

**Benefits**:
- No API costs
- No rate limits
- Full privacy (data stays local)
- Works offline

**Tradeoffs**:
- Lower quality than GPT-4
- Slower execution (depends on hardware)
- Requires local resources (GPU recommended)

---

### Batch Processing Setup

**Process multiple files**:

```bash
# Create batch processing script
cat > batch-fabric.sh << 'EOF'
#!/bin/bash
PATTERN=$1
FILES_DIR=$2

for file in "$FILES_DIR"/*; do
  echo "Processing: $file"
  cat "$file" | fabric -p "$PATTERN" > "${file}.output.md"
done
EOF

chmod +x batch-fabric.sh

# Usage
./batch-fabric.sh summarize /path/to/articles/
```

---

### Cache Pattern Results

**Avoid re-processing identical inputs**:

```bash
# Simple caching wrapper
cat > fabric-cached.sh << 'EOF'
#!/bin/bash
CACHE_DIR="$HOME/.fabric-cache"
mkdir -p "$CACHE_DIR"

PATTERN=$1
shift
INPUT="$@"

# Generate cache key (hash of pattern + input)
CACHE_KEY=$(echo "$PATTERN$INPUT" | sha256sum | cut -d' ' -f1)
CACHE_FILE="$CACHE_DIR/$CACHE_KEY"

# Check cache
if [ -f "$CACHE_FILE" ]; then
  echo "[Using cached result]" >&2
  cat "$CACHE_FILE"
else
  # Execute and cache
  echo "$INPUT" | fabric -p "$PATTERN" | tee "$CACHE_FILE"
fi
EOF

chmod +x fabric-cached.sh

# Usage (identical to fabric, but caches results)
./fabric-cached.sh summarize "Article text here..."
```

---

## Uninstallation (If Needed)

```bash
# Remove Fabric CLI
pip uninstall fabric-ai

# Remove pattern repository
rm -rf ~/.claude/skills/fabric/fabric-repo/

# Remove Fabric config
rm -rf ~/.config/fabric/

# Remove cached data (if using cache script)
rm -rf ~/.fabric-cache/

# Remove environment variables (edit shell profile)
# Remove OPENAI_API_KEY, FABRIC_DEFAULT_MODEL, etc. from ~/.bashrc or ~/.zshrc
```

**Note**: Uninstalling Fabric doesn't remove the skill files in `~/.claude/skills/fabric/`, which are small and harmless when Fabric CLI is not installed.

---

## Next Steps

1. ✅ Complete installation (all steps above)
2. ➡️ **Run verification checklist** (PACK_VERIFY.md)
3. ➡️ Test basic patterns (summarize, extract_wisdom)
4. ➡️ Explore advanced patterns (threat modeling, PRD creation)
5. ➡️ Create custom patterns for your use cases

---

## Support

**Issues?** Check:
1. This troubleshooting section
2. `~/.claude/skills/fabric/PACK_README.md` for architecture details
3. Fabric documentation: https://github.com/danielmiessler/fabric
4. Fabric Discord community: https://discord.gg/fabric

**Common Pitfalls**:
- API key not set → Pattern execution fails
- yt-dlp not installed → YouTube patterns fail
- Outdated patterns → Update fabric-repo with `git pull`
- Wrong Python version → Fabric requires Python 3.8+

---

**Installation Guide Version**: 2.0
**Last Updated**: 2026-01-03
**Estimated Completion**: ✅ 10-15 minutes
