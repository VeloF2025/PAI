# Upgrade Skill - Quick Start Guide

**Version:** 1.0 (2026-01-02)
**Status:** ✅ Core Infrastructure Complete + First Scraper Operational

---

## 🚀 Quick Commands

```bash
# Navigate to tools directory
cd ~/.claude/skills/upgrade/tools

# List configured sources
bun run upgrade-cli.ts --list-sources

# Scan all enabled sources
bun run upgrade-cli.ts --scan-only

# Scan specific source
bun run upgrade-cli.ts --scan-only --source anthropic-blog

# Scan with detailed output
bun run upgrade-cli.ts --scan-only --source anthropic-blog --verbose

# View help
bun run upgrade-cli.ts --help
```

---

## 📋 Available Commands

| Command | Description | Status |
|---------|-------------|--------|
| `--list-sources` | List all configured sources | ✅ Working |
| `--scan-only` | Scan for new findings | ✅ Working (mock data) |
| `--scan-only --source <id>` | Scan specific source | ✅ Working |
| `--apply` | Apply approved improvements | ⏳ Pending |
| `--rollback` | Rollback last upgrade | ⏳ Pending |
| `--history` | Show upgrade history | ⏳ Pending |
| `--full` | Full cycle (scan → analyze → apply) | ⏳ Pending |
| `--help` | Show help message | ✅ Working |

---

## 🌐 Configured Sources (12 Total)

### Tier 1: Official Anthropic (Daily)
- ✅ `anthropic-blog` - Anthropic Engineering Blog (WORKING with mock data)
- ✅ `claude-code-github` - Claude Code GitHub Releases (PRODUCTION READY)
- ⏳ `anthropic-docs` - Anthropic Documentation (pending)

### Tier 2: Daniel Miessler's PAI (Weekly)
- ⏳ `daniel-repo` - Daniel's GitHub Repository (pending)

### Tier 3: AI Community (Weekly)
- ⏳ `indiedevdan-youtube` - IndieDevDan YouTube (pending)
- ⏳ 8 more sources (disabled by default)

### Tier 4: Security Research (Monthly)
- ⏳ `trailofbits-blog` - Trail of Bits Blog (pending)
- ⏳ 2 more sources (disabled by default)

---

## 📁 Output Locations

All scan results saved to:
```
~/.claude/history/upgrades/scans/
  └── YYYYMMDD-HHMMSS_scan-results.json
```

---

## 🧪 Testing the Anthropic Blog Scraper

```bash
# Test with verbose output
cd ~/.claude/skills/upgrade/tools
bun run upgrade-cli.ts --scan-only --source anthropic-blog --verbose
```

**Expected Output:**
```
ℹ️ 🔍 Scanning external sources for PAI improvements...
  Scanning 1 sources...
  Scanning: Anthropic Engineering Blog...
    Fetching from: https://www.anthropic.com/news
    🌐 Fetching HTML from https://www.anthropic.com/news...
    ✅ Fetched 125847 bytes
    📝 Processing 2 articles (MOCK DATA)
    ✅ Found 2 articles from Anthropic blog
       High: 2, Medium: 0, Low: 0
    Found 2 items
ℹ️ ✅ Scan complete! Found 2 items
ℹ️    High: 2, Medium: 0, Low: 0
ℹ️    Saved to: ~/.claude/history/upgrades/scans/20260102-HHMMSS_scan-results.json
```

---

## 🧪 Testing the GitHub Releases Scraper

```bash
# Test with verbose output
cd ~/.claude/skills/upgrade/tools
bun run upgrade-cli.ts --scan-only --source claude-code-github --verbose
```

**Expected Output:**
```
ℹ️ 🔍 Scanning external sources for PAI improvements...
  Scanning 1 sources...
  Scanning: Claude Code GitHub Releases...
    Fetching from: https://github.com/anthropics/claude-code/releases
    📦 Fetching releases using gh CLI...
    ✅ Found 2 releases from anthropics/claude-code
       High: 1, Medium: 1, Low: 0
    Found 2 items
ℹ️ ✅ Scan complete! Found 2 items
ℹ️    High: 1, Medium: 1, Low: 0
ℹ️    Saved to: ~/.claude/history/upgrades/scans/20260102-HHMMSS_scan-results.json
```

