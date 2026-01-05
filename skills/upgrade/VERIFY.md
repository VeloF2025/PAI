# Upgrade Pack - Verification Checklist

**Version**: 2.0
**Purpose**: Verify correct installation and functionality
**Estimated Time**: 5-10 minutes

---

## 1. File Verification

### 1.1 Core Pack Files

```bash
cd ~/.claude/skills/upgrade/
ls -la
```

**✅ Required Files**:
- [ ] `SKILL.md` - Skill definition with routing
- [ ] `PACK_README.md` - Pack overview
- [ ] `PACK_INSTALL.md` - Installation guide
- [ ] `PACK_VERIFY.md` - This verification checklist
- [ ] `config.json` - Configuration file
- [ ] `README.md` - Original skill documentation

**✅ Required Directories**:
- [ ] `workflows/` - Workflow documentation
- [ ] `tools/` - CLI and utilities

### 1.2 Workflow Documentation

```bash
ls ~/.claude/skills/upgrade/workflows/
```

**✅ Expected Files**:
- [ ] `scan-sources.md` - Source scraping instructions
- [ ] `analyze-improvements.md` - Gap analysis process
- [ ] `apply-upgrades.md` - Upgrade application protocol

### 1.3 Tools Directory

```bash
ls ~/.claude/skills/upgrade/tools/
```

**✅ Expected Files**:
- [ ] `upgrade-cli.ts` - Main CLI tool
- [ ] `scrapers/` directory (when implemented)

---

## 2. Directory Structure Verification

### 2.1 History Directories

```bash
ls -la ~/.claude/history/upgrades/
```

**✅ Required Directories**:
- [ ] `scans/` - Scan results storage
- [ ] `analyses/` - Analysis results storage
- [ ] `deprecated/` - Backup storage

### 2.2 Initial Backup

```bash
ls ~/.claude/history/upgrades/deprecated/
```

**✅ Expected**:
- [ ] `initial-state/` directory exists
- [ ] `initial-state/backup/` contains skills backup

### 2.3 Metrics File

```bash
cat ~/.claude/history/upgrades/metrics.json
```

**✅ Expected**:
- [ ] File exists
- [ ] Valid JSON format
- [ ] Counters initialized to zero

---

## 3. Configuration Verification

### 3.1 Config File Validity

```bash
# Check JSON syntax
cat ~/.claude/skills/upgrade/config.json | bun -c "JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf-8'))"
```

**✅ Expected**: No syntax errors

### 3.2 Source Configuration

```bash
cat ~/.claude/skills/upgrade/config.json | grep -A 3 '"sources"'
```

**✅ Verify**:
- [ ] At least 4 sources configured
- [ ] `anthropic-blog` enabled
- [ ] `daniel-repo` enabled
- [ ] Each source has `enabled` and `frequency` fields

### 3.3 Auto-Approve Settings

```bash
cat ~/.claude/skills/upgrade/config.json | grep -A 5 '"auto_approve"'
```

**✅ Expected**:
- [ ] `"enabled": false` (disabled by default for safety)
- [ ] `max_risk` set to "low"
- [ ] `categories` array defined

---

## 4. CLI Tool Verification

### 4.1 Help Command

```bash
cd ~/.claude/skills/upgrade/tools/
bun run upgrade-cli.ts --help
```

**✅ Expected Output**:
- [ ] Help text displays
- [ ] Shows available commands
- [ ] No errors or warnings

### 4.2 List Sources Command

```bash
bun run upgrade-cli.ts --list-sources
```

**✅ Expected Output**:
- [ ] Lists all configured sources
- [ ] Shows enabled/disabled status
- [ ] Displays scan frequency
- [ ] No errors

### 4.3 Scan Command (Dry Run)

```bash
bun run upgrade-cli.ts --scan-only --dry-run
```

**✅ Expected**:
- [ ] Command executes without errors
- [ ] Shows what would be scanned
- [ ] No actual files created (dry run)

---

## 5. Functional Tests

### 5.1 Test Scan Execution

