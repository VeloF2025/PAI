# Scan Sources Workflow

**Purpose:** Automatically scrape external sources for PAI improvements and new techniques.

---

## Triggers

- "scan sources"
- "check for updates"
- "scan Anthropic"
- "monitor Daniel repo"
- "check AI community"

---

## Prerequisites

- ✅ Internet connection active
- ✅ API keys configured in `${PAI_DIR}/.env` (if needed)
- ✅ Source list configured in `${PAI_DIR}/skills/upgrade/config.json`

---

## Steps

### 1. Load Source Configuration

**Action:**
```bash
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --list-sources
```

**Expected Output:**
```
Configured Sources:
  [x] anthropic-blog (daily)
  [x] claude-code-github (daily)
  [x] daniel-repo (weekly)
  [x] youtube-ai (weekly)
  [x] security-research (monthly)

Last Scanned:
  anthropic-blog: 2 hours ago
  daniel-repo: 3 days ago
```

---

### 2. Execute Scraping

**For All Sources:**
```bash
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --scan-only
```

**For Specific Source:**
```bash
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --scan --source anthropic
```

**What It Does:**

#### Tier 1: Anthropic Official

**Anthropic Blog:**
1. Fetch https://www.anthropic.com/news
2. Extract latest 10 articles
3. Parse for prompting techniques, Claude Code features
4. Save metadata (title, URL, date, summary)

**Claude Code GitHub:**
1. Fetch https://github.com/anthropics/claude-code/releases
2. Get latest 5 releases
3. Extract release notes, new features, breaking changes
4. Track version numbers

**Anthropic Docs:**
1. Check https://docs.anthropic.com/ for updates
2. Compare against cached version
3. Identify new sections, updated content

---

#### Tier 2: Daniel Miessler's PAI

**GitHub Repository:**
1. Fetch https://github.com/danielmiessler/Personal_AI_Infrastructure
2. Get commits since last scan
3. Check for:
   - New skills added
   - Updated workflows
   - Constitution changes
   - New CLI tools
4. Parse README for principle updates
5. Scan Packs/ and Bundles/ for new capabilities

**Extraction Pattern:**
```bash
# Get recent commits
curl https://api.github.com/repos/danielmiessler/Personal_AI_Infrastructure/commits?since=LAST_SCAN

# For each commit:
- Extract commit message
- Parse changed files
- Identify pattern (new skill, workflow update, etc.)
- Categorize by improvement type
```

---

#### Tier 3: AI Community

**YouTube Channels:**
1. IndieDevDan - https://www.youtube.com/@IndieDevDan
2. AI Jason - (find channel URL)
3. Simon Willison - (via blog)

**Scraping Method:**
```bash
# Use YouTube Data API or RSS feeds
# Extract:
- Video title
- Description
- Publish date
- Key techniques mentioned

# Filter for:
- "Claude Code", "AI agents", "prompting", "MCP"
```

**AI Blogs:**
1. LangChain blog - https://blog.langchain.dev/
2. Simon Willison - https://simonwillison.net/
3. Anthropic Cookbook - https://github.com/anthropics/anthropic-cookbook

**Pattern:**
- Fetch RSS/Atom feeds
- Parse latest 10 posts
- Extract techniques, code examples
- Categorize by topic (prompting, tools, architecture)

---

#### Tier 4: Security Research

**Trail of Bits:**
- https://blog.trailofbits.com/
- Filter for: AI security, testing automation, AIXCC

**PortSwigger:**
- https://portswigger.net/research
- Filter for: web testing, automation, AI usage

**OWASP:**
- Check for updates to testing guides
- New attack patterns
- Tool releases

---

### 3. Parse and Structure Findings

**For Each Finding:**

```json
{
  "id": "UUID",
  "source": "anthropic-blog",
  "type": "article",
  "date": "2025-01-01",
  "url": "https://...",
  "title": "Improved Skill Routing with use when",
  "summary": "Anthropic introduces 'use when' keyword...",
  "relevance": "high",
  "category": "prompting",
  "keywords": ["skills", "routing", "use when"],
  "code_examples": [
    {
      "language": "yaml",
      "code": "description: |\n  USE WHEN user says..."
    }
  ],
  "action_items": [
    "Add use when to all skills",
    "Update skill descriptions"
  ]
}
```

---

### 4. Filter and Rank Findings

