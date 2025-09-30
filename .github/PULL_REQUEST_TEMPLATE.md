## Description
<!-- Provide a brief description of the changes in this PR -->

## Type of Change
<!-- Mark the relevant option with an "x" -->

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Design token update
- [ ] Performance improvement
- [ ] Code refactoring

## Design Token Compliance
<!-- REQUIRED: All PRs must comply with semantic token standards -->

- [ ] No hardcoded color values (hex, rgb, rgba)
- [ ] All colors use semantic tokens (e.g., `hsl(var(--color-primary))`)
- [ ] Ran `pnpm validate:tokens` with no errors
- [ ] Ran `pnpm lint:tokens` with no warnings
- [ ] Pre-commit hook passed

**If you added new colors:**
- [ ] Added to `unified-design-tokens.ts`
- [ ] Regenerated CSS with `pnpm generate:tokens`
- [ ] Updated documentation

## Testing
<!-- Describe the tests you ran and how to reproduce them -->

- [ ] Tested in light theme
- [ ] Tested in dark theme
- [ ] Tested in high-contrast mode (if applicable)
- [ ] Tested responsive behavior
- [ ] Tested keyboard navigation
- [ ] Tested screen reader compatibility

## Screenshots
<!-- If applicable, add screenshots to help explain your changes -->

### Before
<!-- Screenshot before changes -->

### After
<!-- Screenshot after changes -->

## Checklist
<!-- Mark completed items with an "x" -->

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Related Issues
<!-- Link related issues using #issue_number -->

Closes #

## Additional Notes
<!-- Add any additional notes or context about the PR -->

---

## 🎨 Design Token Validation

This PR has been automatically validated for design token compliance:

- ✅ No hardcoded hex colors
- ✅ No RGB/RGBA values
- ✅ Token validation passed
- ✅ ESLint token rules passed

**Need to fix violations?**
```bash
pnpm fix:colors
pnpm validate:tokens
```

See [Token Migration Guide](../docs/TOKEN_MIGRATION_GUIDE.md) for help.
