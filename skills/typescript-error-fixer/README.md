---
name: typescript-error-fixer
description: |
  Specialized agent for automatically fixing TypeScript compilation errors.
  Handles 15+ error types with 85%+ automation rate. Supports parallel execution
  for large codebases with conflict resolution and verification.

  USE WHEN user says 'fix typescript errors', 'fix ts errors', 'tsc errors',
  'typescript compilation failed', or when CI/CD shows TS compilation failures.
---

# TypeScript Error Fixer

**Purpose:** Automatically resolve TypeScript compilation errors using pattern-based fixes with verification and accountability.

**Model Recommendation:** Haiku 4.5 (optimal speed/cost balance for code fixes)

## Core Capabilities

### Supported Error Types (Automation Rates)
- **TS2307** (Module not found) - 100% automated
- **TS2352** (Type conversion) - 99% automated
- **TS2305** (Missing exports) - 95% automated
- **TS2339** (Property missing) - 95% automated
- **TS2322** (Type assignment) - 90% automated
- **TS2551** (Property typo) - 90% automated
- **TS2304** (Undefined variable) - 80% automated
- **TS2345** (Argument mismatch) - 85% automated
- **TS2554** (Wrong arg count) - 85% automated
- **TS2769** (No overload matches) - 70% automated
- **TS2448/TS2454** (Variable before declaration) - 60% automated

### Performance Metrics
- **Speed**: <30 seconds per error average
- **Accuracy**: <5% regression rate
- **Scale**: 500+ errors in <45 minutes (parallel execution)

## Activation Triggers

The skill activates when user:
1. Says "fix typescript errors" or "fix ts errors"
2. Shows `tsc --noEmit` output with errors
3. Reports CI/CD TypeScript compilation failures
4. Requests "clean up type errors"

## Workflow Selection

Based on error count and risk tolerance:

### Small Batch (<50 errors)
**Route to:** `workflows/sequential-fix.md`
**Strategy:** One error at a time with immediate verification
**Time:** ~15-25 minutes

### Medium Batch (50-200 errors)
**Route to:** `workflows/hybrid-tiered.md`
**Strategy:** Safe errors in parallel, risky ones sequential
**Time:** ~30-45 minutes

### Large Batch (>200 errors)
**Route to:** `workflows/parallel-execution.md`
**Strategy:** Multi-agent parallel with conflict resolution
**Time:** ~45-60 minutes

## Tool Requirements

### Essential Tools
- **Read**: Load TypeScript files and type definitions
- **Write**: Create/update files with fixes
- **Grep**: Search for type definitions and usages
- **Bash**: Run `tsc --noEmit` for verification

### Optional Tools
- **Glob**: Find related TypeScript files
- **Edit**: Make surgical edits (prefer Write for atomicity)

## Error Pattern Library

Progressive disclosure - load only when needed:

### Always Loaded
- Error type detection logic
- Fix strategy selection
- Verification protocol

### Load on Demand
- `error-patterns/TS2339-property-missing.md` (172 errors)
- `error-patterns/TS2352-type-conversion.md` (115 errors)
- `error-patterns/TS2322-type-assignment.md` (84 errors)
- `error-patterns/TS2769-overload-mismatch.md` (51 errors)
- `error-patterns/catch-block-errors.md` (TS2448, TS2454)

## Fix Application Protocol

### Step 1: Analyze Error
```bash
# Get error details from tsc output
tsc --noEmit 2>&1 | grep "error TS" > errors.txt

# Example error:
# src/types/admin.ts(17,10): error TS2339: Property 'requests' does not exist on type 'ApiMetrics'.
```

### Step 2: Load Pattern
Based on error code (e.g., TS2339), load corresponding pattern from `error-patterns/`

### Step 3: Apply Fix
Use **Write** tool to create corrected file (atomic operation)

**CRITICAL**: Never use Edit tool for TypeScript fixes - always rewrite entire file for:
- Atomicity (no partial updates)
- Parallel execution safety
- Easy rollback capability

### Step 4: Verify Fix
```bash
# Immediate verification
tsc --noEmit 2>&1 | grep "src/types/admin.ts"

# Should show one less error
# If new errors appear, ROLLBACK immediately
```

