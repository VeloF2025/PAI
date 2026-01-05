# Hybrid Tiered Workflow - TypeScript Error Fixing

**Use When**: 50-200 errors (or 200+ errors with mixed complexity)
**Strategy**: Safe errors in parallel, risky ones sequential
**Time**: ~30-45 minutes
**Automation**: 85-90%

## Overview

This workflow divides errors into 3 tiers based on risk and automation potential:

- **Tier 1 (Safe)**: High automation rate (>95%), low regression risk - PARALLEL
- **Tier 2 (Medium)**: Medium automation (80-95%), some complexity - SEQUENTIAL
- **Tier 3 (Complex)**: Low automation (<80%), architectural issues - HUMAN REVIEW

## Tier Classification

### Tier 1: Safe Errors (Parallel Execution) ✅
**Error Types**:
- TS2307 (Module not found) - 100% automated
- TS2352 (Type conversion) - 99% automated
- TS2305 (Missing exports) - 95% automated

**Characteristics**:
- Mechanical fixes with clear patterns
- Minimal code context needed
- Low regression risk
- File changes are isolated

**Example Count**: ~159 errors in typical codebase

### Tier 2: Medium Errors (Sequential Execution) ⚡
**Error Types**:
- TS2339 (Property missing) - 95% automated
- TS2322 (Type assignment) - 90% automated
- TS2551 (Property typo) - 90% automated
- TS2304 (Undefined variable) - 80% automated
- TS2345 (Argument mismatch) - 85% automated
- TS2554 (Wrong arg count) - 85% automated

**Characteristics**:
- Require understanding of type relationships
- May affect multiple files
- Need verification of dependent code
- Some architectural consideration

**Example Count**: ~277 errors in typical codebase

### Tier 3: Complex Errors (Human Review Queue) 🚨
**Error Types**:
- TS2769 (No overload matches) - 70% automated
- TS2448 (Variable before declaration) - 60% automated
- TS2454 (Variable used before assigned) - 60% automated
- Custom types requiring design decisions

**Characteristics**:
- Require architectural understanding
- Multiple valid solutions exist
- Risk of breaking API contracts
- May indicate deeper design issues

**Example Count**: ~107 errors in typical codebase

## Execution Flow

### Pre-Execution Setup

```bash
# 1. Get baseline error count
tsc --noEmit 2>&1 | grep "error TS" | wc -l

# 2. Categorize errors by tier
tsc --noEmit 2>&1 | grep "error TS" > all-errors.txt

# 3. Create tier-specific files
grep "TS2307\|TS2352\|TS2305" all-errors.txt > tier1-errors.txt
grep "TS2339\|TS2322\|TS2551\|TS2304\|TS2345\|TS2554" all-errors.txt > tier2-errors.txt
grep "TS2769\|TS2448\|TS2454" all-errors.txt > tier3-errors.txt
```

### Phase 1: Tier 1 Parallel Execution (15-20 minutes)

**Launch 4 parallel agents** with file-based partitioning:

```bash
# Agent 1: Type definition files
Agent focuses on: */types/*.ts, *.types.ts, */interfaces/*.ts

# Agent 2: Component files
Agent focuses on: */components/**/*.tsx, */ui/**/*.tsx

# Agent 3: Service files
Agent focuses on: */services/**/*.ts, */lib/**/*.ts

# Agent 4: API route files
Agent focuses on: */api/**/*.ts, */routes/**/*.ts
```

**Agent Instructions**:
1. Read assigned tier1-errors.txt subset
2. For each error in assigned files:
   - Load error pattern from error-patterns/
   - Read current file content
   - Apply fix using Write tool (atomic rewrite)
   - Verify fix: `tsc --noEmit 2>&1 | grep <filename>`
   - Log result: PASS/FAIL + new error count
3. Report: Errors fixed, regressions, time taken

**Conflict Resolution**:
- If two agents need same file: First agent locks it, second waits
- Type definition changes always execute BEFORE usage changes
- Shared file modifications serialized automatically