**Real Data Features:**
- ✅ Fetches actual GitHub releases using gh CLI
- ✅ Extracts features from release notes ("- Added", "- Fixed")
- ✅ Scores relevance (HIGH for LSP/skills/agents)
- ✅ Generates context-aware action items
- ✅ Includes metadata (version, isLatest, featureCount)

---

## 📊 Scan Result Structure

```json
{
  "scan_id": "1a2b3c4d5e6f7g8h",
  "scan_date": "2026-01-02T05:02:48.123Z",
  "sources_scanned": ["anthropic-blog"],
  "total_findings": 2,
  "by_relevance": {
    "high": 2,
    "medium": 0,
    "low": 0
  },
  "by_category": {
    "skills": 2
  },
  "findings": [
    {
      "id": "abc123def456",
      "source": "anthropic-blog",
      "type": "article",
      "date": "2026-01-02",
      "url": "https://...",
      "title": "Article Title",
      "summary": "Brief summary",
      "relevance": "high",
      "category": "skills",
      "keywords": ["Claude Code", "skills"],
      "action_items": [
        "Evaluate new skill pattern",
        "Check if applicable to existing skills"
      ]
    }
  ]
}
```

---

## 🔍 Relevance Scoring

### HIGH Relevance Keywords
Articles containing any of these get HIGH score:
- claude code
- skills
- agents
- mcp (model context protocol)
- tool use
- prompt engineering
- use when

### MEDIUM Relevance Keywords
- claude
- prompting
- api
- integration
- development
- features
- best practices

### LOW Relevance
Everything else

---

## 📂 Categories

Findings are automatically categorized as:
- **prompting** - Prompt engineering techniques
- **skills** - Skill patterns and improvements
- **architecture** - System design and patterns
- **tools** - Tool usage and APIs
- **security** - Security best practices
- **general** - Everything else

---

## ⚠️ Current Limitations

1. **Mock Data** - Anthropic blog scraper uses mock articles
   - Fetches real HTML but doesn't parse it
   - Need to add cheerio/jsdom for production

2. **Other Sources** - Only anthropic-blog implemented
   - GitHub, YouTube, RSS scrapers pending
   - Router pattern ready for expansion

3. **Analysis Phase** - Gap analysis not implemented
   - Can scan and save findings
   - Can't yet analyze or suggest improvements

4. **Apply Phase** - Upgrade application not implemented
   - No file modification yet
   - No backup/rollback execution

---

## 🎯 Next Steps

### To Make Production-Ready

1. **Add HTML Parsing**
   ```bash
   cd ~/.claude/skills/upgrade/tools
   bun add cheerio
   ```
   Update `scrapeAnthropicBlog()` to parse real articles

2. **Implement GitHub Scraper**
   ```bash
   bun add @octokit/rest
   ```
   Create `scrapers/github-releases.ts`

3. **Test with Real Data**
   Verify relevance scoring works with actual articles

---

## 📚 Documentation

- **SKILL.md** - Main skill definition and routing
- **README.md** - Full documentation
- **QUICK_START.md** - This guide
- **ANTHROPIC_BLOG_SCRAPER_INTEGRATION.md** - Scraper integration details
- **SESSION_SUMMARY_2026-01-02.md** - Implementation session notes
- **UPGRADE_SKILL_IMPLEMENTATION.md** - Complete implementation summary

---

## 🆘 Troubleshooting

### "No scan results found"
**Fix:** Run `--scan-only` first before analysis or application

### "Source not found"
**Fix:** Check source ID with `--list-sources`

### "Scraper not yet implemented"
**Expected:** Only anthropic-blog is implemented
**Fix:** Implement additional scrapers as needed

### "Using mock data"
**Expected:** Production HTML parsing not yet added
**Fix:** Add cheerio and implement actual parsing

---

## 💡 Pro Tips

1. **Use --verbose** for detailed logging
2. **Filter by source** to test specific scrapers
3. **Check scan results** in history/upgrades/scans/
4. **Read the docs** in workflows/ for detailed specs

---

**Quick Reference Card** v1.0
*Last Updated: 2026-01-02*
