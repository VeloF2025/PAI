# Upgrade Pack - Installation Guide

**Version**: 2.0
**Estimated Time**: 10-15 minutes
**Difficulty**: Intermediate

---

## Pack v2.0 Source Files

This pack follows Dan Miesler's Pack v2.0 structure with real code files in \:

**Configuration** (\):
- \ - Source configuration and settings

**Tools** (\):
- \ - Main CLI tool for upgrade workflow
- \ - Anthropic blog scraper
- \ - GitHub releases scraper
- \ - Daniel Miessler's repo scraper
- \ - Anthropic documentation scraper
- \ - YouTube RSS feed scraper
- \ - Generic RSS feed scraper
- \ - Anthropic Cookbook scraper
- \ - Scraper exports

**Workflows** (\):
- \ - Source scanning workflow
- \ - Gap analysis workflow
- \ - Upgrade application workflow

These files are referenced in the installation steps below.

---

## Prerequisites

### Required

- [ ] **Bun runtime** installed (`bun --version`)
- [ ] **Git** installed (`git --version`)
- [ ] **PAI directory** exists at `~/.claude/`
- [ ] **Disk space**: Minimum 500 MB for backups

### Recommended

- [ ] **Clean git status** (no uncommitted changes in PAI)
- [ ] **Network connectivity** (for source scanning)
- [ ] **GitHub API token** (for Daniel's repo scanning - higher rate limits)

### Check Prerequisites

```bash
# Verify Bun
bun --version
# Should show: 1.0.0 or higher

# Verify Git
git --version
# Should show: 2.0.0 or higher

# Check disk space
df -h ~/.claude
# Should show: >500MB available

# Check PAI directory
ls ~/.claude/skills/
# Should list: CORE, upgrade, and other skills
```

---

## Installation Steps

### Step 1: Verify Pack Files Exist

```bash
# Check upgrade skill directory
ls ~/.claude/skills/upgrade/

# You should see:
# - SKILL.md (existing skill definition)
# - PACK_README.md (this pack's overview)
# - PACK_INSTALL.md (this file)
# - PACK_VERIFY.md (verification checklist)
# - config.json (configuration)
# - workflows/ (workflow documentation)
# - tools/ (CLI and scrapers)
```

**✅ Expected**: All pack files present
**❌ If missing**: Download upgrade pack from PAI repository

---

### Step 2: Review Configuration

```bash
# View current configuration
cat ~/.claude/skills/upgrade/config.json
```

**Default configuration** enables:
- ✅ Anthropic Blog (daily scans)
- ✅ Daniel's Repo (weekly scans)
- ✅ IndieDevDan YouTube (weekly scans)
- ✅ PortSwigger Research (monthly scans)
- ❌ Auto-approve (disabled by default - requires manual approval)

**To customize**, edit `config.json`:

```json
{
  "sources": {
    "anthropic-blog": {
      "enabled": true,
      "frequency": "daily",
      "url": "https://www.anthropic.com/news"
    },
    "daniel-repo": {
      "enabled": true,
      "frequency": "weekly",
      "url": "https://github.com/danielmiessler/personal-ai-infrastructure"
    }
  },
  "auto_approve": {
    "enabled": false,
    "max_risk": "low",
    "categories": ["documentation"]
  }
}
```

---

### Step 3: Create Required Directories

```bash
# Create upgrade history directories
mkdir -p ~/.claude/history/upgrades/{scans,analyses,deprecated}

# Verify creation
ls -la ~/.claude/history/upgrades/
```

**✅ Expected**: Three subdirectories created (scans, analyses, deprecated)

---

### Step 4: Install CLI Tool Dependencies (When Scrapers Implemented)

**Note**: Current version uses placeholder scrapers. When scrapers are implemented, install:

```bash
cd ~/.claude/skills/upgrade/tools/

# Install dependencies for web scraping
bun add cheerio jsdom @octokit/rest youtube-transcript rss-parser

# Verify installation
bun --version && ls node_modules/
```

**⚠️ Skip this step** if using current infrastructure-only version.

---

### Step 5: Test CLI Tool

```bash
# Navigate to tools directory
cd ~/.claude/skills/upgrade/tools/

# Test help command
bun run upgrade-cli.ts --help

# Test list-sources command
bun run upgrade-cli.ts --list-sources
```

**✅ Expected Output**:
```
Upgrade CLI - PAI Self-Improvement Engine

Commands:
  --help           Show this help
  --list-sources   List configured sources
  --scan-only      Scan sources without applying
  --apply          Apply approved improvements
  --full           Full upgrade cycle (scan → analyze → apply)
  --rollback       Rollback last upgrade
  --history        Show upgrade history
```

---

### Step 6: Configure GitHub API Token (Optional but Recommended)

**Why**: GitHub API rate limits (60 requests/hour without token, 5000/hour with token)

```bash
# Create GitHub personal access token
# 1. Go to: https://github.com/settings/tokens
# 2. Generate new token (classic)
# 3. Scopes: public_repo (read-only)
# 4. Copy token

# Add to environment
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc

# Verify
echo $GITHUB_TOKEN
```

**✅ Expected**: Token printed (should match what you set)

---

### Step 7: Initialize Metrics File

```bash
# Create initial metrics file
cat > ~/.claude/history/upgrades/metrics.json << 'EOF'
{
  "total_scans": 0,
  "total_upgrades": 0,
  "successful": 0,
  "rolled_back": 0,
  "sources_scanned": {},
  "improvements_found": 0,
  "improvements_applied": 0,
  "last_scan": null
}
EOF

# Verify creation
cat ~/.claude/history/upgrades/metrics.json
```

**✅ Expected**: JSON file with initialized counters at zero

---

### Step 8: Run Initial Scan (Dry Run)

```bash
cd ~/.claude/skills/upgrade/tools/

# Run scan-only (no changes applied)
bun run upgrade-cli.ts --scan-only --verbose

# Check scan results
ls ~/.claude/history/upgrades/scans/
```

**⚠️ Current Status**: Scan will use placeholder data until scrapers are implemented.

**✅ Expected**: Scan completes, results saved to `scans/` directory

---

### Step 9: Verify Skill Loading

```bash
# Check skill is recognized by Claude Code
# Start Claude Code and say:
# "upgrade PAI"

# Should trigger the upgrade skill
```

**✅ Expected**: Upgrade skill activates and shows workflow options

---

### Step 10: Create Backup Location

```bash
# Create initial backup directory structure
mkdir -p ~/.claude/history/upgrades/deprecated/initial-state/backup

# Backup current PAI state (for rollback if needed)
rsync -av --exclude='history' ~/.claude/skills/ ~/.claude/history/upgrades/deprecated/initial-state/backup/

# Verify backup
du -sh ~/.claude/history/upgrades/deprecated/initial-state/backup/
```

**✅ Expected**: Backup directory contains copy of current skills

---

## Configuration Customization

### Enable/Disable Sources

Edit `config.json`:

```json
{
  "sources": {
    "anthropic-blog": { "enabled": true },
    "ai-jason-youtube": { "enabled": false },  // Disabled by default
    "owasp": { "enabled": false }  // Disabled by default
  }
}
```

### Adjust Scan Frequency

```json
{
  "scan_schedule": {
    "anthropic": "daily",      // Options: hourly, daily, weekly, monthly
    "daniel_repo": "weekly",
    "ai_community": "weekly",
    "security": "monthly"
  }
}
```

### Configure Auto-Approve (Advanced)

```json
{
  "auto_approve": {
    "enabled": true,           // Enable auto-approval
    "max_risk": "low",         // Only auto-approve low-risk changes
    "categories": [            // Only auto-approve these categories
      "documentation",
      "minor_improvements"
    ]
  }
}
```

**⚠️ Warning**: Auto-approve bypasses manual review. Use cautiously.

---

## Troubleshooting

### Issue: "Bun command not found"

**Solution**:
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH
export PATH="$HOME/.bun/bin:$PATH"
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
```

### Issue: "upgrade-cli.ts not executable"

**Solution**:
```bash
chmod +x ~/.claude/skills/upgrade/tools/upgrade-cli.ts
```

### Issue: "Directory already exists" errors

**Solution**: Directories already created - safe to ignore

### Issue: "GitHub API rate limit exceeded"

**Solution**: Add GITHUB_TOKEN (see Step 6)

### Issue: "Scan timeout"

**Solution**: Increase timeout in config.json:
```json
{
  "network": {
    "timeout_ms": 30000  // Increase from 10000 to 30000
  }
}
```

### Issue: "Parse error on source X"

**Solution**: Source format may have changed. Disable temporarily:
```json
{
  "sources": {
    "problematic-source": { "enabled": false }
  }
}
```

---

## Post-Installation Verification

Once installation is complete, proceed to **PACK_VERIFY.md** to run the verification checklist.

---

## Uninstallation (If Needed)

```bash
# Disable all sources (prevents scanning)
sed -i 's/"enabled": true/"enabled": false/g' ~/.claude/skills/upgrade/config.json

# Remove upgrade history (optional)
rm -rf ~/.claude/history/upgrades/

# Remove CLI dependencies (if installed)
cd ~/.claude/skills/upgrade/tools/
rm -rf node_modules/
```

**Note**: Keep skill files even if disabling - they don't consume resources when inactive.

---

## Next Steps

1. ✅ Complete installation (all steps above)
2. ➡️ **Run verification checklist** (PACK_VERIFY.md)
3. ➡️ Run first scan: `bun run upgrade-cli.ts --scan-only`
4. ➡️ Review results and apply improvements

---

## Support

**Issues?** Check:
1. This troubleshooting section
2. `~/.claude/skills/upgrade/PACK_README.md` for architecture details
3. `~/.claude/skills/upgrade/workflows/` for detailed workflow guides

---

**Installation Guide Version**: 2.0
**Last Updated**: 2026-01-02
**Estimated Completion**: ✅ 10-15 minutes
