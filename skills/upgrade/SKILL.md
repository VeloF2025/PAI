---
name: upgrade
description: |
  Self-improvement system that automatically monitors external sources for PAI enhancements.
  Scans Anthropic releases, Daniel Miessler's repo, AI YouTube channels, and research papers.
  Analyzes findings, suggests improvements, and auto-updates PAI with new techniques.

  USE WHEN user says 'upgrade PAI', 'check for updates', 'improve system',
  'scan for improvements', 'update from sources', 'self-improve',
  'check Anthropic releases', 'monitor Daniel repo', 'update skills',
  'apply latest techniques', 'system upgrade'
---

# Upgrade Skill - PAI Self-Improvement Engine

**The skill that keeps PAI ahead of the curve by auto-monitoring external sources and applying improvements.**

---

## 🎯 Load Full CORE Context

Before executing any upgrade operations:
```
read ${PAI_DIR}/skills/CORE/SKILL.md
```

---

## 📋 When to Activate This Skill

| User Request | Workflow | Purpose |
|--------------|----------|---------|
| "upgrade PAI" | Full upgrade cycle | Complete scan → analyze → upgrade |
| "check for updates" | scan-sources only | See what's new without applying |
| "scan Anthropic" | scan-sources (filtered) | Check specific source |
| "apply improvements" | analyze + apply | Apply already-scanned findings |
| "rollback upgrade" | Rollback workflow | Undo recent upgrade |

---

## 🔄 Core Workflows

### 1. Full Upgrade Cycle (Default)

**Trigger:** "upgrade PAI", "improve system"

**Flow:**
```
1. Scan Sources → 2. Analyze Improvements → 3. Apply Upgrades → 4. Verify
```

**Execution:**
```bash
# Run full upgrade cycle
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --full
```

### 2. Scan Only (Discovery)

**Trigger:** "check for updates", "scan sources"

**Flow:**
```
1. Scrape all configured sources
2. Save findings to history/upgrades/scans/
3. Report summary (no changes applied)
```

**Execution:**
```bash
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --scan-only
```

### 3. Analyze + Apply (Execution)

**Trigger:** "apply improvements", "update from last scan"

**Flow:**
```
1. Load latest scan results
2. Compare against current PAI documentation
3. Generate improvement suggestions
4. User approval required
5. Apply approved changes
6. Backup old code to history/upgrades/deprecated/
```

**Execution:**
```bash
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --apply
```

---

## 🌐 Monitored Sources

### Tier 1: Official Anthropic

**Sources:**
- Anthropic Engineering Blog: https://www.anthropic.com/news
- Claude Code GitHub: https://github.com/anthropics/claude-code/releases
- Anthropic Documentation: https://docs.anthropic.com/

**What to Extract:**
- New prompting techniques
- Claude Code features
- API updates
- Best practices
- Performance improvements

**Scan Frequency:** Daily

---

### Tier 2: Daniel Miessler's PAI

**Sources:**
- GitHub Repo: https://github.com/danielmiessler/Personal_AI_Infrastructure
- YouTube Channel: (if available)
- Blog Posts: (if available)

**What to Extract:**
- New skill patterns
- Workflow improvements
- CLI tool designs
- Hook enhancements
- Constitutional updates

**Scan Frequency:** Weekly

---

### Tier 3: AI Community

**Sources:**
- IndieDevDan YouTube
- AI Jason YouTube
- Simon Willison's blog
- LangChain blog
- Anthropic Cookbook

**What to Extract:**
- Novel AI techniques
- Integration patterns
- Use cases
- Tool discoveries

**Scan Frequency:** Weekly

---

### Tier 4: Security Research

**Sources:**
- Trail of Bits blog
- PortSwigger research
- OWASP updates
- Security conferences (Black Hat, DEF CON, OWASP)

**What to Extract:**
- Security testing techniques
- Pentesting automation
- Vulnerability patterns

**Scan Frequency:** Monthly

---

## 🛠️ CLI Tool Reference

### Main Upgrade CLI

**Location:** `${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts`

