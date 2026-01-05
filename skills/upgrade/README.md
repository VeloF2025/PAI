# Upgrade Skill - PAI Self-Improvement Engine

The upgrade skill automatically monitors external sources for PAI improvements and applies them systematically.

## 🎯 What It Does

- **Scans** external sources (Anthropic, Daniel's repo, AI community, security research)
- **Analyzes** findings to identify gaps in current PAI implementation
- **Suggests** improvements with impact/risk/effort scoring
- **Applies** approved upgrades with full backup/rollback capability

## 🚀 Quick Start

```bash
# List configured sources
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --list-sources

# Scan for new improvements
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --scan-only

# Run full upgrade cycle (scan → analyze → apply)
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --full
```

## 📋 File Structure

```
skills/upgrade/
├── SKILL.md                    # Main skill definition with routing
├── README.md                   # This file
├── config.json                 # Source configuration
├── workflows/                  # Detailed workflow documentation
│   ├── scan-sources.md        # How to scrape external sources
│   ├── analyze-improvements.md # Gap analysis and suggestion generation
│   └── apply-upgrades.md      # Applying changes with safety protocols
└── tools/
    └── upgrade-cli.ts          # Main CLI tool
```

## 🌐 Monitored Sources

### Tier 1: Official Anthropic
- Anthropic Engineering Blog
- Claude Code GitHub Releases
- Anthropic Documentation

### Tier 2: Daniel Miessler's PAI
- GitHub Repository commits & changes

### Tier 3: AI Community
- IndieDevDan YouTube
- AI Jason YouTube (disabled by default)
- Simon Willison's Blog
- LangChain Blog
- Anthropic Cookbook

### Tier 4: Security Research
- Trail of Bits Blog
- PortSwigger Research
- OWASP Updates (disabled by default)

## 🔄 Workflows

### 1. Scan Sources
Scrapes configured sources for new content, filters by relevance, saves findings.

**Trigger:** `upgrade PAI --scan-only`

**Output:** `${PAI_DIR}/history/upgrades/scans/YYYY-MM-DD-HHMMSS_scan-results.json`

**Details:** See `workflows/scan-sources.md`

### 2. Analyze Improvements
Compares findings against current PAI state, identifies gaps, generates suggestions.

**Trigger:** Runs automatically after scan, or manually after reviewing scan results

**Output:** `${PAI_DIR}/history/upgrades/analyses/YYYY-MM-DD-HHMMSS_analysis.json`

**Details:** See `workflows/analyze-improvements.md`

### 3. Apply Upgrades
Applies approved improvements with backup, atomic transactions, and verification.

**Trigger:** `upgrade PAI --apply` (after user approval)

**Output:**
- Modified files in `${PAI_DIR}/skills/`
- Backup in `${PAI_DIR}/history/upgrades/deprecated/YYYY-MM-DD_upgrade-name/`
- Report in `${PAI_DIR}/history/upgrades/YYYY-MM-DD_upgrade-name.md`

**Details:** See `workflows/apply-upgrades.md`

## 🛠️ CLI Commands

```bash
# Help
bun run upgrade-cli.ts --help

# List sources
bun run upgrade-cli.ts --list-sources

# Scan specific source
bun run upgrade-cli.ts --scan-only --source anthropic-blog

# Scan all sources
bun run upgrade-cli.ts --scan-only

# Apply improvements
bun run upgrade-cli.ts --apply

# Full cycle
bun run upgrade-cli.ts --full

# Rollback last upgrade
bun run upgrade-cli.ts --rollback

# Show upgrade history
bun run upgrade-cli.ts --history

# Dry run (show what would change)
bun run upgrade-cli.ts --apply --dry-run

# Verbose output
bun run upgrade-cli.ts --scan-only --verbose
```

## 🔒 Safety Protocols

### Mandatory Backups
Every upgrade creates full backup in `history/upgrades/deprecated/` with:
- Original files
- Checksum manifest
- Automated rollback script
- README explaining changes

### Atomic Transactions
All-or-nothing upgrade application:
- If ANY file fails → ROLLBACK entire upgrade
- No partial upgrades allowed
- System stays consistent

### User Approval Required
Default: All upgrades need explicit approval
Exception: `--auto-approve` flag (only for trusted, minor updates)

### Post-Upgrade Verification
Mandatory checks before commit:
- File syntax validation
- Skill loading test
- Broken link detection
- TypeScript compilation (if applicable)

### Rollback Capability
Every upgrade includes tested rollback script:
```bash
${PAI_DIR}/history/upgrades/deprecated/YYYY-MM-DD_upgrade-name/rollback.sh
```

## 📊 Output Locations

```
${PAI_DIR}/history/upgrades/
├── scans/                          # Scan results
│   └── YYYY-MM-DD-HHMMSS_scan-results.json
├── analyses/                       # Analysis results
│   └── YYYY-MM-DD-HHMMSS_analysis.json
├── deprecated/                     # Backups
│   └── YYYY-MM-DD_upgrade-name/
│       ├── backup/                 # Original files
│       ├── manifest.txt            # Checksums
│       ├── rollback.sh             # Rollback script
│       └── README.md               # What changed
├── YYYY-MM-DD_upgrade-name.md      # Upgrade reports
└── metrics.json                    # Upgrade statistics
```

## ⚙️ Configuration

Edit `config.json` to customize:
- Enable/disable specific sources
- Adjust scan frequency
- Set auto-approve criteria
- Configure backup retention
- Enable voice notifications

Example:
```json
{
  "sources": [...],
  "scan_schedule": {
    "anthropic": "daily",
    "daniel_repo": "weekly",
    "ai_community": "weekly",
    "security": "monthly"
  },
  "auto_approve": {
    "enabled": false,
    "max_risk": "low",
    "categories": ["documentation", "minor_improvements"]
  }
}
```

## 🎯 Example Upgrade Scenarios

### Scenario: Anthropic Releases "use when" Pattern

1. **Scan** detects new article on Anthropic blog
2. **Analyze** identifies 24 skills missing "use when" triggers
3. **Suggest** adding triggers with HIGH impact, LOW risk
4. **User approves**
5. **Backup** created for all 24 SKILL.md files
6. **Apply** updates atomically
7. **Verify** all skills still load correctly
8. **Report** generated with before/after examples

### Scenario: Daniel Adds New Delegation Pattern

1. **Scan** detects new commit in Daniel's repo
2. **Analyze** identifies new "spotcheck" delegation pattern
3. **Suggest** adding to delegation-patterns.md (MEDIUM impact, LOW risk)
4. **Auto-approve** (documentation only)
5. **Backup** created
6. **Apply** adds new section to documentation
7. **Verify** no broken links
8. **Commit** with proper git message

## 📈 Metrics & Reporting

Track upgrade effectiveness:
```json
{
  "total_upgrades": 42,
  "successful": 40,
  "rolled_back": 2,
  "sources_scanned": 156,
  "improvements_found": 89,
  "improvements_applied": 40,
  "last_scan": "2025-01-01T12:00:00Z"
}
```

## 🚨 Troubleshooting

### "No scan results found"
**Fix:** Run `--scan-only` first before analysis or application

### "Upgrade verification failed"
**Fix:** Review error messages, may need manual fix. Upgrade auto-rolled back.

### "Source timeout"
**Fix:** Increase timeout in config.json, check network connection

### "Parse error on source X"
**Fix:** Source may have changed format. Update scraper for that source.

## 🔗 Related Skills

- **CORE** - System identity and constitution (may be updated)
- **research** - Used for scanning sources
- **agent-observability** - Monitor upgrade execution

## 📚 Documentation

- **SKILL.md** - Main skill definition with routing
- **workflows/scan-sources.md** - Detailed scraping instructions
- **workflows/analyze-improvements.md** - Gap analysis process
- **workflows/apply-upgrades.md** - Upgrade application protocol

---

## 🎓 Implementation Status

**Current Status:** ✅ Core infrastructure complete

**Implemented:**
- ✅ CLI tool with help, list-sources commands
- ✅ Configuration system
- ✅ Workflow documentation
- ✅ Safety protocols defined
- ✅ File structure created

**Pending Implementation:**
- ⏳ Actual source scraping logic
- ⏳ Gap analysis implementation
- ⏳ Upgrade application logic
- ⏳ Rollback mechanism
- ⏳ Metrics tracking

**To implement scraping:**
1. Add scraping libraries (cheerio, jsdom for web; octokit for GitHub API)
2. Implement source-specific scrapers in `tools/scrapers/`
3. Add relevance scoring logic
4. Test with each source type

**Next Steps:**
1. Test scan functionality with placeholder data
2. Implement one source scraper as proof-of-concept
3. Add gap analysis logic
4. Test full workflow end-to-end

---

**CRITICAL:** This skill makes PAI self-evolving. Use responsibly, always verify changes, maintain backups.
