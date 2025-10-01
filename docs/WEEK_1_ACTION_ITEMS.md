# Week 1 Action Items - Design Token Migration

**Week:** October 1-5, 2025  
**Phase:** Navigation Components (P0 - Critical)  
**Status:** 🎯 READY TO START

---

## Immediate Actions (Today)

### ✅ 1. Run Baseline Audit
```bash
cd /Users/julianclarkson/Library/Mobile\ Documents/com~apple~CloudDocs/Dragonfly26/ATLVS
npm run audit:design-tokens
```

**Expected Output:**
- Generates `docs/design-token-violations.json`
- Shows current violation count
- Identifies priority files

**Success Criteria:** Audit completes without errors

---

### ✅ 2. Review with Team Leads

**Attendees:**
- Frontend Lead
- Design Lead
- Engineering Manager

**Agenda (30 minutes):**
1. Review `docs/AUDIT_SUMMARY.md` (10 min)
2. Review `docs/MIGRATION_SPRINT_PLAN.md` (10 min)
3. Assign owners for Week 1 (5 min)
4. Set daily standup time (5 min)

**Deliverables:**
- [ ] Owners assigned
- [ ] Daily standup scheduled
- [ ] Sprint approved
- [ ] Kickoff meeting scheduled

---

### ✅ 3. Enable ESLint Rules for New Code

**Action:** Update `.eslintrc.js` to include design token rules

```bash
# Test ESLint configuration
npm run lint:tokens

# Expected: Shows current violations but doesn't fail build yet
```

**Configuration Update:**

Create or update `.eslintrc.js`:
```javascript
module.exports = {
  extends: [
    // ... existing extends
    './.eslintrc.design-tokens.js', // Add this line
  ],
  // ... rest of config
}
```

**Success Criteria:**
- ESLint runs without crashing
- Violations are reported but don't fail build yet
- New code will be checked on commit

---

### ✅ 4. Set Up Monitoring

**Create monitoring script:** `scripts/monitor-design-tokens.sh`

```bash
#!/bin/bash
# Monitor design token violations over time

REPORT_DIR="docs/violation-reports"
mkdir -p "$REPORT_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/violations_$TIMESTAMP.json"

echo "🔍 Running design token audit..."
npm run audit:design-tokens > "$REPORT_FILE"

VIOLATION_COUNT=$(jq '.summary.totalViolations' "$REPORT_FILE")

echo "📊 Total violations: $VIOLATION_COUNT"
echo "📁 Report saved to: $REPORT_FILE"

# Track progress
if [ -f "$REPORT_DIR/baseline.json" ]; then
  BASELINE_COUNT=$(jq '.summary.totalViolations' "$REPORT_DIR/baseline.json")
  IMPROVEMENT=$((BASELINE_COUNT - VIOLATION_COUNT))
  echo "📈 Improvement: $IMPROVEMENT violations fixed"
else
  echo "📌 Setting baseline: $VIOLATION_COUNT violations"
  cp "$REPORT_FILE" "$REPORT_DIR/baseline.json"
fi
```

**Run baseline:**
```bash
chmod +x scripts/monitor-design-tokens.sh
./scripts/monitor-design-tokens.sh
```

---

## Week 1 Daily Tasks

### Day 1 (Monday) - Setup & Planning

**Morning:**
- [x] Run baseline audit
- [x] Review with team leads
- [x] Enable ESLint rules
- [x] Set up monitoring

**Afternoon:**
- [ ] Audit `NavigationVariants.tsx` in detail
- [ ] Document current color usage patterns
- [ ] Identify all navigation-related files
- [ ] Create migration checklist

**Deliverables:**
- Baseline audit report
- Navigation component inventory
- Detailed migration plan for navigation

**Time Estimate:** 4 hours

---

### Day 2 (Tuesday) - Utility Classes

**Morning:**
- [ ] Create utility CSS classes for navigation tokens
- [ ] Document new utility classes
- [ ] Test utility classes in isolation

**Afternoon:**
- [ ] Begin migrating `NavigationVariants.tsx`
- [ ] Focus on background colors first
- [ ] Test in light theme

**Deliverables:**
- Navigation utility CSS file
- 50% of NavigationVariants.tsx migrated

**Time Estimate:** 4 hours

---

### Day 3 (Wednesday) - NavigationVariants

**Morning:**
- [ ] Complete `NavigationVariants.tsx` migration
- [ ] Test in all themes (light/dark/high-contrast)
- [ ] Fix any visual regressions

**Afternoon:**
- [ ] Begin migrating `NavigationLazyLoader.tsx`
- [ ] Apply same patterns from NavigationVariants
- [ ] Test lazy loading behavior

**Deliverables:**
- NavigationVariants.tsx 100% migrated
- NavigationLazyLoader.tsx 50% migrated

**Time Estimate:** 4 hours

---

### Day 4 (Thursday) - NavigationLazyLoader

**Morning:**
- [ ] Complete `NavigationLazyLoader.tsx` migration
- [ ] Test lazy loading in all themes
- [ ] Verify performance not impacted

**Afternoon:**
- [ ] Migrate any remaining navigation utilities
- [ ] Update navigation documentation
- [ ] Create PR with all changes

**Deliverables:**
- All navigation components migrated
- Documentation updated
- PR ready for review

**Time Estimate:** 4 hours

---

### Day 5 (Friday) - Testing & Review

**Morning:**
- [ ] Comprehensive theme switching tests
- [ ] Visual regression testing
- [ ] Accessibility testing (keyboard nav, screen readers)
- [ ] Performance testing

**Afternoon:**
- [ ] Address PR feedback
- [ ] Final testing
- [ ] Merge to main
- [ ] Run post-merge audit

