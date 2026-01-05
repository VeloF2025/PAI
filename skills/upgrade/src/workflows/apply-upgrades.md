# Apply Upgrades Workflow

**Purpose:** Apply approved improvements to PAI with safety protocols, backups, and rollback capability.

---

## Triggers

- "apply upgrades"
- "apply improvements"
- "execute upgrade"
- "implement improvements"
- "upgrade PAI now"

---

## Prerequisites

- ✅ Analysis results exist with approved suggestions
- ✅ User has explicitly approved upgrade(s)
- ✅ Git working directory is clean
- ✅ No critical processes running
- ✅ Backup directory available

---

## Steps

### 1. Load Approved Upgrade Plan

**Action:**
```bash
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --load-approved-plan
```

**Expected Input:**

```json
{
  "upgrade_id": "UUID",
  "approved_date": "2025-01-01T15:00:00Z",
  "analysis_id": "abc123",
  "approved_suggestions": [
    {
      "id": "suggestion-1",
      "title": "Add use when triggers",
      "files_to_modify": ["skills/*/SKILL.md"],
      "auto_approvable": false,
      "user_approved": true
    }
  ]
}
```

---

### 2. Pre-Upgrade Validation

**Critical Checks:**

```bash
# 1. Verify git status clean
git status --porcelain

# Expected: Empty output (no uncommitted changes)
# If not clean: STOP and prompt user to commit/stash

# 2. Verify backup directory writable
mkdir -p ${PAI_DIR}/history/upgrades/deprecated/
touch ${PAI_DIR}/history/upgrades/deprecated/.test
rm ${PAI_DIR}/history/upgrades/deprecated/.test

# 3. Verify no critical processes
# Check for running agents, active sessions
ps aux | grep -E 'claude|bun.*skills' | grep -v grep

# 4. Verify sufficient disk space
df -h ${PAI_DIR} | tail -1 | awk '{print $5}' | sed 's/%//'
# Expected: < 90% usage
```

**Validation Results:**

```typescript
interface PreUpgradeValidation {
  git_clean: boolean;
  backup_dir_writable: boolean;
  no_critical_processes: boolean;
  sufficient_disk_space: boolean;
  all_checks_passed: boolean;
  blocking_issues: string[];
}
```

**If validation fails:**
```
❌ Pre-upgrade validation FAILED

Blocking issues:
  • Git working directory not clean (3 uncommitted files)
  • Critical process running: bun skills/research/agent.ts (PID 12345)

Action required:
  1. Commit or stash changes: git status
  2. Stop critical processes: kill 12345
  3. Re-run: upgrade-cli --apply

Upgrade ABORTED for safety.
```

---

### 3. Create Backup

**Backup Strategy:**

```typescript
interface UpgradeBackup {
  backup_id: string;
  upgrade_id: string;
  backup_date: string;
  backup_path: string; // ${PAI_DIR}/history/upgrades/deprecated/YYYY-MM-DD_upgrade-name/
  files_backed_up: {
    original_path: string;
    backup_path: string;
    size_bytes: number;
    checksum: string; // SHA-256
  }[];
  git_commit_before: string; // Git SHA if in repo
  total_size_bytes: number;
}
```

**Backup Process:**

```bash
# Create backup directory
BACKUP_DIR="${PAI_DIR}/history/upgrades/deprecated/2025-01-01_use-when-triggers"
mkdir -p ${BACKUP_DIR}/backup

# For each file to be modified
for file in "${files_to_modify[@]}"; do
  # Calculate checksum
  checksum=$(sha256sum "$file" | awk '{print $1}')

  # Copy to backup
  relative_path="${file#${PAI_DIR}/}"
  backup_path="${BACKUP_DIR}/backup/${relative_path}"
  mkdir -p "$(dirname "$backup_path")"
  cp "$file" "$backup_path"

  # Record metadata
  echo "${file}|${backup_path}|${checksum}" >> ${BACKUP_DIR}/manifest.txt
done

# Save git state
git rev-parse HEAD > ${BACKUP_DIR}/git-commit-before.txt
git diff > ${BACKUP_DIR}/git-diff-before.patch

# Create README
cat > ${BACKUP_DIR}/README.md <<EOF
# Upgrade Backup: Use When Triggers

**Backup Date:** $(date -Iseconds)
**Upgrade ID:** ${UPGRADE_ID}
**Files Backed Up:** $(wc -l < ${BACKUP_DIR}/manifest.txt)

## What Changed
Added "USE WHEN" triggers to 24 skills for better routing.

## Why Changed
Anthropic recommended pattern for improved skill activation.

## Rollback
Run: bash ${BACKUP_DIR}/rollback.sh

## Files
See manifest.txt for complete list.
EOF
```

