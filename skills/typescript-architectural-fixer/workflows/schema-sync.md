# Schema Synchronization Workflow

## Purpose
Automatically synchronize database schema with TypeScript types to fix TS2339/TS2551 errors.

## When to Use
- After database schema changes
- When properties "do not exist" on database result types
- When Drizzle ORM types are out of sync

## Workflow Steps

### Step 1: Regenerate Types from Schema
```bash
# Generate migrations and update types
npm run db:generate

# Or push schema directly (dev only)
npm run db:push
```

### Step 2: Verify Schema Exports
```typescript
// drizzle/schema/index.ts
// Ensure ALL tables are exported
export * from './tables';
export * from './types';

// Export inferred types
export type {
  UserSelectType,
  UserInsertType
} from './inferred-types';
```

### Step 3: Replace Manual Types
```typescript
// BEFORE: Manual interface definitions
interface User {
  id: string;
  email: string;
  name: string;
}

// AFTER: Auto-generated from schema
import { users } from '@/drizzle/schema';
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Step 4: Add Runtime Validation
```typescript
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '@/drizzle/schema';

// Auto-generate Zod schemas from Drizzle schema
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Use in API routes
export async function POST(req: NextRequest) {
  const result = insertUserSchema.safeParse(await req.json());
  if (!result.success) {
    return NextResponse.json(result.error, { status: 400 });
  }
  const validatedData = result.data; // Fully typed
  // Process...
}
```

### Step 5: Update tsconfig Paths
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/drizzle/*": ["./drizzle/*"]
    }
  },
  "include": ["src/**/*", "drizzle/**/*", "next-env.d.ts"]
}
```

## Validation
- ✅ Run `npm run db:generate` succeeds
- ✅ All schema tables are exported in index files
- ✅ TypeScript compilation passes
- ✅ No TS2339/TS2551 errors remain
- ✅ Runtime validation works with drizzle-zod

## Automation Rate
**95%** - Fully automated with Drizzle ORM's type generation

## Success Metrics
- Schema changes automatically update types
- Zero manual type maintenance required
- Runtime validation matches compile-time types
