# Design Token Migration Sprint Plan

**Sprint Duration:** 4 weeks  
**Start Date:** Week of 2025-10-01  
**Status:** 🚀 READY TO EXECUTE

---

## Executive Summary

This document outlines the 4-week sprint plan to migrate the ATLVS codebase from hardcoded colors, fonts, and arbitrary Tailwind classes to a fully normalized design token system. The migration will improve theme consistency, accessibility, maintainability, and developer experience.

---

## Sprint Goals

### Primary Objectives
- ✅ Eliminate all hardcoded hex colors from components (143 files)
- ✅ Remove arbitrary Tailwind classes (50+ files)
- ✅ Normalize typography scale usage (149 files)
- ✅ Enable automated enforcement via ESLint
- ✅ Achieve 100% design token adoption

### Success Metrics
- **Before:** 143 files with violations
- **Target:** 0 files with violations
- **Enforcement:** ESLint rules active for all new code
- **Theme Switching:** Perfect consistency across light/dark/high-contrast modes

---

## Week 1: Navigation Components (P0 - Critical)

### Scope
- `NavigationVariants.tsx` (39 violations)
- `NavigationLazyLoader.tsx` (9 violations)
- Related navigation utilities

### Tasks
- [ ] **Day 1-2:** Audit and document current navigation color usage
- [ ] **Day 2-3:** Create utility CSS classes for navigation tokens
- [ ] **Day 3-4:** Migrate NavigationVariants.tsx
- [ ] **Day 4:** Migrate NavigationLazyLoader.tsx
- [ ] **Day 5:** Test theme switching across all navigation states

### Deliverables
- ✅ Navigation components using semantic tokens
- ✅ Utility CSS classes documented
- ✅ Theme switching validated
- ✅ Visual regression tests passing

### Effort Estimate
**4-8 hours**

### Owner
Frontend Engineer (TBD)

### Testing Checklist
- [ ] Light theme navigation renders correctly
- [ ] Dark theme navigation renders correctly
- [ ] High-contrast theme navigation renders correctly
- [ ] Hover states work in all themes
- [ ] Active states work in all themes
- [ ] Focus indicators visible in all themes
- [ ] No console errors or warnings
- [ ] Visual regression tests pass

---

## Week 2: Charts & Analytics (P1 - High Priority)

### Scope
- `ProgrammingSpacesAnalyticsView.tsx` (35 hex colors)
- `ProgrammingWorkshopsAnalyticsView.tsx` (26 hex colors)
- `overviewConfigs.tsx` (24 hex colors)
- All other analytics/chart components

### Tasks
- [ ] **Day 1:** Create `chart-colors.ts` token file
- [ ] **Day 2:** Map NYC subway colors to semantic tokens
- [ ] **Day 3-4:** Migrate all analytics views
- [ ] **Day 4:** Update chart library configurations (Recharts/Chart.js)
- [ ] **Day 5:** Visual regression testing for all charts

### Deliverables
- ✅ `chart-colors.ts` token file
- ✅ All charts using design tokens
- ✅ Charts adapt to theme changes
- ✅ Documentation for chart color usage

### Effort Estimate
**12-16 hours**

### Owner
Frontend Engineer (TBD)

### Chart Color Mapping
```typescript
// NYC Subway → Design Tokens
'#0039A6' → hsl(var(--color-primary))      // Blue
'#00933C' → hsl(var(--color-success))      // Green
'#EE352E' → hsl(var(--color-destructive))  // Red
'#FF6319' → hsl(var(--color-warning))      // Orange
'#FCCC0A' → hsl(var(--color-accent))       // Yellow
'#996633' → hsl(var(--color-muted))        // Brown
'#A7A9AC' → hsl(var(--color-border))       // Gray
```

### Testing Checklist
- [ ] All chart types render in light theme
- [ ] All chart types render in dark theme
- [ ] Chart legends use correct colors
- [ ] Tooltips use correct colors
- [ ] Data labels readable in all themes
- [ ] Color contrast meets WCAG AA standards
- [ ] Print styles work correctly
- [ ] Export functionality preserves colors

---

## Week 3: Remaining Components (P1 - High Priority)

### Scope
- All remaining components with violations
- Design system documentation
- Storybook examples
- Migration guide creation

### Tasks
- [ ] **Day 1:** Audit remaining components (RGB/HSL functions)
- [ ] **Day 2-3:** Migrate remaining components
- [ ] **Day 3:** Update design system documentation
- [ ] **Day 4:** Update Storybook examples
- [ ] **Day 5:** Create migration guide for teams

### Deliverables
- ✅ All components using design tokens
- ✅ Updated design system docs
- ✅ Storybook examples updated
- ✅ Migration guide for developers

### Effort Estimate
**8-12 hours**

### Owner
Frontend Engineer (TBD)

### Documentation Updates
- [ ] Update `DESIGN_TOKENS_GUIDE.md`
- [ ] Add examples to Storybook
- [ ] Create "Before/After" comparison guide
- [ ] Document common migration patterns
- [ ] Add troubleshooting section

---

## Week 4: Enforcement & Prevention (P0 - Critical)

### Scope
- ESLint rule activation
- Pre-commit hooks
- CI/CD pipeline integration
- Developer training

### Tasks
- [ ] **Day 1:** Enable ESLint design token rules
- [ ] **Day 2:** Add pre-commit hooks (Husky)
- [ ] **Day 3:** Integrate validation into CI/CD
- [ ] **Day 4:** Developer training session
- [ ] **Day 5:** Monitor and address any issues

### Deliverables
- ✅ ESLint rules active for all code
- ✅ Pre-commit hooks preventing violations
- ✅ CI/CD failing on violations
- ✅ Team trained on design tokens
- ✅ Monitoring dashboard active