```bash
cd ~/.claude/skills/upgrade/tools/
bun run upgrade-cli.ts --scan-only --verbose
```

**✅ Expected Behavior**:
- [ ] Scan starts
- [ ] Processes each enabled source
- [ ] Creates scan result file in `scans/` directory
- [ ] Displays summary statistics
- [ ] No critical errors

**Verify Results**:
```bash
ls -lah ~/.claude/history/upgrades/scans/
```
- [ ] Scan result file created (`.json` file)
- [ ] File is non-zero size

### 5.2 Test Analysis (If Scan Completed)

```bash
bun run upgrade-cli.ts --analyze
```

**⚠️ Note**: May not work until scrapers are implemented.

**✅ Expected** (when implemented):
- [ ] Loads latest scan results
- [ ] Performs gap analysis
- [ ] Creates analysis file in `analyses/` directory
- [ ] Shows improvement suggestions

### 5.3 Test History Command

```bash
bun run upgrade-cli.ts --history
```

**✅ Expected**:
- [ ] Shows upgrade history (may be empty if no upgrades yet)
- [ ] Displays metrics from `metrics.json`
- [ ] No errors

---

## 6. Integration Verification

### 6.1 Skill Loading Test

**In Claude Code session**, say:
```
upgrade PAI
```

**✅ Expected Behavior**:
- [ ] Upgrade skill activates
- [ ] Shows workflow options
- [ ] Prompts for scan/analyze/apply choice

### 6.2 Skill Recognition

```bash
# Check skill is registered
ls ~/.claude/skills/ | grep upgrade
```

**✅ Expected**: `upgrade/` directory listed

---

## 7. Safety Protocol Verification

### 7.1 Backup Mechanism

```bash
# Check backup directory structure
ls -la ~/.claude/history/upgrades/deprecated/initial-state/
```

**✅ Verify**:
- [ ] `backup/` directory exists
- [ ] Contains skill files
- [ ] File permissions preserved

### 7.2 Rollback Script (When Generated)

**⚠️ Note**: Rollback scripts are generated after first upgrade.

**After first upgrade**, verify:
```bash
ls ~/.claude/history/upgrades/deprecated/[latest-upgrade]/rollback.sh
```

**✅ Expected**:
- [ ] Rollback script exists
- [ ] Script is executable
- [ ] Contains restore commands

---

## 8. Dependency Verification

### 8.1 Bun Runtime

```bash
bun --version
```

**✅ Expected**: Version 1.0.0 or higher

### 8.2 Git

```bash
git --version
```

**✅ Expected**: Version 2.0.0 or higher

### 8.3 Disk Space

```bash
df -h ~/.claude/history/upgrades/
```

**✅ Expected**: >500MB available

---

## 9. Optional: GitHub Token Verification

### 9.1 Token Environment Variable

```bash
echo $GITHUB_TOKEN
```

**✅ Expected** (if configured):
- [ ] Token displayed
- [ ] Token is 40 characters (classic token)

### 9.2 Token Validity

