# Database Package Migration Notes

## Manual Steps Required

### 1. Update workspace configuration
Add to `pnpm-workspace.yaml`:
```yaml
packages:
  - 'packages/database'
```

### 2. Update package.json dependencies
In packages that use the database, update:
```json
{
  "dependencies": {
    "@ghxstship/database": "workspace:*"
  }
}
```

### 3. Update imports
Replace:
```typescript
import { db } from '@ghxstship/infrastructure';
```

With:
```typescript
import { db } from '@ghxstship/database';
```

### 4. Update Prisma schema location
If using Prisma in CI/CD, update paths to:
```
packages/database/prisma/schema.prisma
```

### 5. Update environment variables
Ensure DATABASE_URL is available in all environments.

### 6. Generate Prisma client
```bash
cd packages/database
pnpm generate
```

### 7. Test the migration
```bash
pnpm --filter @ghxstship/database generate
pnpm --filter @ghxstship/database migrate:dev
```

## Verification Checklist

- [ ] Package builds successfully
- [ ] Prisma client generates
- [ ] Migrations run successfully
- [ ] Seed data works
- [ ] All imports updated
- [ ] Tests pass
- [ ] CI/CD updated

## Rollback Plan

If issues occur:
1. Revert changes to package.json files
2. Restore original imports
3. Move schema back to infrastructure package
4. Regenerate Prisma client