**Relevance Scoring:**
```
HIGH (9-10):
  - Directly applicable to PAI
  - Solves current pain point
  - Recommended by Anthropic
  - Used by Daniel Miessler

MEDIUM (5-8):
  - Potentially useful
  - Requires adaptation
  - Experimental technique

LOW (1-4):
  - Tangentially related
  - Future consideration
  - Not immediately actionable
```

**Filtering Criteria:**
- ✅ Includes: PAI-specific, Claude Code, AI agents, automation
- ❌ Excludes: General AI news, unrelated tech, marketing content

---

### 5. Save Scan Results

**Output Location:**
```
${PAI_DIR}/history/upgrades/scans/YYYY-MM-DD-HHMMSS_scan-results.json
```

**File Format:**
```json
{
  "scan_id": "UUID",
  "scan_date": "2025-01-01T12:00:00Z",
  "sources_scanned": ["anthropic-blog", "daniel-repo", ...],
  "total_findings": 23,
  "by_relevance": {
    "high": 5,
    "medium": 12,
    "low": 6
  },
  "by_category": {
    "prompting": 8,
    "skills": 6,
    "tools": 4,
    "security": 3,
    "architecture": 2
  },
  "findings": [
    { ... finding object ... },
    { ... finding object ... }
  ]
}
```

---

### 6. Generate Scan Summary

**Output to User:**

```markdown
## 📊 Scan Complete

**Sources Scanned:** 5
**Total Findings:** 23
**High Priority:** 5
**Medium Priority:** 12
**Low Priority:** 6

### Top 5 High-Priority Findings:

1. **[Anthropic] Improved Skill Routing**
   - Date: 2025-01-01
   - Summary: New "use when" keyword for better routing
   - Action: Add to all 36 skills
   - Impact: HIGH - Better UX, reduced confusion

2. **[Daniel's Repo] Spotcheck Delegation Pattern**
   - Date: 2024-12-28
   - Summary: Use intern to verify parallel work
   - Action: Add to delegation-patterns.md
   - Impact: MEDIUM - New capability

3. **[Claude Code GitHub] v1.5.0 Release**
   - Date: 2024-12-30
   - Summary: New hook types, better MCP support
   - Action: Review release notes, update hooks
   - Impact: MEDIUM - Feature parity

4. **[AI Jason] Prompt Chaining Technique**
   - Date: 2024-12-29
   - Summary: Multi-step prompt optimization
   - Action: Evaluate for skill workflows
   - Impact: MEDIUM - Potential performance gain

5. **[Trail of Bits] AI Security Testing Framework**
   - Date: 2024-12-27
   - Summary: Automated LLM vulnerability scanning
   - Action: Integrate into pentester skill
   - Impact: HIGH - Enhanced security

---

**Next Steps:**
- Review findings: `${PAI_DIR}/history/upgrades/scans/latest.json`
- Analyze improvements: `bun run upgrade-cli --analyze`
- Apply upgrades: `bun run upgrade-cli --apply`
```

---

## Validation

**Scan successful when:**

✅ All configured sources accessed
✅ Findings parsed and structured
✅ Relevance scored correctly
✅ Results saved to history
✅ Summary generated
✅ No critical errors
✅ Scan ID logged for tracking

**If scan fails:**
- Check internet connection
- Verify source URLs still valid
- Check API keys (if needed)
- Review error logs
- Retry with `--verbose` flag

---

## Scheduling

**Recommended Frequency:**
- Daily: Anthropic official sources
- Weekly: Daniel's repo, AI community
- Monthly: Security research
- On-demand: User request

**Cron Setup:**
```bash
# Daily Anthropic scan (8 AM)
0 8 * * * bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --scan --source anthropic

# Weekly full scan (Sunday 9 AM)
0 9 * * 0 bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --scan-only

# Monthly security scan (1st of month, 10 AM)
0 10 1 * * bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --scan --source security
```

---

## Rollback

**Not applicable** - Scanning only reads data, makes no changes.

Safe to run frequently.

---

## Performance Notes

**Expected Duration:**
- Single source: 10-30 seconds
- All sources: 2-5 minutes
- With API rate limits: up to 10 minutes

**Resource Usage:**
- Network: Light (few MB per scan)
- CPU: Minimal
- Storage: ~1-5 MB per scan result

---

## Troubleshooting

**Issue:** "Source timeout"
**Fix:** Increase timeout in config, check network

**Issue:** "No new findings"
**Fix:** Normal if sources haven't updated

**Issue:** "Parse error on source X"
**Fix:** Source may have changed format, update scraper

**Issue:** "API rate limit"
**Fix:** Wait and retry, or use API key if available

---

**END OF WORKFLOW**