**Verification After Phase 1**:
```bash
# Check total reduction
tsc --noEmit 2>&1 | grep "error TS" | wc -l

# If regression detected (count increased):
git diff --stat  # Review all changes
git checkout -- <problematic-files>  # Rollback if needed
```

### Phase 2: Tier 2 Sequential Execution (10-15 minutes)

**Single agent** processes medium-risk errors one at a time:

```bash
# Process tier2-errors.txt line by line
for error in $(cat tier2-errors.txt); do
  # 1. Analyze error context
  # 2. Load appropriate error pattern
  # 3. Apply fix with Write tool
  # 4. Immediate verification
  # 5. Rollback if regression
  # 6. Continue to next
done
```

**Agent Instructions**:
1. Read tier2-errors.txt
2. Sort errors by file (process same file together)
3. For each error:
   - Analyze type relationships
   - Check for dependent files
   - Apply fix (Write tool)
   - Verify: `tsc --noEmit 2>&1 | grep <filename>`
   - If new errors appear: ROLLBACK immediately
4. Report progress every 10 errors

**Safety Protocol**:
- **Before each fix**: Record current error count
- **After each fix**: Verify count decreased by 1
- **If count same**: Log as "unable to fix"
- **If count increased**: ROLLBACK + add to Tier 3

### Phase 3: Tier 3 Human Review Queue (5 minutes)

**Generate human review report**:

```markdown
# TypeScript Errors Requiring Human Review

## Summary
- Total Complex Errors: 107
- Automated Attempts: 22 (20.6%)
- Pending Review: 85 (79.4%)

## By Error Type

### TS2769: No Overload Matches (51 errors)
**File**: src/components/admin/ApiMonitoringInterface.tsx
**Line**: 145
**Error**: No overload matches this call
**Context**:
\`\`\`typescript
const result = complexFunction(arg1, arg2, arg3, arg4)
\`\`\`
**Recommendation**: Check function signature - may need type assertion or argument restructuring
**Priority**: HIGH

[... continue for all Tier 3 errors ...]
```

**Agent Instructions**:
1. List all Tier 3 errors not automatically fixed
2. Group by error type and file
3. For each error:
   - Show 5 lines of context
   - Explain why automation failed
   - Suggest 2-3 potential solutions
   - Assign priority (HIGH/MEDIUM/LOW)
4. Output to `HUMAN_REVIEW_QUEUE.md`

## Post-Execution Verification

### Final Error Count
```bash
# Get final state
FINAL=$(tsc --noEmit 2>&1 | grep "error TS" | wc -l)

# Calculate metrics
INITIAL=658  # Starting count
FIXED=$(($INITIAL - $FINAL))
PERCENTAGE=$((FIXED * 100 / INITIAL))

echo "Fixed: $FIXED errors ($PERCENTAGE%)"
echo "Remaining: $FINAL errors"
```

### Accountability Report

Generate comprehensive session report:

