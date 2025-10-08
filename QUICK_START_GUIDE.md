# Quick Start Guide - Post Phase 1

## ✅ Current Status
- **Build**: PASSING ✅
- **Production Ready**: YES ✅
- **Phase 1**: COMPLETE ✅

## 🚀 What's Working Now

### Layout Components
```tsx
import { Stack, HStack, Grid } from '@ghxstship/ui';

// Vertical layout
<Stack spacing="md">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

// Horizontal layout
<HStack spacing="sm" align="center">
  <button>Action</button>
  <span>Label</span>
</HStack>

// Grid layout
<Grid cols={3} responsive={{ md: 2, lg: 4 }}>
  <div>Cell 1</div>
  <div>Cell 2</div>
</Grid>
```

### Card Component (New API)
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@ghxstship/ui';

<Card>
  <CardHeader>
    <h3 className="font-semibold text-lg">Title</h3>
    <p className="text-sm text-muted-foreground">Description</p>
  </CardHeader>
  <CardBody>
    Content goes here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Badge Component (Updated Variants)
```tsx
import { Badge } from '@ghxstship/ui';

// Use these variants:
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>  // was "outline"
<Badge variant="success">Success</Badge>
<Badge variant="error">Error</Badge>          // was "destructive"
<Badge variant="warning">Warning</Badge>
```

### Button Component (Updated Variants)
```tsx
import { Button } from '@ghxstship/ui';

// Use these variants:
<Button variant="primary">Primary</Button>     // was "default"
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>
```

## 📦 Import Patterns

### Correct Imports
```tsx
// ✅ Main export (preferred)
import { Stack, Card, Button, Badge } from '@ghxstship/ui';

// ✅ Specific paths (if needed)
import { Stack } from '@ghxstship/ui/layout/Stack';
import { Card } from '@ghxstship/ui/molecules/Card';
```

### Deprecated Imports (Don't Use)
```tsx
// ❌ Don't use these
import { CardTitle, CardDescription, CardContent } from '@ghxstship/ui';
import { VStack } from '@ghxstship/ui';
import Button from '@ghxstship/ui/components/atomic/Button';
```

## 🛠️ Available Scripts

### Build
```bash
cd apps/web
npm run build
```

### Clean Up Backups (After Verification)
```bash
chmod +x scripts/cleanup-migration-backups.sh
./scripts/cleanup-migration-backups.sh
```

### Card Migration (When Ready)
```bash
chmod +x scripts/migrate-card-api.sh
./scripts/migrate-card-api.sh
```

## 📋 Optional Next Steps

1. **Card Migration** - 187 files still using old Card API (non-blocking)
2. **Test Updates** - Update tests for new component APIs
3. **Backup Cleanup** - Remove 493 `.bak` files after verification

## 🆘 Common Issues

### "Module not found: Stack"
**Solution**: Import from main export
```tsx
import { Stack } from '@ghxstship/ui';
```

### "Property 'variant' does not accept 'outline'"
**Solution**: Use `secondary` instead
```tsx
<Badge variant="secondary" />  // not "outline"
```

### "CardTitle is not exported"
**Solution**: Use native HTML in CardHeader
```tsx
<CardHeader>
  <h3 className="font-semibold">Title</h3>
</CardHeader>
```

## 📚 Documentation

- **Full Report**: See `PHASE_1_FINAL_REPORT.md`
- **Technical Details**: See `BUILD_STATUS.md`
- **Migration Guide**: See Card migration script output

## ✅ Ready to Deploy

The application is production-ready. All critical fixes are complete and the build is passing.