**Deliverables:**
- All tests passing
- PR merged
- Week 1 complete
- Reduced violation count

**Time Estimate:** 4 hours

---

## Testing Checklist

### Visual Testing
- [ ] Light theme renders correctly
- [ ] Dark theme renders correctly
- [ ] High-contrast theme renders correctly
- [ ] Hover states work in all themes
- [ ] Active states work in all themes
- [ ] Focus indicators visible in all themes
- [ ] Transitions smooth in all themes

### Functional Testing
- [ ] Navigation opens/closes correctly
- [ ] Nested navigation expands/collapses
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Mobile navigation works
- [ ] Tablet navigation works
- [ ] Desktop navigation works

### Performance Testing
- [ ] No performance regression
- [ ] Lazy loading still works
- [ ] Theme switching is instant
- [ ] No console errors
- [ ] No console warnings

### Accessibility Testing
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible
- [ ] Touch targets adequate (44px min)

---

## Files to Migrate (Week 1)

### Priority 1 (Must Complete)
- [ ] `packages/ui/src/components/navigation/NavigationVariants.tsx` (39 violations)
- [ ] `packages/ui/src/components/navigation/NavigationLazyLoader.tsx` (9 violations)

### Priority 2 (If Time Permits)
- [ ] Related navigation utility files
- [ ] Navigation documentation
- [ ] Navigation Storybook examples

---

## Migration Patterns

### Pattern 1: Arbitrary HSL Classes
```tsx
// ❌ Before
className="bg-[hsl(var(--nav-bg-accent))] text-[hsl(var(--nav-fg-primary))]"

// ✅ After
className="bg-popover text-foreground"
```

### Pattern 2: Custom Navigation Colors
```tsx
// ❌ Before
style={{ backgroundColor: 'hsl(var(--nav-bg-accent))' }}

// ✅ After
className="bg-popover"
```

### Pattern 3: Conditional Theme Colors
```tsx
// ❌ Before
className={theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#ffffff]'}

// ✅ After
className="bg-background"
```

---

## Utility Classes to Create

Create in `packages/ui/src/styles/navigation-utilities.css`:

```css
/* Navigation-specific utilities using design tokens */

.nav-bg-primary {
  background-color: hsl(var(--color-background));
}

.nav-bg-accent {
  background-color: hsl(var(--color-popover));
}

.nav-fg-primary {
  color: hsl(var(--color-foreground));
}

.nav-fg-secondary {
  color: hsl(var(--color-muted-foreground));
}

.nav-border {
  border-color: hsl(var(--color-border));
}

.nav-hover {
  @apply hover:bg-accent hover:text-accent-foreground;
}

.nav-active {
  @apply bg-accent text-accent-foreground;
}

.nav-focus {
  @apply focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
}
```

---

## Daily Standup Template

### What was completed yesterday?
- List specific files migrated
- Note violation count reduction
- Mention any blockers resolved

### What will be completed today?
- List specific files to migrate
- Set target violation count
- Identify any potential blockers

### Any blockers or risks?
- Technical challenges
- Need for design clarification
- Third-party library limitations

---

## Success Metrics (Week 1)

### Quantitative
- **Baseline Violations:** ~48 (NavigationVariants + NavigationLazyLoader)
- **Target Violations:** 0 in navigation components
- **Reduction:** 100% of navigation violations

### Qualitative
- ✅ Navigation components use semantic tokens
- ✅ Theme switching works perfectly
- ✅ No visual regressions
- ✅ Team comfortable with migration process
- ✅ Documentation updated
- ✅ Tests passing

---

## Rollback Plan

If critical issues arise:

1. **Immediate Rollback:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Partial Rollback:**
   - Revert specific files only
   - Keep utility classes
   - Document issues for future attempt

3. **Investigation:**
   - Identify root cause
   - Update migration plan
   - Schedule retry

---

## Communication

### Daily Updates
Post in team Slack channel:
```
🎨 Design Token Migration - Day X Update

✅ Completed:
- [List completed items]

🚧 In Progress:
- [List current work]

📊 Metrics:
- Violations: [before] → [after]
- Files migrated: X/Y

🚫 Blockers:
- [List any blockers or "None"]

📅 Tomorrow:
- [List planned work]
```

### End of Week Summary
Post comprehensive summary:
```
🎉 Week 1 Complete - Navigation Migration

📊 Results:
- Violations reduced: 48 → 0
- Files migrated: 2/2
- Tests passing: ✅
- Theme switching: ✅

🎯 Next Week:
- Charts & Analytics migration
- Estimated violations: ~85

🙏 Thanks to:
- [Team members who contributed]
```

---

## Resources

### Documentation
- **Audit Summary:** `docs/AUDIT_SUMMARY.md`
- **Sprint Plan:** `docs/MIGRATION_SPRINT_PLAN.md`
- **Design Token Guide:** `docs/DESIGN_TOKENS_GUIDE.md`
- **Full Audit Report:** `docs/TYPOGRAPHY_COLOR_AUDIT_REPORT.md`

### Scripts
```bash
# Run audit
npm run audit:design-tokens

# Preview migration
npm run migrate:design-tokens:dry

# Execute migration (with backup)
npm run migrate:design-tokens

# Monitor progress
./scripts/monitor-design-tokens.sh
```

### Support
- **Questions:** Post in #design-system Slack channel
- **Blockers:** Escalate to Frontend Lead
- **Design Decisions:** Consult Design Lead

---

## Notes

### Key Learnings (Update Daily)
- [Add learnings as you go]

### Gotchas
- [Document any tricky issues]

### Improvements for Next Week
- [Note process improvements]

---

**Document Version:** 1.0  
**Last Updated:** 2025-09-30  
**Owner:** [TBD]  
**Status:** 🎯 READY TO START