```bash
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

**✅ Expected**:
- [ ] Returns user info JSON
- [ ] No "Bad credentials" error

---

## 10. Performance Checks

### 10.1 Scan Performance

**Run scan and measure time**:
```bash
time bun run ~/.claude/skills/upgrade/tools/upgrade-cli.ts --scan-only
```

**✅ Acceptable Performance**:
- [ ] Completes in < 2 minutes (4 sources)
- [ ] No timeout errors
- [ ] Memory usage reasonable

### 10.2 File Size Check

```bash
du -sh ~/.claude/history/upgrades/
```

**✅ Expected**:
- [ ] < 100MB (initial state)
- [ ] Grows appropriately with scans/backups

---

## 11. Error Handling Verification

### 11.1 Invalid Command Handling

```bash
bun run upgrade-cli.ts --invalid-command
```

**✅ Expected**:
- [ ] Shows error message
- [ ] Suggests valid commands
- [ ] Exits gracefully (no crash)

### 11.2 Missing Dependencies

**If scrapers are implemented**:
```bash
cd ~/.claude/skills/upgrade/tools/
rm -rf node_modules/
bun run upgrade-cli.ts --scan-only
```

**✅ Expected**:
- [ ] Error message about missing dependencies
- [ ] Suggestions for installation
- [ ] No crash or hang

**Restore**:
```bash
bun install
```

---

## 12. Documentation Verification

### 12.1 README Completeness

```bash
cat ~/.claude/skills/upgrade/PACK_README.md
```

**✅ Verify Sections Present**:
- [ ] Overview
- [ ] What's Included
- [ ] Architecture
- [ ] Use Cases
- [ ] Dependencies
- [ ] Configuration
- [ ] Safety Protocols

### 12.2 Workflow Documentation

```bash
for file in ~/.claude/skills/upgrade/workflows/*.md; do
  echo "=== $(basename "$file") ==="
  head -5 "$file"
done
```

**✅ Expected**:
- [ ] All workflow files have clear headers
- [ ] Each includes purpose statement
- [ ] No broken internal links

---

## Sign-Off Checklist

### Critical Items (Must Pass)

- [ ] ✅ All core pack files present
- [ ] ✅ Directory structure created correctly
- [ ] ✅ CLI tool executes without errors
- [ ] ✅ Config file is valid JSON
- [ ] ✅ Skill loads in Claude Code
- [ ] ✅ Initial backup created

### Recommended Items (Should Pass)

- [ ] ✅ All sources configured
- [ ] ✅ Scan completes successfully
- [ ] ✅ GitHub token configured (optional but recommended)
- [ ] ✅ Metrics file initialized
- [ ] ✅ Documentation complete

### Optional Items (Nice to Have)

- [ ] 🔵 Scrapers implemented
- [ ] 🔵 Auto-approve configured
- [ ] 🔵 Voice notifications enabled
- [ ] 🔵 Custom sources added

---

## Final Validation

**Run comprehensive validation**:

```bash
cd ~/.claude/skills/upgrade/tools/

echo "Testing CLI..."
bun run upgrade-cli.ts --help && echo "✅ CLI OK" || echo "❌ CLI Failed"

echo "Testing scan..."
bun run upgrade-cli.ts --scan-only && echo "✅ Scan OK" || echo "❌ Scan Failed"

echo "Checking directories..."
[ -d ~/.claude/history/upgrades/scans ] && echo "✅ Directories OK" || echo "❌ Directories Missing"

echo "Checking metrics..."
[ -f ~/.claude/history/upgrades/metrics.json ] && echo "✅ Metrics OK" || echo "❌ Metrics Missing"

echo "Verification complete!"
```

**✅ Expected**: All checks show "✅ OK"

---

## Health Check Summary

**Status**: [ ] PASS  [ ] FAIL  [ ] PARTIAL

**Issues Found**:
- [ ] None
- [ ] Minor issues (list below)
- [ ] Critical issues (list below)

**Issue Details**:
```
(Document any issues found during verification)
```

**Sign-Off**:
- **Date**: _______________
- **Verified By**: _______________
- **Ready for Use**: [ ] YES  [ ] NO  [ ] WITH CAVEATS

---

## Next Steps

### If All Checks Pass ✅
1. Start using upgrade skill in Claude Code
2. Run first production scan: `bun run upgrade-cli.ts --scan-only`
3. Review scan results and apply improvements
4. Monitor metrics over time

### If Issues Found ❌
1. Review failed checks above
2. Consult PACK_INSTALL.md troubleshooting section
3. Fix issues and re-run verification
4. Document any unresolved issues

---

## Maintenance Schedule

**Weekly**:
- [ ] Check upgrade metrics: `bun run upgrade-cli.ts --history`
- [ ] Review latest scan results

**Monthly**:
- [ ] Verify backups are valid
- [ ] Clean old scan results (>90 days)
- [ ] Update config if sources changed

**Quarterly**:
- [ ] Review all enabled sources
- [ ] Check for new sources to add
- [ ] Optimize scan frequency

---

**Verification Checklist Version**: 2.0
**Last Updated**: 2026-01-02
**Completion Time**: ⏱️ 5-10 minutes