**Commands:**
```bash
# Full upgrade cycle
upgrade-cli --full

# Scan sources only
upgrade-cli --scan-only

# Analyze specific source
upgrade-cli --scan --source anthropic

# Apply improvements from last scan
upgrade-cli --apply

# Rollback last upgrade
upgrade-cli --rollback

# List available sources
upgrade-cli --list-sources

# Show upgrade history
upgrade-cli --history
```

**Flags:**
- `--dry-run` - Show what would change without applying
- `--auto-approve` - Skip manual approval (USE WITH CAUTION)
- `--verbose` - Detailed logging
- `--source <name>` - Scan specific source only

---

## 📁 Output Locations

### Scan Results
```
${PAI_DIR}/history/upgrades/scans/
└── YYYY-MM-DD-HHMMSS_scan-results.json
```

### Applied Upgrades
```
${PAI_DIR}/history/upgrades/
└── YYYY-MM-DD_upgrade-description.md
```

### Deprecated Code Backups
```
${PAI_DIR}/history/upgrades/deprecated/
└── YYYY-MM-DD_upgrade-name/
    ├── README.md              # What was changed and why
    ├── [old files]           # Full backup before upgrade
    └── rollback.sh           # Automated rollback script
```

---

## 🔒 Safety Protocols

### 1. Always Backup Before Upgrade

**MANDATORY:** Every upgrade creates backup in `deprecated/`

```bash
# Backup structure
deprecated/2025-01-01_use-when-triggers/
├── README.md                   # Change description
├── backup/                     # Full pre-upgrade state
│   └── [old skill files]
└── rollback.sh                # One-command rollback
```

### 2. User Approval Required

**Default:** All upgrades require explicit approval

**Exception:** `--auto-approve` flag (only for trusted, minor updates)

### 3. Atomic Upgrades

**Principle:** All-or-nothing application

- If ANY file fails to update → ROLLBACK entire upgrade
- No partial upgrades
- System stays consistent

### 4. Verification Step

**After applying upgrade:**
1. Run validation checks
2. Test affected skills
3. Verify no regressions
4. Confirm system still functional

**If verification fails:** Auto-rollback

---

## 📊 Upgrade Process Flow

```
┌─────────────────┐
│   User Request  │
│  "upgrade PAI"  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   1. SCAN SOURCES       │
│   - Anthropic           │
│   - Daniel's repo       │
│   - AI community        │
│   - Security research   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   2. ANALYZE FINDINGS   │
│   - Load current docs   │
│   - Compare vs findings │
│   - Identify gaps       │
│   - Generate suggestions│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   3. USER APPROVAL      │
│   - Show suggestions    │
│   - Risk assessment     │
│   - Wait for approval   │
└────────┬────────────────┘
         │ (approved)
         ▼
┌─────────────────────────┐
│   4. BACKUP CURRENT     │
│   - Create backup dir   │
│   - Copy all files      │
│   - Generate rollback   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   5. APPLY UPGRADES     │
│   - Update skills       │
│   - Update hooks        │
│   - Update constitution │
│   - Update tools        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   6. VERIFY             │
│   - Run validation      │
│   - Test skills         │
│   - Check system health │
└────────┬────────────────┘
         │
         ▼
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌───────┐      ┌──────────┐
│SUCCESS│      │  FAILED  │
│       │      │ ROLLBACK │
└───────┘      └──────────┘
```

---

## 🎯 Example Upgrade Scenarios

### Scenario 1: Anthropic Releases "use when" Pattern

**Scan Result:**
```json
{
  "source": "anthropic-blog",
  "date": "2025-01-01",
  "finding": {
    "title": "Improved skill routing with 'use when' keyword",
    "url": "https://anthropic.com/blog/use-when",
    "summary": "New pattern for better skill activation...",
    "code_example": "USE WHEN user says 'trigger1', 'trigger2'"
  }
}
```

**Analyze Output:**
```
IMPROVEMENT OPPORTUNITY DETECTED

Current State:
  - 12/36 skills have explicit triggers
  - 24/36 skills missing "use when" pattern

Suggested Change:
  - Add "USE WHEN" to all 24 skills
  - Update skill descriptions with natural language triggers

Impact: HIGH - Better routing, reduced confusion
Risk: LOW - Non-breaking change, backward compatible
Effort: MEDIUM - Requires auditing all skills

Recommended: YES - Apply immediately
```