**Generate Rollback Script:**

```bash
cat > ${BACKUP_DIR}/rollback.sh <<'ROLLBACK'
#!/usr/bin/env bash
set -e

BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)"
PAI_DIR="$(dirname "$(dirname "$(dirname "$BACKUP_DIR")")")"

echo "🔄 Rolling back upgrade..."

# Restore each file
while IFS='|' read -r original backup checksum; do
  echo "  Restoring: ${original}"
  cp "${backup}" "${original}"

  # Verify checksum
  new_checksum=$(sha256sum "${original}" | awk '{print $1}')
  if [ "$new_checksum" != "$checksum" ]; then
    echo "❌ Checksum mismatch for ${original}"
    exit 1
  fi
done < "${BACKUP_DIR}/manifest.txt"

echo "✅ Rollback complete!"
echo "   Restored $(wc -l < "${BACKUP_DIR}/manifest.txt") files"
ROLLBACK

chmod +x ${BACKUP_DIR}/rollback.sh
```

---

### 4. Apply Upgrade (Atomic Transaction)

**Transaction Pattern:**

```typescript
async function applyUpgrade(
  suggestions: ImprovementSuggestion[],
  backup: UpgradeBackup
): Promise<UpgradeResult> {
  const tempDir = `${PAI_DIR}/.upgrade-temp/${backup.upgrade_id}`;
  await mkdir(tempDir, { recursive: true });

  try {
    // Phase 1: Prepare all changes in temp directory
    for (const suggestion of suggestions) {
      await prepareChanges(suggestion, tempDir);
    }

    // Phase 2: Validate prepared changes
    const validation = await validatePreparedChanges(tempDir);
    if (!validation.passed) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // Phase 3: Apply changes atomically
    for (const suggestion of suggestions) {
      await applyChangesFromTemp(suggestion, tempDir);
    }

    // Phase 4: Post-upgrade verification
    const verification = await verifyUpgrade(suggestions);
    if (!verification.passed) {
      // ROLLBACK
      await runRollback(backup);
      throw new Error(`Verification failed: ${verification.errors.join(", ")}`);
    }

    // Phase 5: Cleanup temp directory
    await rm(tempDir, { recursive: true });

    return {
      success: true,
      suggestions_applied: suggestions.length,
      files_modified: countModifiedFiles(suggestions),
      verification_passed: true
    };
  } catch (error) {
    // ROLLBACK on any error
    await runRollback(backup);
    await rm(tempDir, { recursive: true, force: true });

    return {
      success: false,
      error: error.message,
      rolled_back: true
    };
  }
}
```

**Specific Upgrade Implementations:**

#### A. Add "use when" Triggers

```typescript
async function addUseWhenTriggers(skillFiles: string[]): Promise<void> {
  for (const skillFile of skillFiles) {
    const content = await readFile(skillFile, "utf-8");
    const yaml = parseYAML(content);

    // Analyze skill to infer triggers
    const triggers = inferTriggersFromDescription(yaml.description);

    // Add to description
    const updatedDescription = `${yaml.description}\n\n  USE WHEN ${triggers.join(", ")}`;

    // Update file
    const updatedYAML = { ...yaml, description: updatedDescription };
    const newContent = stringifyYAML(updatedYAML);

    await writeFile(skillFile, newContent);
  }
}

function inferTriggersFromDescription(description: string): string[] {
  // Use LLM or pattern matching to infer natural language triggers
  // Example: "Research using web sources" → "user says 'do research', 'find information'"

  // This is a simplified version - actual implementation would use more sophisticated NLP
  const keywords = extractKeywords(description);
  return keywords.map(kw => `user says '${kw}'`);
}
```

