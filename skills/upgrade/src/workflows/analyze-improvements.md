# Analyze Improvements Workflow

**Purpose:** Load scan results, compare against current PAI state, generate improvement suggestions.

---

## Triggers

- "analyze improvements"
- "analyze upgrades"
- "what improvements found"
- "review scan results"
- "evaluate findings"

---

## Prerequisites

- ✅ Scan results exist in `${PAI_DIR}/history/upgrades/scans/`
- ✅ Current PAI documentation accessible
- ✅ Git working directory clean (for comparison)

---

## Steps

### 1. Load Latest Scan Results

**Action:**
```bash
bun run ${PAI_DIR}/skills/upgrade/tools/upgrade-cli.ts --load-latest-scan
```

**Expected Output:**
```json
{
  "scan_id": "abc123",
  "scan_date": "2025-01-01T12:00:00Z",
  "sources_scanned": ["anthropic-blog", "daniel-repo", "ai-community"],
  "total_findings": 23,
  "by_relevance": {
    "high": 5,
    "medium": 12,
    "low": 6
  },
  "findings": [...]
}
```

---

### 2. Load Current PAI State

**Read Current Documentation:**

```bash
# Get current skill list
ls ${PAI_DIR}/skills/*/SKILL.md

# Get current hook configuration
cat ${PAI_DIR}/settings.json | jq '.hooks'

# Get current constitution
cat ${PAI_DIR}/skills/CORE/CONSTITUTION.md

# Get current tools inventory
find ${PAI_DIR}/skills/*/tools/*.ts -type f
```

**Build State Snapshot:**

```typescript
interface PAIState {
  skills: {
    name: string;
    has_use_when: boolean;
    has_workflows: boolean;
    has_cli_tools: boolean;
    version: string;
  }[];
  hooks: {
    event: string;
    count: number;
    names: string[];
  }[];
  constitution_principles: string[];
  cli_tools: {
    skill: string;
    tool: string;
    functionality: string;
  }[];
  history_structure: string[];
  mcp_servers: string[];
}
```

---

### 3. Compare Findings vs Current State

**For Each High-Priority Finding:**

```typescript
async function analyzeGap(finding: Finding, paiState: PAIState): Promise<Gap> {
  // Pattern matching
  if (finding.category === "prompting" && finding.title.includes("use when")) {
    // Check how many skills are missing "use when"
    const skillsWithoutUseWhen = paiState.skills.filter(s => !s.has_use_when);

    return {
      gap_type: "missing_pattern",
      gap_description: `${skillsWithoutUseWhen.length} skills missing "use when" triggers`,
      affected_files: skillsWithoutUseWhen.map(s => `skills/${s.name}/SKILL.md`),
      source_finding: finding,
      impact: "high",
      effort: "medium"
    };
  }

  if (finding.category === "skills" && finding.title.includes("new skill")) {
    // Check if skill exists
    const skillExists = paiState.skills.some(s => s.name === finding.suggested_skill_name);

    if (!skillExists) {
      return {
        gap_type: "missing_skill",
        gap_description: `Skill "${finding.suggested_skill_name}" not implemented`,
        affected_files: [`skills/${finding.suggested_skill_name}/`],
        source_finding: finding,
        impact: finding.impact_score,
        effort: finding.effort_estimate
      };
    }
  }

  if (finding.category === "architecture" && finding.title.includes("workflow")) {
    // Check if workflow pattern exists
    const constitutionContent = await readFile(`${PAI_DIR}/skills/CORE/CONSTITUTION.md`);
    const hasPattern = constitutionContent.includes(finding.workflow_pattern);

    if (!hasPattern) {
      return {
        gap_type: "missing_architecture_pattern",
        gap_description: `${finding.workflow_pattern} not documented in constitution`,
        affected_files: ["skills/CORE/CONSTITUTION.md"],
        source_finding: finding,
        impact: "high",
        effort: "low"
      };
    }
  }

  return null; // No gap found
}
```

