# Spacing System Guide

## Overview
The GHXSTSHIP design system uses semantic spacing tokens to ensure consistent vertical and horizontal rhythm across all experiences. Tokens are available through Tailwind utility classes (e.g., `py-md`, `px-3xl`, `gap-lg`) and reflect the values declared in `packages/ui/src/styles/unified-design-system.css`.

## Token Reference
| Token | Value | Tailwind Utility Examples |
|-------|-------|---------------------------|
| `xs`  | 0.25rem (4px)   | `p-xs`, `px-xs`, `gap-xs` |
| `sm`  | 0.5rem (8px)    | `p-sm`, `py-sm`, `gap-sm` |
| `md`  | 1rem (16px)     | `p-md`, `px-md`, `gap-md` |
| `lg`  | 1.5rem (24px)   | `p-lg`, `px-lg`, `gap-lg` |
| `xl`  | 2rem (32px)     | `p-xl`, `px-xl`, `gap-xl` |
| `2xl` | 3rem (48px)     | `p-2xl`, `py-2xl`, `gap-2xl` |
| `3xl` | 4rem (64px)     | `p-3xl`, `py-3xl`, `gap-3xl` |
| `4xl` | 6rem (96px)     | `p-4xl`, `py-4xl`, `gap-4xl` |
| `5xl` | 8rem (128px)    | `p-5xl`, `py-5xl`, `gap-5xl` |

## Invalid Patterns (Do Not Use)
- `py-xsxl`
- `py-smxl`
- `py-mdxl`
- `py-lgxl`
- `px-xsxl`
- `px-smxl`
- `px-mdxl`
- `px-lgxl`

These typos combine two tokens and do not exist in Tailwind. They cause sections to render without padding.

## Tooling & Enforcement
- Script: `scripts/fix-invalid-spacing-tokens.sh`
- ESLint rule: `.eslintrc.spacing-validation.json`
- Report: `SPACING_REMEDIATION_REPORT.md`

## Implementation Checklist
- **Verify new components** use semantic tokens only
- **Avoid inline spacing values**; rely on predefined utilities
- **Review PRs** for spacing typos using ESLint validation
- **Run the remediation script** if spacing issues are suspected

## Recommendations
- Use IDE autocompletion for class names
- When in doubt, reference this guide or `unified-design-system.css`
- Prefer larger spacing (`py-5xl`, `py-4xl`) for marketing sections to maintain breathing room