### Step 5: Log Result
```json
{
  "file": "src/types/admin.ts",
  "line": 17,
  "errorCode": "TS2339",
  "fixApplied": "Added 'requests: number' property to ApiMetrics interface",
  "verification": "PASS",
  "newErrorsIntroduced": 0
}
```

## Safety Guardrails

### Never Modify
- `node_modules/**` - Third-party code
- `*.test.ts` or `*.spec.ts` - Test files (fix source instead)
- `.next/**` or `dist/**` - Build artifacts

### Always Verify
```bash
# Before fix
BEFORE=$(tsc --noEmit 2>&1 | grep "error TS" | wc -l)

# Apply fix
# ... fix code ...

# After fix
AFTER=$(tsc --noEmit 2>&1 | grep "error TS" | wc -l)

# Validation
if [ $AFTER -ge $BEFORE ]; then
  echo "REGRESSION DETECTED - Rolling back"
  git checkout -- <file>
  exit 1
fi
```

### Rollback Triggers
- New errors introduced (regression)
- Existing errors not fixed
- Test suite failures
- Build failures

## Parallel Execution Safety

### File Locking
Only one agent modifies a file at a time. Use file-based partitioning:
```
Agent 1: Type definition files (*.types.ts, */types/*.ts)
Agent 2: Component files (*/components/**/*.tsx)
Agent 3: Service files (*/services/**/*.ts)
Agent 4: API routes (*/api/**/*.ts)
```

### Conflict Resolution
If two agents modify related files (e.g., type definition + usage):
1. Execute type definition fixes FIRST
2. Then execute usage fixes
3. Run dependency graph analysis to determine order

### Verification After Merge
```bash
# After all parallel agents complete
tsc --noEmit 2>&1 > final-errors.txt

# Verify total reduction
INITIAL=658  # Starting error count
FINAL=$(grep "error TS" final-errors.txt | wc -l)
FIXED=$(($INITIAL - $FINAL))

echo "Fixed: $FIXED errors ($((FIXED * 100 / INITIAL))%)"
```

## Accountability Report

Generate after every session:

```markdown
# TypeScript Error Fixing Session

**Date**: 2025-01-15
**Duration**: 45 minutes
**Agent**: typescript-error-fixer

## Summary
- Starting Errors: 658
- Ending Errors: 98
- Fixed: 560 (85.1%)
- Regressions: 12 (2.1%)
- Net Reduction: 548 (83.3%)

## By Error Type
| Code   | Before | After | Fixed | Rate   |
|--------|--------|-------|-------|--------|
| TS2307 | 29     | 0     | 29    | 100%   |
| TS2352 | 115    | 5     | 110   | 95.7%  |
| TS2339 | 172    | 35    | 137   | 79.7%  |

## Files Modified
1. src/types/admin.ts - Added 8 properties
2. src/components/admin/ApiMonitoringInterface.tsx - Fixed 12 errors
... (full list in appendix)

## Regressions
1. src/types/admin.ts:45 - Property conflict
   **Action**: Manual merge required

## Human Review Queue (98 errors)
- TS2769: 22 errors (complex overloads)
- TS2339: 35 errors (architectural issues)
... (full list in appendix)
```

## Success Criteria

A session is successful when:
- ✅ Error count reduced by >80%
- ✅ Regression rate <5%
- ✅ All fixes verified with tsc
- ✅ No test suite failures
- ✅ Accountability report generated

## Example Usage

```bash
# User: "Fix TypeScript errors in this codebase"

# Agent workflow:
1. Run tsc --noEmit to get error count (658 errors)
2. Categorize by error type
3. Route to workflows/hybrid-tiered.md
4. Execute Tier 1: Safe errors in parallel (4 agents)
5. Execute Tier 2: Medium errors sequential
6. Generate human review queue for Tier 3
7. Verify final state (98 errors remaining)
8. Create accountability report
9. Report: "Fixed 560/658 errors (85.1%) in 45 minutes"
```

## When to Escalate

Flag for human review:
- Architectural changes required
- Breaking API changes
- Circular type dependencies
- Generic type inference failures
- Complex overload resolution

---

*For detailed error patterns and fix strategies, see `error-patterns/` directory.*
*For execution workflows, see `workflows/` directory.*
