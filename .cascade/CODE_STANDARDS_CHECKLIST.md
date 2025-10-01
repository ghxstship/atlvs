# Cascade AI - Mandatory Code Standards Checklist

## ⚠️ CRITICAL RULES - NEVER BYPASS

### 1. PRE-COMMIT HOOKS
- **NEVER use `--no-verify` or bypass pre-commit hooks**
- If hook fails, investigate and fix the actual violations
- Pre-commit hooks exist for a reason - they enforce code quality
- If violations are in unrelated files, stage only the files you modified

### 2. DESIGN TOKENS - MANDATORY FOR ALL NEW CODE
**Before writing ANY UI code, consult:**
- `/packages/ui/DESIGN_TOKENS.md` - Complete token reference
- Use semantic tokens, NEVER hardcoded values

#### Required Token Usage:

**Colors:**
- ❌ `text-yellow-500`, `text-blue-500`, `bg-green-500`
- ✅ `text-warning`, `text-info`, `text-success`, `text-destructive`
- ✅ `bg-primary`, `bg-secondary`, `bg-muted`

**Spacing/Sizing:**
- ❌ `w-4 h-4`, `w-5 h-5`, `p-4`, `gap-3`
- ✅ `w-icon-xs h-icon-xs`, `w-icon-sm h-icon-sm`
- ✅ `p-md`, `gap-sm`

**Arbitrary Values:**
- ❌ `min-h-[400px]`, `w-[200px]`, `text-[14px]`
- ✅ `min-h-container-lg`, `w-full`, `text-body`

**Containers/Layout:**
- ❌ `min-h-[400px]`, `max-w-[800px]`
- ✅ `min-h-container-lg`, `max-w-container-md`

### 3. WORKFLOW FOR NEW FILES

**Step 1: Read Design System Documentation**
```bash
# ALWAYS read these BEFORE creating UI components:
cat /packages/ui/DESIGN_TOKENS.md
cat /docs/QUICK_START_GUIDE.md
```

**Step 2: Use Token Reference**
When writing any className:
1. Check if using hardcoded value (px, rem, hex, rgb)
2. Find equivalent semantic token in DESIGN_TOKENS.md
3. Use the token instead

**Step 3: Validate Before Commit**
```bash
# Run token validation on your files
pnpm lint:tokens

# If violations found, FIX THEM before committing
```

**Step 4: Commit Properly**
```bash
git add <your-files>
git commit -m "your message"
# If pre-commit fails: FIX THE VIOLATIONS, don't bypass
```

## MANDATORY CHECKS FOR EVERY FILE CREATION

- [ ] Read DESIGN_TOKENS.md before coding
- [ ] Used semantic color tokens (text-*, bg-*, border-*)
- [ ] Used icon size tokens (w-icon-*, h-icon-*)
- [ ] Used spacing tokens (p-*, m-*, gap-*)
- [ ] No arbitrary Tailwind values ([...])
- [ ] No hardcoded pixel/rem values
- [ ] Ran lint:tokens validation
- [ ] Pre-commit hook passed (or violations fixed)

## WHEN PRE-COMMIT HOOK FAILS

**DO:**
1. Read the error output carefully
2. Identify which files have violations
3. If YOUR files: Fix the violations
4. If unrelated files: Stage only your files and commit again
5. Document why violations exist in unrelated files

**DO NOT:**
1. Use `--no-verify` or `--no-hooks`
2. Bypass without investigation
3. Assume violations are "okay"
4. Push code with design token violations

## CONSEQUENCES OF IGNORING THIS

- ❌ Inconsistent theming across the app
- ❌ Accessibility violations
- ❌ Maintenance debt
- ❌ Breaking design system standards
- ❌ Lost trust in AI-generated code
- ❌ More work for the team to fix

## COMMITMENT

As Cascade AI, I commit to:
1. **ALWAYS** read DESIGN_TOKENS.md before creating UI components
2. **NEVER** bypass pre-commit hooks
3. **ALWAYS** use semantic tokens instead of hardcoded values
4. **ALWAYS** validate token usage before committing
5. **ALWAYS** investigate and fix hook failures

---

**Last Updated:** 2025-10-01  
**Enforced By:** Cascade AI Workflow  
**Non-Negotiable**
