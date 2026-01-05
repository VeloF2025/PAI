# TypeScript Architectural Error Fixer Agent

## 🎯 Purpose

Specialized AI agent for fixing architectural TypeScript errors in large codebases (500+ errors). Focuses on schema mismatches, missing exports, enum alignment, and error handling patterns in Next.js + Drizzle ORM projects.

## 📋 Activation Triggers

**Automatic Activation:**
- When TypeScript error count > 100 with architectural patterns (TS2304, TS2339, TS2322, TS2769)
- When database schema changes cause type mismatches
- When enum values diverge between database and TypeScript
- When catch blocks have undefined error references (TS2448/TS2454)

**Manual Activation:**
- User says: "fix architectural TypeScript errors"
- User says: "sync database schema with types"
- User says: "fix enum mismatches"
- User says: "fix catch block errors"

## 🧠 Agent Architecture (Multi-Tier)

### Tier 1: Parser Agent (75% Confidence)
**Responsibility:** Analyze error signatures and categorize by fix complexity

**Actions:**
1. Run `npx tsc --noEmit` and capture all errors
2. Parse error codes, file paths, and line numbers
3. Classify errors by category:
   - Schema mismatches (TS2339, TS2551)
   - Missing exports (TS2304)
   - Enum misalignment (TS2322)
   - Catch block issues (TS2448, TS2454)
   - Overload mismatches (TS2769)
4. Generate error distribution report
5. Identify root cause patterns (schema drift, missing types, etc.)

**Output:** Categorized error list with complexity scores

### Tier 2: Analyzer Agent (80% Confidence)
**Responsibility:** Determine root causes and fix strategies

**Actions:**
1. Analyze schema files vs type definitions
2. Detect enum value mismatches
3. Identify missing schema exports
4. Check tsconfig.json path mappings
5. Validate Drizzle ORM configuration
6. Recommend fix strategies by category

**Output:** Root cause analysis with recommended fix patterns

### Tier 3: Fixer Agent (85% Confidence)
**Responsibility:** Implement automated fixes with type safety

**Actions:**
1. **Schema Sync Fixes:**
   - Run `npm run db:generate` to regenerate types
   - Add missing schema exports to index files
   - Update tsconfig paths if needed

2. **Enum Alignment Fixes:**
   - Extract enum values to `as const` tuples
   - Create type guards for runtime validation
   - Update schema to use shared enum definitions

3. **Catch Block Fixes:**
   - Run batch script to fix all catch blocks: `catch (error: unknown)`
   - Add type guards: `error instanceof Error`
   - Replace undefined error references

4. **Missing Export Fixes:**
   - Add missing imports to files
   - Export types from schema index files
   - Fix module resolution issues

5. **Type Assertion Fixes:**
   - Use proper type guards instead of assertions
   - Add runtime validation with Zod
   - Fix query builder type mismatches

**Output:** Fixed files with zero regressions

### Tier 4: Validator Agent (90% Confidence)
**Responsibility:** Verify fixes don't break related code

**Actions:**
1. Run `npx tsc --noEmit` to verify error reduction
2. Run `npm run lint` to check for new issues
3. Execute test suite: `npm test`
4. Validate build succeeds: `npm run build`
5. Check for regressions (new errors introduced)
6. Generate validation report

**Output:** Validation status with error reduction metrics

## 🔧 Fix Patterns (From Research)

### Pattern 1: Schema Sync (TS2339/TS2551)

```typescript
// BEFORE: Manual type definitions drift from schema
interface User {
  id: string;
  email: string;
  // Missing: firstName, lastName, createdAt
}

// AFTER: Auto-generated from Drizzle schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Runtime validation with drizzle-zod
import { createInsertSchema } from 'drizzle-zod';
export const insertUserSchema = createInsertSchema(users);
```

**Automation:**
```bash
# Step 1: Regenerate types from schema
npm run db:generate

# Step 2: Replace manual types with inferred types
# Use jscodeshift to replace interface definitions

# Step 3: Add runtime validation
# Import and use drizzle-zod schemas
```

### Pattern 2: Enum Alignment (TS2322)

```typescript
// BEFORE: String enums diverge from database
enum Status {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

// Database has: 'pending', 'in_progress', 'done' (mismatch!)

// AFTER: Single source of truth
const statusValues = ['pending', 'in_progress', 'done'] as const;
export type Status = typeof statusValues[number];

// Schema uses the same values
export const tasks = pgTable('tasks', {
  status: pgEnum('status', statusValues).notNull(),
});

// Type guard for validation
export function isValidStatus(value: unknown): value is Status {
  return statusValues.includes(value as Status);
}
```

**Automation:**
```bash
# Step 1: Extract enum values from database
# Query database for enum types

# Step 2: Replace string enums with const tuples
# Use ts-morph to transform enum declarations

# Step 3: Add type guards
# Generate validation functions automatically
```

### Pattern 3: Catch Block Fixes (TS2448/TS2454)

```typescript
// BEFORE: Undefined error references
try {
  await riskyOperation();
} catch (err) {
  console.log(error.message); // TS2454: error is not defined
}

// AFTER: Proper error typing
try {
  await riskyOperation();
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(error.message);
  } else {
    console.log(String(error));
  }
}

// Or use utility function
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

try {
  await riskyOperation();
} catch (error) {
  log.error('Operation failed', getErrorMessage(error));
}
```

**Automation:**
```bash
# Batch fix all catch blocks
node scripts/fix-catch-blocks.js
```

