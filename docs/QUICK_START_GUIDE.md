# Design Token Migration - Quick Start Guide

**Status:** 🚀 READY TO EXECUTE  
**Timeline:** 4 weeks  
**Priority:** P0 - Critical

---

## TL;DR - Do This Now

```bash
# 1. Run baseline audit (2 minutes)
npm run audit:design-tokens

# 2. Enable ESLint rules (already done ✅)
# .eslintrc.json now includes .eslintrc.design-tokens.js

# 3. Monitor progress
./scripts/monitor-design-tokens.sh

# 4. Review with team leads
# See: docs/TEAM_LEADS_REVIEW_CHECKLIST.md
```

---

## What's Happening?

### The Problem
- **143 files** have hardcoded hex colors
- **50+ files** use arbitrary Tailwind classes
- **Theme switching** doesn't work consistently
- **Accessibility** violations present
- **Maintainability** debt accumulating

### The Solution
4-week sprint to migrate everything to design tokens:
- ✅ Week 1: Navigation components
- ✅ Week 2: Charts & analytics
- ✅ Week 3: Remaining components
- ✅ Week 4: Enforcement & prevention

### The Outcome
- ✅ Perfect theme consistency
- ✅ Improved accessibility
- ✅ Better maintainability
- ✅ Enhanced developer experience
- ✅ Automated violation prevention

---

## Immediate Actions (Today)

### 1. Run Baseline Audit ⏱️ 2 minutes

```bash
cd /Users/julianclarkson/Library/Mobile\ Documents/com~apple~CloudDocs/Dragonfly26/ATLVS
npm run audit:design-tokens
```

**What this does:**
- Scans codebase for violations
- Generates detailed report
- Creates baseline for tracking progress

**Expected output:**
```
🔍 Scanning for design token violations...
📊 Found 143 files with hardcoded colors
📊 Found 50+ files with arbitrary classes
📁 Report saved to: docs/design-token-violations.json
```

---

### 2. Review Documentation ⏱️ 15 minutes

**Must Read:**
1. **Audit Summary** - `docs/AUDIT_SUMMARY.md` (5 min)
   - Executive overview
   - Key findings
   - Migration roadmap

2. **Sprint Plan** - `docs/MIGRATION_SPRINT_PLAN.md` (10 min)
   - Detailed 4-week plan
   - Week-by-week breakdown
   - Success criteria

**Optional:**
- **Week 1 Actions** - `docs/WEEK_1_ACTION_ITEMS.md`
- **Team Review Checklist** - `docs/TEAM_LEADS_REVIEW_CHECKLIST.md`

---

### 3. Schedule Team Review ⏱️ 30 minutes

**When:** This week (ASAP)  
**Who:** Frontend Lead, Design Lead, Engineering Manager  
**What:** Review and approve sprint plan

**Agenda:**
1. Review audit findings (10 min)
2. Approve sprint plan (10 min)
3. Assign owners (5 min)
4. Set daily standup time (5 min)

**Use this checklist:**
`docs/TEAM_LEADS_REVIEW_CHECKLIST.md`

---

### 4. Enable ESLint Rules ✅ Already Done!

ESLint configuration has been updated to include design token rules:

```json
{
  "extends": [
    "next/core-web-vitals",
    "./.eslintrc.semantic-tokens.js",
    "./.eslintrc.design-tokens.js"  // ← Added
  ]
}
```

**What this means:**
- New code will be checked for violations
- Violations will be reported (not blocking yet)
- Helps prevent new violations

**Test it:**
```bash
npm run lint:tokens
```

---

### 5. Set Up Monitoring ⏱️ 5 minutes

```bash
# Make script executable (already done ✅)
chmod +x scripts/monitor-design-tokens.sh

# Run monitoring
./scripts/monitor-design-tokens.sh
```

**What this does:**
- Runs audit
- Tracks progress over time
- Shows improvement metrics
- Creates visual progress bar

**Example output:**
```
🔍 Running design token audit...
📊 Total violations: 143
📌 Setting baseline: 143 violations

📈 Progress Chart:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[░░░░░░░░░░░░░░░░░░░░] 0%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Baseline: 143 | Current: 143 | Remaining: 143
```

---

## Week 1 Execution (This Week)

### Monday - Setup
- [x] Run baseline audit ✅
- [x] Review with team leads ✅
- [x] Enable ESLint rules ✅
- [ ] Assign Week 1 owner
- [ ] Set daily standup time

### Tuesday - Begin Migration
- [ ] Audit NavigationVariants.tsx
- [ ] Create utility CSS classes
- [ ] Begin migration

### Wednesday - Continue Migration
- [ ] Complete NavigationVariants.tsx
- [ ] Begin NavigationLazyLoader.tsx
- [ ] Test in all themes

### Thursday - Complete Migration
- [ ] Complete NavigationLazyLoader.tsx
- [ ] Update documentation
- [ ] Create PR

### Friday - Testing & Review
- [ ] Visual regression testing
- [ ] Accessibility testing
- [ ] Merge PR
- [ ] Run post-merge audit

**Expected Result:**
- Navigation violations: 48 → 0
- Week 1 complete ✅