---

### 4. Generate Improvement Suggestions

**Suggestion Structure:**

```typescript
interface ImprovementSuggestion {
  id: string;
  title: string;
  description: string;
  source_finding_id: string;
  gap_type: "missing_pattern" | "missing_skill" | "missing_architecture_pattern" | "outdated_implementation";

  impact: {
    score: "high" | "medium" | "low";
    reasoning: string;
    benefits: string[];
  };

  risk: {
    score: "high" | "medium" | "low";
    reasoning: string;
    concerns: string[];
    mitigation: string[];
  };

  effort: {
    score: "high" | "medium" | "low";
    estimated_files: number;
    estimated_lines: number;
    complexity: string;
  };

  implementation: {
    files_to_create: string[];
    files_to_modify: string[];
    dependencies: string[];
    breaking_changes: boolean;
  };

  approval_required: boolean;
  auto_approvable: boolean;

  code_examples?: {
    before?: string;
    after: string;
    language: string;
  }[];
}
```

---

### 5. Score and Rank Suggestions

**Impact/Risk/Effort Matrix:**

```
Impact Score:
  HIGH (3): Significantly improves core functionality, unlocks new capabilities
  MEDIUM (2): Enhances existing functionality, improves UX
  LOW (1): Minor improvement, nice-to-have

Risk Score:
  HIGH (3): Breaking changes, affects core systems, requires extensive testing
  MEDIUM (2): May affect existing workflows, moderate testing needed
  LOW (1): Safe addition, no breaking changes, minimal testing

Effort Score:
  HIGH (3): 10+ files, 500+ lines, complex logic
  MEDIUM (2): 3-9 files, 100-500 lines, moderate complexity
  LOW (1): 1-2 files, <100 lines, simple changes

Priority Score = (Impact × 2) + (10 - Risk × 2) + (10 - Effort × 2)
```

**Example Scoring:**

```typescript
const suggestion = {
  title: "Add 'use when' triggers to all skills",
  impact: { score: "high" },      // 3
  risk: { score: "low" },         // 1
  effort: { score: "medium" }     // 2
};

// Priority = (3 × 2) + (10 - 1 × 2) + (10 - 2 × 2)
//          = 6 + 8 + 6 = 20 (out of max 24)
```

---

### 6. Generate User Approval Prompt

**Approval Document Template:**

```markdown
# 🔄 PAI Upgrade Available

**Scan Date:** 2025-01-01
**Findings Analyzed:** 23
**Improvement Suggestions:** 5

---

## 📊 Summary

| Category | High Impact | Medium Impact | Low Impact |
|----------|-------------|---------------|------------|
| Prompting | 2 | 1 | 0 |
| Skills | 1 | 2 | 1 |
| Architecture | 1 | 0 | 0 |
| Tools | 0 | 1 | 0 |

---

## 🎯 Recommended Upgrades (Top 5)

### 1. [HIGH PRIORITY] Add "use when" Triggers to All Skills

**Source:** Anthropic Engineering Blog - "Improved Skill Routing"
**Impact:** HIGH - Better skill activation, reduced confusion
**Risk:** LOW - Non-breaking change, backward compatible
**Effort:** MEDIUM - 24 skills need updates

**What Changes:**
- Add "USE WHEN" triggers to 24/36 skills missing them
- Update skill descriptions with natural language patterns
- Improves automatic skill routing

**Files Affected:**
- skills/*/SKILL.md (24 files)

**Auto-Approvable:** No (requires review of each skill's triggers)

**Code Example:**
```yaml
# Before:
description: Research using multiple AI sources

# After:
description: |
  Research using multiple AI sources

  USE WHEN user says 'do research', 'find information about',
  'investigate', 'current events', 'search the web'
