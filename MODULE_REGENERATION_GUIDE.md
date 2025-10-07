# Module Regeneration Guide

**Purpose**: Instructions for regenerating broken analytics/import/export modules  
**Date**: 2025-10-06  
**Status**: 916 TypeScript errors requiring module regeneration

---

## 🎯 Problem Statement

Multiple modules in `apps/web/app/(app)/(shell)/` have **structural TypeScript errors** that cannot be fixed with simple edits. These appear to be code-generated files with incorrect type templates.

### Affected Modules

| Module | File | Primary Issues |
|--------|------|----------------|
| **Analytics** | `lib/{api,export,import,mutations}.tsx` | Missing exports, `unknown` spreads, implicit `any` |
| **Companies** | `lib/import.ts` | Malformed async function signatures |
| **Dashboard** | `lib/{crud,export,import,api}.ts` | Generic type errors, missing properties |
| **Files** | `lib/permissions.ts` | Generic syntax errors |
| **Programming** | `lib/{api,permissions}.ts` | Type export issues |
| **Projects** | `lib/api.ts`, `tasks/lib/tasks-service.ts` | Generic type mismatches |

### Error Patterns

1. **Missing Type Exports** (most common)
   ```typescript
   // Error: Module '"./api"' declares 'supabase' locally, but it is not exported
   import { supabase } from './api';
   ```

2. **Unknown Type Spreads**
   ```typescript
   // Error: Spread types may only be created from object types
   return { ...unknownValue };
   ```

3. **Implicit Any Types**
   ```typescript
   // Error: Parameter 'error' implicitly has an 'any' type
   } catch (error) {
   ```

4. **Missing Interface Properties**
   ```typescript
   // Error: Property 'parameters' does not exist on type 'ReportQuery'
   const params = query.parameters;
   ```

---

## 🔍 Investigation Steps

### 1. Identify Code Generator

Check for code generation scripts or templates:

```bash
# Search for generator scripts
find . -name "*generate*" -o -name "*codegen*" -o -name "*scaffold*" | grep -v node_modules

# Check for template files
find . -name "*.template.*" -o -name "*.hbs" -o -name "*.ejs" | grep -v node_modules

# Look for generation config
find . -name "codegen.yml" -o -name ".graphqlrc*" -o -name "openapi.json"
```

### 2. Check Git History

Identify when these files were created:

```bash
# Check creation date and author
git log --diff-filter=A --follow -- apps/web/app/\(app\)/\(shell\)/analytics/lib/api.ts

# Check for batch commits (likely generated)
git log --all --oneline --grep="generate\|codegen\|scaffold" | head -20
```

### 3. Look for Schema Sources

These modules likely derive from:
- **Database schema** (Supabase types)
- **API specification** (OpenAPI/Swagger)
- **GraphQL schema**
- **Internal type definitions**

```bash
# Check for schema files
find . -name "schema.ts" -o -name "types.gen.ts" -o -name "database.types.ts"

# Check Supabase types
ls -la apps/web/types/
```

---

## 🛠️ Regeneration Options

### Option A: Supabase Type Generation

If using Supabase, regenerate types:

```bash
# Install Supabase CLI if needed
pnpm add -D supabase

# Generate types from database
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/web/types/database.types.ts

# Or from local instance
npx supabase gen types typescript --local > apps/web/types/database.types.ts
```

### Option B: OpenAPI/Swagger Generation

If using OpenAPI specs:

```bash
# Install generator
pnpm add -D @openapitools/openapi-generator-cli

# Generate TypeScript client
npx openapi-generator-cli generate \
  -i path/to/openapi.json \
  -g typescript-fetch \
  -o apps/web/lib/generated
```

### Option C: Manual Template Repair

If no generator exists, create proper type templates:

1. **Export shared instances** in `api.ts`:
   ```typescript
   // apps/web/app/(app)/(shell)/analytics/lib/api.ts
   export const supabase = createClient(/* ... */);
   export const performanceTracker = new PerformanceTracker();
   ```

2. **Fix generic type declarations**:
   ```typescript
   // Before: Promise<Type>>
   // After:  Promise<Type>
   
   // Before: Map<K, Promise<V>
   // After:  Map<K, Promise<V>>
   ```

3. **Add proper error typing**:
   ```typescript
   // Before: } catch (error) {
   // After:  } catch (error: unknown) {
   //         const err = error as Error;
   ```