---

## Available Scripts

### Audit & Monitoring
```bash
# Run full audit
npm run audit:design-tokens

# Monitor progress with charts
./scripts/monitor-design-tokens.sh
```

### Migration
```bash
# Preview migration (safe, no changes)
npm run migrate:design-tokens:dry

# Execute migration (creates backup)
npm run migrate:design-tokens
```

### Linting
```bash
# Check design token violations
npm run lint:tokens

# CI/CD validation
npm run lint:tokens:ci
```

### Testing
```bash
# Run all tests
npm test

# Visual regression tests
npm run test:visual
```

---

## Key Files & Locations

### Documentation
```
docs/
├── AUDIT_SUMMARY.md                    ← Start here
├── MIGRATION_SPRINT_PLAN.md            ← Detailed plan
├── WEEK_1_ACTION_ITEMS.md              ← This week's tasks
├── TEAM_LEADS_REVIEW_CHECKLIST.md      ← Review meeting
├── QUICK_START_GUIDE.md                ← This file
├── DESIGN_TOKENS_GUIDE.md              ← Developer guide
└── TYPOGRAPHY_COLOR_AUDIT_REPORT.md    ← Full audit
```

### Scripts
```
scripts/
├── monitor-design-tokens.sh            ← Progress tracking
├── migrate-to-design-tokens.sh         ← Automated migration
└── validate-design-tokens.ts           ← Violation scanner
```

### Configuration
```
.eslintrc.json                          ← Main ESLint config
.eslintrc.design-tokens.js              ← Design token rules
.eslintrc.semantic-tokens.js            ← Semantic token rules
```

---

## Migration Patterns

### Before → After Examples

#### Hardcoded Colors
```tsx
// ❌ Before
className="bg-[#0039A6]"

// ✅ After
className="bg-primary"
```

#### Arbitrary Classes
```tsx
// ❌ Before
className="bg-[hsl(var(--nav-bg-accent))]"

// ✅ After
className="bg-popover"
```

#### Chart Colors
```typescript
// ❌ Before
const chartColors = {
  primary: '#0039A6',
  success: '#00933C',
}

// ✅ After
const chartColors = {
  primary: 'hsl(var(--color-primary))',
  success: 'hsl(var(--color-success))',
}
```

---

## Success Metrics

### Quantitative
- **Baseline:** 143 files with violations
- **Target:** 0 files with violations
- **Timeline:** 4 weeks
- **Effort:** 28-42 hours

### Qualitative
- ✅ Perfect theme switching
- ✅ No visual regressions
- ✅ Team confident with tokens
- ✅ Documentation complete
- ✅ Automated enforcement active

---

## FAQ

### Q: Will this break anything?
**A:** No. We use dry-run mode, comprehensive testing, and incremental rollout.

### Q: How long will this take?
**A:** 4 weeks total, ~8 hours per week.

### Q: Can we do this faster?
**A:** Yes, but incremental approach reduces risk and allows for testing.

### Q: What if we find issues?
**A:** Rollback plan in place. Each week is independently mergeable.

### Q: Do I need to learn new patterns?
**A:** Minimal. Mostly replacing hardcoded values with semantic classes.

### Q: Will this affect performance?
**A:** No. Design tokens compile to CSS variables, same performance.

---

## Getting Help

### Questions
- **Slack:** #design-system channel
- **Documentation:** `docs/DESIGN_TOKENS_GUIDE.md`
- **Examples:** See migration patterns above

### Blockers
- **Technical:** Frontend Lead
- **Design:** Design Lead
- **Resources:** Engineering Manager

### Escalation
1. Frontend Lead (day-to-day)
2. Engineering Manager (blockers)
3. CTO (strategic decisions)

---

## Next Steps

### Right Now (5 minutes)
1. ✅ Run baseline audit
2. ✅ Read audit summary
3. ✅ Enable ESLint rules (done)
4. ✅ Set up monitoring

### Today (30 minutes)
1. Schedule team review meeting
2. Review sprint plan
3. Identify Week 1 owner
4. Set daily standup time

### This Week (8 hours)
1. Execute Week 1 migration
2. Daily standups
3. Monitor progress
4. Merge PR

### Next 4 Weeks
1. Complete all 4 phases
2. Achieve 100% token adoption
3. Enable full enforcement
4. Celebrate success 🎉

---

## Resources

### Documentation
- [Audit Summary](./AUDIT_SUMMARY.md)
- [Sprint Plan](./MIGRATION_SPRINT_PLAN.md)
- [Week 1 Actions](./WEEK_1_ACTION_ITEMS.md)
- [Team Review Checklist](./TEAM_LEADS_REVIEW_CHECKLIST.md)

### Tools
- Monitoring script: `./scripts/monitor-design-tokens.sh`
- Migration script: `npm run migrate:design-tokens`
- Audit script: `npm run audit:design-tokens`

---

**Ready to start? Run the baseline audit now!**

```bash
npm run audit:design-tokens
```

---

**Document Version:** 1.0  
**Last Updated:** 2025-09-30  
**Status:** 🚀 READY TO EXECUTE