```

**Approve?** [Y/n]

---

### 2. [HIGH PRIORITY] Create Upgrade Skill for Self-Improvement

**Source:** Daniel's PAI - New "upgrade" skill
**Impact:** HIGH - Enables automatic PAI improvement
**Risk:** MEDIUM - New automation, needs testing
**Effort:** HIGH - New skill with CLI tools

**What Changes:**
- New skill: `skills/upgrade/`
- Workflows for scanning, analyzing, applying updates
- CLI tools for automation
- Integration with hooks system

**Files Created:**
- skills/upgrade/SKILL.md
- skills/upgrade/workflows/{scan,analyze,apply}.md
- skills/upgrade/tools/upgrade-cli.ts
- skills/upgrade/config.json

**Auto-Approvable:** No (major new functionality)

**Approve?** [Y/n]

---

### 3. [MEDIUM PRIORITY] Add 7-Phase Workflow Documentation

**Source:** Daniel's PAI - Workflow structure
**Impact:** MEDIUM - Standardizes workflow patterns
**Risk:** LOW - Documentation only
**Effort:** LOW - Single template file

**What Changes:**
- Add `skills/CORE/7-phase-workflow.md`
- Document OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN
- Reference from constitution

**Files Created:**
- skills/CORE/7-phase-workflow.md

**Auto-Approvable:** Yes (documentation only)

**Approve?** [Y/n]

---

### 4. [MEDIUM PRIORITY] Expand History Directory Structure

**Source:** Daniel's PAI - History organization
**Impact:** MEDIUM - Better learning capture
**Risk:** LOW - Pure addition
**Effort:** LOW - Directory creation + examples

**What Changes:**
- Create history/{raw-outputs,learnings,sessions,research,execution,upgrades,deprecated}
- Add README.md to each subdirectory
- Move existing history files to appropriate locations

**Files Created:**
- history/*/README.md (7 files)

**Auto-Approvable:** Yes (organizational improvement)

**Approve?** [Y/n]

---

### 5. [LOW PRIORITY] Add Voice Integration Example

**Source:** Daniel's PAI - Voice system
**Impact:** LOW - Optional enhancement
**Risk:** MEDIUM - Requires ElevenLabs API
**Effort:** MEDIUM - New integration

**What Changes:**
- Add voice integration example
- Create voice output formatter
- Add voice IDs to CORE/SKILL.md

**Files Created:**
- tools/voice/speak.ts
- tools/voice/README.md

**Auto-Approvable:** No (external API integration)

**Approve?** [Y/n]

---

## 🚨 Risk Assessment

**Breaking Changes:** None
**Rollback Available:** Yes (all upgrades)
**Backup Strategy:** Automatic backup to history/upgrades/deprecated/

**Recommended Approval:** Approve items 1-4, defer item 5

---

## ⚡ Quick Actions

- `A` - Approve all recommended (items 1-4)
- `C` - Custom selection (choose which to approve)
- `D` - Defer all (save for later review)
- `V` - View full details for any item
```

---

### 7. Save Analysis Results

**Output Location:**
```
${PAI_DIR}/history/upgrades/analyses/YYYY-MM-DD-HHMMSS_analysis.json
```

**File Format:**
```json
{
  "analysis_id": "UUID",
  "analysis_date": "2025-01-01T14:00:00Z",
  "scan_id": "abc123",
  "pai_state_snapshot": {
    "skills_count": 36,
    "hooks_count": 60,
    "constitution_version": "2.0"
  },
  "gaps_identified": [
    {
      "gap_type": "missing_pattern",
      "description": "24 skills missing 'use when' triggers",
      "impact": "high"
    }
  ],
  "suggestions": [
    { ... full suggestion objects ... }
  ],
  "priority_ranking": [
    { "suggestion_id": "...", "priority_score": 20 },
    { "suggestion_id": "...", "priority_score": 18 }
  ],
  "auto_approvable_count": 2,
  "requires_review_count": 3
}
```

---

## Validation

**Analysis successful when:**