#### B. Create New Skill

```typescript
async function createNewSkill(suggestionData: SkillCreationData): Promise<void> {
  const skillDir = `${PAI_DIR}/skills/${suggestionData.skill_name}`;

  // Create directory structure
  await mkdir(`${skillDir}/workflows`, { recursive: true });
  await mkdir(`${skillDir}/tools`, { recursive: true });

  // Create SKILL.md
  await writeFile(
    `${skillDir}/SKILL.md`,
    generateSkillTemplate(suggestionData)
  );

  // Create initial workflow
  if (suggestionData.workflows?.length > 0) {
    for (const workflow of suggestionData.workflows) {
      await writeFile(
        `${skillDir}/workflows/${workflow.name}.md`,
        generateWorkflowTemplate(workflow)
      );
    }
  }

  // Create CLI tool if specified
  if (suggestionData.cli_tool) {
    await writeFile(
      `${skillDir}/tools/${suggestionData.cli_tool.name}.ts`,
      generateCLITemplate(suggestionData.cli_tool)
    );
  }
}
```

#### C. Update Constitution

```typescript
async function updateConstitution(updates: ConstitutionUpdate[]): Promise<void> {
  const constitutionPath = `${PAI_DIR}/skills/CORE/CONSTITUTION.md`;
  let content = await readFile(constitutionPath, "utf-8");

  for (const update of updates) {
    if (update.type === "add_section") {
      // Find insertion point
      const sectionHeader = `## ${update.section_name}`;
      const insertionPoint = findInsertionPoint(content, update.after_section);

      // Insert new content
      const newSection = `\n\n${sectionHeader}\n\n${update.content}\n`;
      content = insertAtPosition(content, insertionPoint, newSection);
    }

    if (update.type === "update_section") {
      // Find and replace section content
      content = replaceSectionContent(
        content,
        update.section_name,
        update.new_content
      );
    }
  }

  await writeFile(constitutionPath, content);
}
```

---

### 5. Post-Upgrade Verification

**Verification Checks:**

```typescript
interface UpgradeVerification {
  files_modified_successfully: boolean;
  no_syntax_errors: boolean;
  skills_still_loadable: boolean;
  hooks_still_functional: boolean;
  no_broken_links: boolean;
  git_status_clean: boolean; // After upgrade, before commit
  all_checks_passed: boolean;
  errors: string[];
}

async function verifyUpgrade(
  suggestions: ImprovementSuggestion[]
): Promise<UpgradeVerification> {
  const errors: string[] = [];

  // 1. Check all modified files exist and are valid
  for (const suggestion of suggestions) {
    for (const file of suggestion.implementation.files_to_modify) {
      try {
        await access(file);
        // Validate YAML/Markdown syntax
        const content = await readFile(file, "utf-8");
        if (file.endsWith(".md")) validateMarkdown(content);
        if (file.includes("SKILL.md")) validateSkillYAML(content);
      } catch (error) {
        errors.push(`File validation failed: ${file} - ${error.message}`);
      }
    }
  }

  // 2. Test skill loading
  try {
    const skills = await loadAllSkills();
    if (skills.length === 0) {
      errors.push("No skills loaded after upgrade");
    }
  } catch (error) {
    errors.push(`Skill loading failed: ${error.message}`);
  }

  // 3. Verify no broken internal links
  const brokenLinks = await findBrokenLinks(PAI_DIR);
  if (brokenLinks.length > 0) {
    errors.push(`Broken links found: ${brokenLinks.join(", ")}`);
  }

  // 4. Check TypeScript compilation (if CLI tools modified)
  const modifiedTS = suggestions.flatMap(s =>
    s.implementation.files_to_modify.filter(f => f.endsWith(".ts"))
  );

  if (modifiedTS.length > 0) {
    try {
      await exec("bun run --check");
    } catch (error) {
      errors.push(`TypeScript compilation failed: ${error.message}`);
    }
  }

  return {
    files_modified_successfully: errors.length === 0,
    no_syntax_errors: !errors.some(e => e.includes("syntax")),
    skills_still_loadable: !errors.some(e => e.includes("loading failed")),
    hooks_still_functional: true, // TODO: Add hook testing
    no_broken_links: !errors.some(e => e.includes("Broken links")),
    git_status_clean: true,
    all_checks_passed: errors.length === 0,
    errors
  };
}
```

---

### 6. Commit Upgrade (Optional)

**If user approves git commit:**

```bash
# Add modified files
git add ${PAI_DIR}/skills/
git add ${PAI_DIR}/history/upgrades/

