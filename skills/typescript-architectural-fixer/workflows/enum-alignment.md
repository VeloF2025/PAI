# Enum Alignment Workflow

## Purpose
Fix TS2322 errors caused by enum value mismatches between database and TypeScript definitions.

## When to Use
- When database enum values don't match TypeScript enum definitions
- When "Type not assignable" errors occur with enum fields
- After database schema changes that modify enum values

## Workflow Steps

### Step 1: Extract Database Enum Values

Create `scripts/extract-db-enums.js`:

```javascript
import { db } from '../src/lib/db/index.js';
import { sql } from 'drizzle-orm';
import fs from 'fs';

async function extractEnums() {
  // PostgreSQL query to get all enum types
  const result = await db.execute(sql`
    SELECT t.typname as enum_name,
           string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) as enum_values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typtype = 'e'
    GROUP BY t.typname
    ORDER BY t.typname;
  `);

  const enums = {};
  for (const row of result.rows) {
    enums[row.enum_name] = row.enum_values.split(',');
  }

  // Write to file for reference
  fs.writeFileSync(
    'scripts/database-enums.json',
    JSON.stringify(enums, null, 2)
  );

  console.log('Database enums extracted:', enums);
  return enums;
}

extractEnums().catch(console.error);
```

### Step 2: Convert String Enums to Const Tuples

```typescript
// BEFORE: String enum that drifts from database
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// Database actually has: ['admin', 'user', 'moderator', 'guest']
// ❌ Mismatch causes TS2322 errors

// AFTER: Single source of truth
export const userRoleValues = ['admin', 'user', 'moderator', 'guest'] as const;
export type UserRole = typeof userRoleValues[number];

// Use in schema
import { pgEnum } from 'drizzle-orm/pg-core';
export const userRoleEnum = pgEnum('user_role', userRoleValues);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  role: userRoleEnum('role').notNull(),
});
```

### Step 3: Generate Type Guards

```typescript
// Auto-generate type guard for runtime validation
export function isValidUserRole(value: unknown): value is UserRole {
  return (
    typeof value === 'string' &&
    userRoleValues.includes(value as UserRole)
  );
}

// Use in API routes
export async function POST(req: NextRequest) {
  const { role } = await req.json();

  if (!isValidUserRole(role)) {
    return NextResponse.json(
      { error: `Invalid role: ${role}` },
      { status: 400 }
    );
  }

  // role is now typed as UserRole
  await createUser({ role });
}
```

### Step 4: Create Zod Schemas with Enums

```typescript
import { z } from 'zod';

// Zod schema from const tuple
export const userRoleSchema = z.enum(userRoleValues);

// Integrate with drizzle-zod
import { createInsertSchema } from 'drizzle-zod';

export const insertUserSchema = createInsertSchema(users, {
  role: userRoleSchema, // Override with explicit enum validation
});

// Use in validation
export async function POST(req: NextRequest) {
  const result = insertUserSchema.safeParse(await req.json());

  if (!result.success) {
    return NextResponse.json(result.error, { status: 400 });
  }

  const validatedData = result.data; // Fully typed and validated
}
```

### Step 5: Batch Update All Enum Usages

Create `scripts/align-enums.js`:

```javascript
import fs from 'fs';
import path from 'path';

// Map of old enum to new const tuple
const enumMappings = {
  'UserRole': {
    values: ['admin', 'user', 'moderator', 'guest'],
    replacement: 'userRoleValues'
  },
  'TaskStatus': {
    values: ['pending', 'in_progress', 'done', 'cancelled'],
    replacement: 'taskStatusValues'
  }
  // Add more mappings
};

function replaceEnumDeclarations(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [enumName, config] of Object.entries(enumMappings)) {
    // Replace enum declaration with const tuple
    const enumPattern = new RegExp(
      `enum\\s+${enumName}\\s*{[^}]+}`,
      'g'
    );

    const constTuple = `export const ${config.replacement} = [${config.values.map(v => `'${v}'`).join(', ')}] as const;\nexport type ${enumName} = typeof ${config.replacement}[number];`;

    if (enumPattern.test(content)) {
      content = content.replace(enumPattern, constTuple);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Process all TypeScript files
function processDirectory(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !['node_modules', 'dist', '.next'].includes(file)) {
      processDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      replaceEnumDeclarations(fullPath);
    }
  });
}

processDirectory('./src');
```

## Validation
- ✅ Database enum values extracted and documented
- ✅ String enums replaced with const tuples
- ✅ Type guards generated for runtime validation
- ✅ Zod schemas created for API validation
- ✅ No TS2322 errors on enum assignments
- ✅ Single source of truth for enum values

## Automation Rate
**85%** - Enum detection and replacement highly automated, manual review recommended

## Success Metrics
- Zero enum type mismatch errors
- Runtime validation prevents invalid enum values
- Schema and TypeScript types stay in sync automatically