4. **Define missing interface properties**:
   ```typescript
   interface ReportQuery {
     id: string;
     name: string;
     parameters?: Record<string, unknown>; // Add missing property
   }
   ```

---

## ✅ Validation Workflow

### Step 1: Run Health Check

```bash
# Run validation script
pnpm tsx scripts/validate-typescript-health.ts

# Check error count
pnpm tsc --noEmit 2>&1 | grep "error TS" | wc -l
```

### Step 2: Apply Fixes

After regeneration or manual fixes:

```bash
# Remove temporary eslint ignores
# Edit .eslintignore and remove these lines:
# apps/web/app/(app)/(shell)/*/lib/*.ts
# apps/web/app/(app)/(shell)/*/lib/*.tsx
# apps/web/app/(app)/(shell)/*/*/*.tsx
# apps/web/app/(app)/(shell)/*/*/*/*.ts

# Run full lint
pnpm lint:check

# Run TypeScript check
pnpm tsc --noEmit
```

### Step 3: Verify Build

```bash
# Test build
pnpm build

# Run tests
pnpm test
```

---

## 📋 Module-Specific Fixes

### Analytics Module

**Files**: `apps/web/app/(app)/(shell)/analytics/lib/{api,export,import,mutations}.tsx`

**Issues**:
- `supabase` not exported from `./api`
- `performanceTracker` not exported
- Multiple `unknown` type spreads
- Missing `parameters` property on `ReportQuery` interface

**Fix**:
1. Add exports to `api.ts`:
   ```typescript
   export { supabase, performanceTracker };
   ```

2. Update `ReportQuery` interface in `types.ts`:
   ```typescript
   export interface ReportQuery {
     id: string;
     name: string;
     query: string;
     parameters?: Record<string, unknown>; // Add this
     // ... other fields
   }
   ```

3. Fix error handling:
   ```typescript
   } catch (error: unknown) {
     const err = error as Error;
     console.error('Error:', err.message);
   }
   ```

### Companies Module

**Files**: `apps/web/app/(app)/(shell)/companies/lib/import.ts`

**Issues**:
- Malformed async function signatures (line 154)
- Missing closing braces in method declarations

**Fix**: Check for missing `}` or `{` in class methods around line 154.

### Dashboard Module

**Files**: `apps/web/app/(app)/(shell)/dashboard/lib/{crud,export,import,api}.ts`

**Issues**:
- Generic type syntax errors
- Missing `>` in type declarations

**Fix**: Already partially fixed via batch `sed`. Verify remaining issues with:
```bash
pnpm tsc --noEmit 2>&1 | grep "dashboard/lib"
```

---

## 🚀 Quick Win: Batch Generic Fixes

Already applied, but for reference:

```bash
# Fix Promise<Type>>> → Promise<Type>>
find apps/web/app -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | \
  xargs -0 sed -i '' 's/Promise<\([^>]*\)>>>/Promise<\1>>/g'

# Fix Promise<Type>> → Promise<Type>
find apps/web/app -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | \
  xargs -0 sed -i '' 's/Promise<\([^>]*\)>>/Promise<\1>/g'

# Fix Map declarations
find apps/web/app -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | \
  xargs -0 sed -i '' -E 's/: Map<([^<>]+), ([^<>]+<[^<>]+)> =/: Map<\1, \2>> =/g'
```

---

## 📊 Progress Tracking

Use the validation script to track progress:

```bash
# Before fixes
pnpm tsx scripts/validate-typescript-health.ts
# Output: 916 errors

# After each fix batch
pnpm tsx scripts/validate-typescript-health.ts
# Track error reduction

# Target: 0 errors
```

---

## 🎯 Success Criteria

- ✅ `pnpm tsc --noEmit` exits with code 0
- ✅ `pnpm lint:check` passes with no errors
- ✅ `pnpm build` completes successfully
- ✅ All modules removed from `.eslintignore`
- ✅ TypeScript health score > 95

---

## 📞 Need Help?

If regeneration is unclear:

1. **Check package.json scripts** for generation commands
2. **Review README** for setup/generation instructions
3. **Check CI/CD config** (`.github/workflows/`) for build steps
4. **Search codebase** for "generate" or "codegen" comments

---

**Last Updated**: 2025-10-06 22:29 EST  
**Validation Script**: `scripts/validate-typescript-health.ts`  
**Full Report**: `LINT_OPTIMIZATION_REPORT.md`