✅ Scan results loaded successfully
✅ Current PAI state snapshot created
✅ Gaps identified for all high-priority findings
✅ Suggestions generated with complete metadata
✅ Priority ranking calculated
✅ Approval prompt formatted
✅ Analysis results saved to history
✅ User presented with clear recommendations

**If analysis fails:**
- Check scan results file exists
- Verify PAI directory structure intact
- Review git status for uncommitted changes
- Check file permissions
- Retry with `--verbose` flag

---

## Output Examples

### Console Output:

```
🔄 Analyzing scan results...

📊 Loaded scan: 2025-01-01 (23 findings)
📂 Current PAI state: 36 skills, 60 hooks, 5 agents

🔍 Identifying gaps...
  ✓ Found 5 gaps in current implementation
  ✓ Matched to source findings

💡 Generating improvement suggestions...
  ✓ Created 5 suggestions
  ✓ Scored impact/risk/effort
  ✓ Ranked by priority

📋 Analysis complete!

Top 5 Recommendations:
  1. [HIGH] Add "use when" triggers (Impact: HIGH, Risk: LOW, Effort: MEDIUM)
  2. [HIGH] Create upgrade skill (Impact: HIGH, Risk: MEDIUM, Effort: HIGH)
  3. [MEDIUM] Add 7-phase workflow (Impact: MEDIUM, Risk: LOW, Effort: LOW)
  4. [MEDIUM] Expand history structure (Impact: MEDIUM, Risk: LOW, Effort: LOW)
  5. [LOW] Add voice integration (Impact: LOW, Risk: MEDIUM, Effort: MEDIUM)

💾 Saved analysis: history/upgrades/analyses/2025-01-01-140000_analysis.json

➡️ Next: Review suggestions and approve upgrades
   Run: bun run upgrade-cli --apply
```

---

## Advanced Analysis Features

### Dependency Detection

```typescript
function detectDependencies(suggestion: ImprovementSuggestion): string[] {
  const dependencies: string[] = [];

  // Check if suggestion requires other changes first
  if (suggestion.title.includes("workflow") && !hasSkill("upgrade")) {
    dependencies.push("upgrade-skill");
  }

  if (suggestion.implementation.files_to_modify.includes("CONSTITUTION.md")) {
    dependencies.push("constitution-backup");
  }

  return dependencies;
}
```

### Conflict Detection

```typescript
function detectConflicts(suggestions: ImprovementSuggestion[]): Conflict[] {
  const conflicts: Conflict[] = [];

  // Check if multiple suggestions modify same files
  const fileMap = new Map<string, string[]>();

  suggestions.forEach(s => {
    s.implementation.files_to_modify.forEach(file => {
      if (!fileMap.has(file)) fileMap.set(file, []);
      fileMap.get(file)!.push(s.id);
    });
  });

  fileMap.forEach((suggestionIds, file) => {
    if (suggestionIds.length > 1) {
      conflicts.push({
        type: "file_modification_conflict",
        file,
        suggestions: suggestionIds,
        resolution: "Apply sequentially or merge changes"
      });
    }
  });

  return conflicts;
}
```

---

## Performance Notes

**Expected Duration:**
- Load scan results: <1 second
- Build PAI state snapshot: 2-5 seconds
- Gap analysis: 5-10 seconds (23 findings)
- Generate suggestions: 3-5 seconds
- Total: ~15-20 seconds

**Resource Usage:**
- Memory: ~50-100 MB
- CPU: Moderate (file I/O and JSON parsing)
- Storage: ~100-500 KB per analysis file

---

## Troubleshooting

**Issue:** "No scan results found"
**Fix:** Run `upgrade-cli --scan-only` first

**Issue:** "PAI state snapshot incomplete"
**Fix:** Check directory structure, run `upgrade-cli --verify-structure`

**Issue:** "Gap analysis found 0 gaps"
**Fix:** May be normal if PAI already implements all findings

**Issue:** "Priority scores all equal"
**Fix:** Review impact/risk/effort scoring logic, may need adjustment

---

**END OF WORKFLOW**