**Apply:**
- Backup all 24 skill files
- Add "USE WHEN" patterns
- Verify routing still works
- Capture learning in history

---

### Scenario 2: Daniel Adds New Delegation Pattern

**Scan Result:**
```json
{
  "source": "daniel-repo",
  "date": "2025-01-01",
  "finding": {
    "title": "Spotcheck delegation pattern",
    "commit": "abc123",
    "description": "Use intern to verify work of 10 parallel interns",
    "files_changed": ["skills/CORE/delegation-patterns.md"]
  }
}
```

**Analyze Output:**
```
NEW PATTERN DISCOVERED

Current State:
  - Sequential delegation implemented
  - Parallel delegation implemented
  - Nested delegation implemented
  - Spotcheck pattern MISSING

Suggested Change:
  - Add spotcheck pattern to delegation-patterns.md
  - Update CORE skill documentation
  - Add example workflow

Impact: MEDIUM - New capability unlocked
Risk: LOW - Pure addition, no changes to existing
Effort: LOW - Documentation only

Recommended: YES - Valuable pattern to adopt
```

---

## 🚨 Rollback Procedure

**If upgrade causes issues:**

```bash
# Option 1: Automated rollback
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --rollback

# Option 2: Manual rollback
cd ${PAI_DIR}/history/upgrades/deprecated/YYYY-MM-DD_upgrade-name/
bash rollback.sh

# Option 3: Selective file restore
cp deprecated/2025-01-01_upgrade/backup/skills/skill-name/SKILL.md \
   ${PAI_DIR}/skills/skill-name/SKILL.md
```

**Rollback captures:**
- What was rolled back
- Why rollback was triggered
- Lessons learned
- How to prevent in future

---

## 📈 Metrics & Reporting

**Track upgrade effectiveness:**

```
${PAI_DIR}/history/upgrades/metrics.json

{
  "total_upgrades": 42,
  "successful": 40,
  "rolled_back": 2,
  "sources_scanned": 156,
  "improvements_found": 89,
  "improvements_applied": 40,
  "last_scan": "2025-01-01T12:00:00Z",
  "next_scan": "2025-01-02T12:00:00Z"
}
```

**Monthly report:**
- Number of upgrades applied
- Top sources for improvements
- Most impactful changes
- Time saved by automation

---

## ⚙️ Configuration

**Location:** `${PAI_DIR}/skills/upgrade/config.json`

```json
{
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
  },
  "backup_retention": {
    "keep_backups": 10,
    "keep_days": 90
  },
  "notification": {
    "voice_enabled": true,
    "voice_id": "kai",
    "notify_on": ["scan_complete", "upgrade_available", "upgrade_applied"]
  }
}
```

---

## 🎓 Learning Capture

**After every upgrade:**

```markdown
# Upgrade Learning Template

## What Changed
[Description of upgrade]

## Why Changed
[Reason for improvement]

## How It Helps
[Benefit to PAI system]

## Lessons Learned
[Insights for future upgrades]

## Related Upgrades
[Links to similar past upgrades]
```

**Saved to:** `${PAI_DIR}/history/learnings/YYYY-MM-DD-upgrade-learning.md`

---

## 🔗 Related Skills

- **CORE** - System identity and constitution (may be updated)
- **research** - Used for scanning sources
- **agent-observability** - Monitor upgrade execution

---

## 🎯 Success Criteria

**Upgrade skill is successful when:**

✅ Scans complete without errors
✅ Findings accurately represent external sources
✅ Analysis correctly identifies gaps vs current state
✅ Suggestions are relevant and actionable
✅ Backups created before all changes
✅ Upgrades apply cleanly
✅ Verification confirms system health
✅ Rollback works when needed
✅ Voice notification on completion
✅ History captures all changes

---

**CRITICAL:** This skill makes PAI self-evolving. Use responsibly, always verify changes, maintain backups.