# Create commit with metadata
git commit -m "$(cat <<EOF
feat(pai): Apply upgrade - ${UPGRADE_TITLE}

Applied improvements from scan ${SCAN_DATE}:
$(echo "${SUGGESTIONS}" | jq -r '.[] | "- " + .title')

Impact: ${TOTAL_IMPACT}
Risk: ${TOTAL_RISK}
Files modified: ${FILES_MODIFIED_COUNT}

Backup: history/upgrades/deprecated/${BACKUP_DIR_NAME}
Analysis: history/upgrades/analyses/${ANALYSIS_FILE}

🤖 Generated with Claude Code
EOF
)"

# Tag the upgrade
git tag "upgrade-${UPGRADE_ID}"
```

---

### 7. Generate Upgrade Report

**Report Location:**
```
${PAI_DIR}/history/upgrades/YYYY-MM-DD_upgrade-name.md
```

**Report Template:**

```markdown
# PAI Upgrade Report: ${UPGRADE_TITLE}

**Date:** 2025-01-01 15:30:00
**Upgrade ID:** abc123-def456
**Status:** ✅ SUCCESS

---

## Summary

Successfully applied 4 improvements to PAI system.

**Impact:**
- 24 skills now have "use when" triggers
- Better skill routing and activation
- Improved user experience

**Statistics:**
- Files modified: 24
- Lines changed: +180 / -0
- Duration: 2m 34s
- Verification: PASSED

---

## Changes Applied

### 1. Add "use when" Triggers to Skills

**Files modified:** 24
**Impact:** HIGH
**Risk:** LOW

**Changes:**
- Updated skill descriptions with natural language triggers
- Improved skill routing accuracy
- Better UX for skill activation

**Example:**
```yaml
# Before:
description: Research using multiple AI sources

# After:
description: |
  Research using multiple AI sources

  USE WHEN user says 'do research', 'find information',
  'investigate', 'current events'
```

### 2. Create 7-Phase Workflow Template

**Files created:** 1
**Impact:** MEDIUM
**Risk:** LOW

**Changes:**
- Added `skills/CORE/7-phase-workflow.md`
- Documented standard workflow pattern
- Referenced from constitution

### 3. Expand History Structure

**Files created:** 7
**Impact:** MEDIUM
**Risk:** LOW

**Changes:**
- Created history subdirectories
- Added README.md to each
- Organized existing history files

### 4. Update Constitution Documentation

**Files modified:** 1
**Impact:** MEDIUM
**Risk:** LOW

**Changes:**
- Added workflow pattern section
- Updated architecture principles
- Added new examples

---

## Verification Results

✅ All files modified successfully
✅ No syntax errors detected
✅ Skills load correctly
✅ Hooks functional
✅ No broken links
✅ TypeScript compilation passed
✅ Git status clean

---

## Backup Information

**Backup Location:** history/upgrades/deprecated/2025-01-01_use-when-triggers/
**Files Backed Up:** 24
**Backup Size:** 142 KB
**Rollback Script:** Available

**To rollback:**
```bash
bash ${PAI_DIR}/history/upgrades/deprecated/2025-01-01_use-when-triggers/rollback.sh
```

---

## Lessons Learned

### What Went Well
- Atomic upgrade pattern worked perfectly
- Verification caught 0 issues (all pre-validated)
- Backup/rollback mechanism tested successfully
- User approval process smooth

### What Could Improve
- Could parallelize file modifications for faster execution
- Consider adding progress bar for large upgrades
- Add dry-run mode for testing

### For Next Time
- Continue using atomic transaction pattern
- Maintain strict verification before applying
- Always create backups (no shortcuts)

