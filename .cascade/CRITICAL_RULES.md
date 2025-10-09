# CRITICAL DEVELOPMENT RULES - NEVER VIOLATE

## 🔴 ABSOLUTE RULES - NO EXCEPTIONS

### 1. NEVER DISABLE ESLINT RULES
- **DO NOT** turn off ESLint warnings or errors
- **DO NOT** add `eslint-disable` comments
- **FIX THE ACTUAL PROBLEM** instead of hiding it

### 2. CREATE MISSING COMPONENTS - NEVER DELETE FUNCTIONALITY
- If a component is missing from `@ghxstship/ui`, **CREATE IT**
- If an import fails, **ADD THE EXPORT**, don't remove the import
- If functionality is broken, **FIX IT**, don't delete it
- Components should be created in the UI package with proper TypeScript types

### 3. FIX ROOT CAUSES, NOT SYMPTOMS
- Missing exports → Add them to the UI package
- Type errors → Fix the types properly
- Dependency warnings → Add proper dependencies to hooks
- Import errors → Create the missing modules

## 📋 ENFORCEMENT

This document serves as the **PRIMARY DIRECTIVE** for all code changes in this repository.

**VIOLATION OF THESE RULES IS UNACCEPTABLE.**

Created: 2025-10-09
Last Updated: 2025-10-09