**Script:**
```javascript
// scripts/fix-catch-blocks.js
import fs from 'fs';
import path from 'path';

const pattern = /catch\s*\(\s*(\w+)\s*\)\s*{([^}]*)error\.message/g;

function fixCatchBlocks(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixCatchBlocks(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const fixed = content.replace(
        /catch\s*\(\s*(\w+)\s*\)/g,
        'catch (error: unknown)'
      );
      if (content !== fixed) {
        fs.writeFileSync(fullPath, fixed);
        console.log(`Fixed: ${fullPath}`);
      }
    }
  });
}

fixCatchBlocks('./src');
```

### Pattern 4: Missing Exports (TS2304)

```typescript
// BEFORE: Schema exports incomplete
// drizzle/schema/index.ts
export { users, farms } from './tables';
// Missing: projects, tasks, etc.

// AFTER: Complete exports
export * from './tables';
export * from './types';
export type { UserSelectType, FarmSelectType } from './inferred-types';
```

**Automation:**
```bash
# Step 1: Detect all schema tables
grep -r "export const.*= pgTable" drizzle/schema

# Step 2: Verify all are exported in index
# Generate export statements automatically

# Step 3: Update tsconfig paths if needed
```

### Pattern 5: Query Builder Types (TS2769)

```typescript
// BEFORE: Overload mismatch
const result = await db.select()
  .from(users)
  .where(eq(value, users.id)); // ❌ Arguments reversed

// AFTER: Correct argument order
const result = await db.select()
  .from(users)
  .where(eq(users.id, value)); // ✅ Column first, value second

// Type-safe query builder
import { PgSelect } from 'drizzle-orm/pg-core';

function applyFilters(
  query: PgSelect,
  filters: { id?: string }
): PgSelect {
  if (filters.id) {
    return query.where(eq(users.id, filters.id));
  }
  return query;
}
```

## 🚀 Execution Workflow

### Phase 1: Analysis (Parser + Analyzer Agents)
1. Run TypeScript compilation: `npx tsc --noEmit`
2. Categorize errors by type and complexity
3. Identify root causes (schema drift, missing exports, etc.)
4. Generate fix plan with priority order

### Phase 2: Automated Fixes (Fixer Agent)
1. **Schema Sync (High Priority)**
   - Run `npm run db:generate`
   - Update schema exports
   - Regenerate types with drizzle-zod

2. **Catch Block Fixes (Quick Win)**
   - Run batch script for all catch blocks
   - Verify error references are typed

3. **Enum Alignment (Medium Priority)**
   - Extract database enum values
   - Convert string enums to const tuples
   - Add type guards

4. **Missing Exports (Medium Priority)**
   - Generate complete export statements
   - Update tsconfig paths
   - Verify module resolution

5. **Type Assertions (Low Priority)**
   - Replace unsafe assertions with type guards
   - Add runtime validation where needed

### Phase 3: Validation (Validator Agent)
1. Run TypeScript compilation
2. Check error reduction metrics
3. Run linting and tests
4. Verify build succeeds
5. Generate final report

## 📊 Success Metrics

**Target Outcomes:**
- **Error Reduction**: 80-95% of architectural errors fixed
- **Automation Rate**: 85-90% fully automated
- **Regression Rate**: <2% new errors introduced
- **Build Success**: 100% after fixes applied
- **Validation**: All tests passing, zero linting errors

**Quality Gates:**
- ✅ TypeScript compilation succeeds
- ✅ ESLint validation passes
- ✅ Test suite passes (>95% coverage maintained)
- ✅ Build succeeds
- ✅ Zero console.log statements remain
- ✅ Zero void error anti-patterns

## 🛠️ Tools & Scripts

### Required Tools
```bash
# Install if not present
npm install -D @types/node drizzle-kit drizzle-zod
npm install -D jscodeshift ts-morph
```

### Scripts to Create
1. **fix-catch-blocks.js** - Batch fix catch block errors
2. **sync-schema-types.js** - Regenerate types from schema
3. **align-enums.js** - Extract and align enum values
4. **validate-exports.js** - Check schema exports are complete
5. **verify-build.js** - Run full validation suite

## 🎯 Agent Activation Protocol

**When to Activate This Agent:**
1. TypeScript error count > 100 with architectural patterns
2. After database schema changes
3. After major dependency upgrades
4. Before major releases (cleanup technical debt)
5. When manual fixes fail to reduce error count

**Activation Command:**
```
"Fix architectural TypeScript errors using the specialized agent"
```

## 📁 Agent Output Files

**Working Directory:** `C:\Jarvis\AI Workspace\AgriWize\typescript-fixes\YYYY-MM-DD-HHMMSS\`

**Generated Files:**
- `error-analysis.md` - Categorized error breakdown
- `root-cause-report.md` - Root cause analysis
- `fix-plan.md` - Prioritized fix strategy
- `validation-report.md` - Post-fix validation results
- `scripts/` - Generated fix scripts
- `SUMMARY.md` - Final results and metrics

## 🔒 Safety Guardrails

**Pre-Fix Validation:**
- Commit current changes before starting
- Create feature branch for fixes
- Run baseline tests to capture current state

**During Fixes:**
- Apply fixes in batches (50-100 errors at a time)
- Validate after each batch before proceeding
- Track changes for easy rollback

**Post-Fix Validation:**
- Run full validation suite
- Check for regressions
- Review generated code for correctness
- Create PR for human review before merging

## 📚 References

Based on research from:
- Drizzle ORM best practices (2024-2025)
- TypeScript error automation tools (ts-migrate, jscodeshift, ts-morph)
- Next.js 14+ API type safety patterns
- Multi-agent coordination strategies
- Progressive TypeScript adoption (@ts-migrating)

---

**Agent Version:** 1.0
**Last Updated:** 2025-11-15
**Confidence Level:** 85% automation, 90% validation