### Effort Estimate
**4-6 hours**

### Owner
DevOps + Frontend Lead (TBD)

### ESLint Configuration
```bash
# Enable for all new code immediately
npm run lint:tokens

# CI/CD integration
npm run lint:tokens:ci
```

### Pre-commit Hook
```bash
#!/bin/bash
# .husky/pre-commit

npm run audit:design-tokens
if [ $? -ne 0 ]; then
  echo "❌ Design token violations detected. Please fix before committing."
  exit 1
fi
```

---

## Daily Standup Format

### What was completed yesterday?
- List specific files/components migrated
- Note any blockers resolved

### What will be completed today?
- List specific files/components to migrate
- Identify any potential blockers

### Any blockers or risks?
- Technical challenges
- Need for design clarification
- Third-party library limitations

---

## Risk Management

### Identified Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Chart library doesn't support CSS variables | Medium | High | Create wrapper components with token mapping |
| Visual regressions introduced | Medium | Medium | Comprehensive visual testing before merge |
| Third-party components incompatible | Low | Medium | Document exceptions, create wrapper components |
| Team resistance to new patterns | Low | Low | Training session, clear documentation |
| Timeline slippage | Medium | Low | Buffer time built into estimates |

### Mitigation Strategies

1. **Dry-run mode:** Use `npm run migrate:design-tokens:dry` extensively
2. **Incremental rollout:** Merge by module, not all at once
3. **Backup strategy:** Keep backups for 2 weeks post-migration
4. **Visual testing:** Screenshot comparison for all migrated components
5. **Rollback plan:** Git tags for easy rollback if needed

---

## Communication Plan

### Team Leads Review
- **When:** Start of Week 1
- **Attendees:** Frontend Lead, Design Lead, Engineering Manager
- **Agenda:**
  - Review audit summary
  - Approve sprint plan
  - Assign owners
  - Set success criteria

### Weekly Check-ins
- **When:** End of each week
- **Attendees:** Sprint team + stakeholders
- **Agenda:**
  - Review progress
  - Demo migrated components
  - Address blockers
  - Adjust plan if needed

### Final Review
- **When:** End of Week 4
- **Attendees:** All stakeholders
- **Agenda:**
  - Demo complete migration
  - Review metrics
  - Celebrate success
  - Plan ongoing maintenance

---

## Tools & Resources

### Available Scripts
```bash
# Audit current state
npm run audit:design-tokens

# Preview migration (safe, no changes)
npm run migrate:design-tokens:dry

# Execute migration (creates backup)
npm run migrate:design-tokens

# Validate after migration
npm run audit:design-tokens
npm test
```

### Documentation
- **Full Audit:** `docs/TYPOGRAPHY_COLOR_AUDIT_REPORT.md`
- **Developer Guide:** `docs/DESIGN_TOKENS_GUIDE.md`
- **This Plan:** `docs/MIGRATION_SPRINT_PLAN.md`
- **Violations Report:** `docs/design-token-violations.json` (generated)

### Automation
- **Migration Script:** `scripts/migrate-to-design-tokens.sh`
- **Validation Script:** `scripts/validate-design-tokens.ts`
- **ESLint Config:** `.eslintrc.design-tokens.js`

---

## Success Criteria

### Week 1 Success
- ✅ Navigation components 100% migrated
- ✅ Theme switching works perfectly
- ✅ No visual regressions
- ✅ Team comfortable with process

### Week 2 Success
- ✅ All charts using design tokens
- ✅ Charts adapt to theme changes
- ✅ Chart color palette documented
- ✅ Visual tests passing

### Week 3 Success
- ✅ All components migrated
- ✅ Documentation updated
- ✅ Storybook examples current
- ✅ Migration guide complete

### Week 4 Success
- ✅ ESLint rules active
- ✅ Pre-commit hooks working
- ✅ CI/CD validation active
- ✅ Team trained
- ✅ Zero violations in codebase

### Overall Sprint Success
- ✅ 0 hardcoded hex colors in components
- ✅ 0 arbitrary color classes
- ✅ 100% design token adoption
- ✅ Perfect theme consistency
- ✅ Automated violation prevention
- ✅ Team confident with design tokens

---

## Post-Sprint Actions

### Immediate (Week 5)
1. Monitor for any issues in production
2. Address any edge cases discovered
3. Collect team feedback
4. Update documentation based on feedback

### Short-term (Month 2)
1. Create semantic typography components
2. Build color tooling (contrast checker, theme preview)
3. Expand visual regression test coverage
4. Conduct accessibility audit

### Long-term (Quarter 2)
1. Explore design token automation (Figma → Code)
2. Create design token documentation site
3. Share learnings with broader organization
4. Consider design token versioning strategy

---

## Appendix A: Quick Reference

### Common Migrations

#### Hex Colors → Design Tokens
```tsx
// ❌ Before
className="bg-[#0039A6]"

// ✅ After
className="bg-primary"
```

#### Arbitrary Classes → Semantic Classes
```tsx
// ❌ Before
className="bg-[hsl(var(--nav-bg-accent))]"

// ✅ After
className="bg-popover"
```

#### Chart Colors → Token Variables
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

## Appendix B: Contact Information

### Sprint Team
- **Frontend Lead:** [TBD]
- **Design Lead:** [TBD]
- **DevOps Engineer:** [TBD]
- **QA Engineer:** [TBD]

### Escalation Path
1. Frontend Lead (day-to-day issues)
2. Engineering Manager (blockers, resources)
3. CTO (strategic decisions)

---

**Document Version:** 1.0  
**Last Updated:** 2025-09-30  
**Next Review:** End of Week 1  
**Status:** 🚀 READY TO EXECUTE