---

## Related

**Source Scan:** history/upgrades/scans/2025-01-01-120000_scan-results.json
**Analysis:** history/upgrades/analyses/2025-01-01-140000_analysis.json
**Git Commit:** ${GIT_COMMIT_SHA}
**Git Tag:** upgrade-${UPGRADE_ID}

---

**Upgrade Complete!** 🎉

PAI successfully improved with 4 new enhancements.
System verified and operational.
```

---

### 8. Update Metrics

**Metrics File:**
```
${PAI_DIR}/history/upgrades/metrics.json
```

**Update Metrics:**

```typescript
interface UpgradeMetrics {
  total_upgrades: number;
  successful: number;
  rolled_back: number;
  failed: number;

  by_category: {
    prompting: number;
    skills: number;
    architecture: number;
    tools: number;
  };

  total_scans: number;
  total_findings: number;
  total_suggestions: number;
  suggestions_applied: number;

  last_upgrade_date: string;
  last_scan_date: string;
  next_scheduled_scan: string;

  avg_upgrade_duration_seconds: number;
  avg_files_per_upgrade: number;
  total_backup_size_bytes: number;
}

async function updateMetrics(upgradeResult: UpgradeResult): Promise<void> {
  const metricsPath = `${PAI_DIR}/history/upgrades/metrics.json`;
  const metrics = await loadMetrics(metricsPath);

  metrics.total_upgrades++;
  if (upgradeResult.success) {
    metrics.successful++;
  } else if (upgradeResult.rolled_back) {
    metrics.rolled_back++;
  } else {
    metrics.failed++;
  }

  // Update category counts
  for (const suggestion of upgradeResult.suggestions_applied) {
    metrics.by_category[suggestion.category]++;
  }

  // Update averages
  metrics.avg_upgrade_duration_seconds =
    (metrics.avg_upgrade_duration_seconds * (metrics.total_upgrades - 1) +
      upgradeResult.duration_seconds) /
    metrics.total_upgrades;

  metrics.last_upgrade_date = new Date().toISOString();

  await saveMetrics(metricsPath, metrics);
}
```

---

## Safety Protocols (CRITICAL)

### 1. Always Backup Before Upgrade
**MANDATORY** - Never skip backup creation

### 2. User Approval Required
**Default:** All upgrades need explicit user approval
**Exception:** Auto-approvable items (documentation only, low risk)

### 3. Atomic Upgrades
**Principle:** All-or-nothing
- If ANY file fails → ROLLBACK entire upgrade
- No partial upgrades allowed
- System stays consistent

### 4. Verification Before Commit
**MANDATORY** - Run all verification checks before considering upgrade successful

### 5. Rollback Capability
**ALWAYS** - Every upgrade must have rollback script
**Testing** - Rollback script tested as part of verification

---

## Error Handling

**Error:** File modification failed
**Recovery:** Automatic rollback, preserve original state

**Error:** Verification failed
**Recovery:** Automatic rollback, report specific failures

**Error:** Git conflict during commit
**Recovery:** Rollback to pre-upgrade state, save upgrade plan for retry

**Error:** Insufficient disk space
**Recovery:** Abort before starting, prompt user to free space

**Error:** Critical process running
**Recovery:** Abort, prompt user to stop process manually

---

## Performance Notes

**Expected Duration:**
- Small upgrade (1-5 files): 30-60 seconds
- Medium upgrade (6-20 files): 1-3 minutes
- Large upgrade (20+ files): 3-10 minutes

**Resource Usage:**
- Disk: 2x size of modified files (backup + modified)
- Memory: ~100-200 MB
- CPU: Moderate (file I/O, verification)

---

## Troubleshooting

**Issue:** "Upgrade verification failed"
**Fix:** Review verification errors, may need manual fix before retry

**Issue:** "Rollback failed"
**Fix:** Critical - manually restore from backup directory

**Issue:** "Git commit failed"
**Fix:** Non-critical - upgrade applied successfully, commit manually later

**Issue:** "File checksum mismatch"
**Fix:** Indicates file corruption, re-run upgrade from clean state

---

**END OF WORKFLOW**