```markdown
# TypeScript Error Fixing Session - Hybrid Tiered Workflow

**Date**: 2025-01-15
**Duration**: 42 minutes
**Workflow**: Hybrid Tiered
**Model**: Haiku 4.5

## Summary
- **Starting Errors**: 658
- **Ending Errors**: 98
- **Fixed**: 560 (85.1%)
- **Regressions**: 8 (1.2%)
- **Net Reduction**: 552 (83.9%)

## Phase Results

### Phase 1: Tier 1 Parallel (20 minutes)
- **Agents**: 4 parallel
- **Errors Fixed**: 159/159 (100%)
- **Regressions**: 2 (1.3%)
- **Net Reduction**: 157 errors

**By Agent**:
| Agent | Files | Errors | Fixed | Time |
|-------|-------|--------|-------|------|
| Type Definitions | 23 | 45 | 44 | 18m |
| Components | 67 | 52 | 51 | 19m |
| Services | 34 | 38 | 38 | 17m |
| API Routes | 18 | 24 | 24 | 15m |

### Phase 2: Tier 2 Sequential (15 minutes)
- **Errors Fixed**: 239/277 (86.3%)
- **Regressions**: 6 (2.5%)
- **Unable to Fix**: 38 (moved to Tier 3)
- **Net Reduction**: 233 errors

### Phase 3: Tier 3 Human Review (7 minutes)
- **Total Complex Errors**: 107 + 38 (from Tier 2) = 145
- **Automated**: 22 (15.2%)
- **Pending Human Review**: 123 (84.8%)

## By Error Type
| Code | Before | After | Fixed | Rate | Tier |
|------|--------|-------|-------|------|------|
| TS2307 | 29 | 0 | 29 | 100% | T1 |
| TS2352 | 115 | 3 | 112 | 97.4% | T1 |
| TS2305 | 15 | 0 | 15 | 100% | T1 |
| TS2339 | 172 | 35 | 137 | 79.7% | T2 |
| TS2322 | 84 | 12 | 72 | 85.7% | T2 |
| TS2551 | 28 | 4 | 24 | 85.7% | T2 |
| TS2769 | 51 | 37 | 14 | 27.5% | T3 |

## Files Modified (Top 20)
1. src/types/admin.ts - 18 errors fixed
2. src/components/admin/ApiMonitoringInterface.tsx - 15 errors fixed
3. src/services/lms/study-groups.service.ts - 12 errors fixed
[... continue ...]

## Regressions (8 total)
1. **src/types/admin.ts:45** - Added property conflict
   - Fix: Manual type merge required
   - Agent: Type Definitions Agent
2. **src/components/dashboard/MetricsCard.tsx:89** - Type widening
   - Fix: Add explicit type annotation
   - Agent: Components Agent

## Human Review Queue (123 errors)
See `HUMAN_REVIEW_QUEUE.md` for details

### By Priority
- **HIGH**: 37 errors (architectural changes needed)
- **MEDIUM**: 56 errors (complex type inference)
- **LOW**: 30 errors (optional improvements)

## Recommendations
1. ✅ Commit Tier 1 + Tier 2 fixes immediately (395 errors resolved)
2. ⚠️ Review and fix 8 regressions before commit
3. 📋 Address HIGH priority human review items (37 errors)
4. 📊 Consider architectural refactor for TS2769 errors (37 remaining)

## Next Steps
1. Manual fix for 8 regressions (~10 minutes)
2. Commit Phase 1+2 fixes
3. Create GitHub issues for HIGH priority review items
4. Schedule refactor session for Tier 3 architectural issues
```

## Success Criteria

A hybrid tiered session is successful when:
- ✅ Tier 1: >95% automation rate
- ✅ Tier 2: >80% automation rate
- ✅ Overall: >85% total errors fixed
- ✅ Regressions: <3% of fixes
- ✅ Time: <45 minutes total
- ✅ Human review queue generated with priorities

## Rollback Protocol

### When to Rollback
- Regression rate >5%
- Critical functionality broken
- Test suite failures >10%
- Build completely fails

### How to Rollback
```bash
# Check git status
git status

# Review changes
git diff --stat

# Rollback specific files
git checkout -- <file1> <file2> ...

# Or rollback entire session
git reset --hard HEAD

# Re-run verification
tsc --noEmit
```

## Tips for Optimization

1. **Increase Tier 1 Parallelization**: Use 6-8 agents if >300 safe errors
2. **Batch Tier 2 by File**: Process all errors in same file together
3. **Early Tier 3 Detection**: Move errors to Tier 3 after 2 failed attempts
4. **Dependency Ordering**: Always fix type definitions before usages
5. **Incremental Commits**: Commit after each phase for safety

---

*This workflow balances speed (parallel Tier 1) with safety (sequential Tier 2) and practicality (human review Tier 3)*
