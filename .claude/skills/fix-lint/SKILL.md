---
name: fix-lint
description: Fixes all lint errors and formatting issues automatically
---

When fixing lint issues ($ARGUMENTS):

1. **Run linter** to see all errors:
   - `npm run lint` for ESLint errors
   - `npm run format:check` for Prettier issues
   - `npx tsc --noEmit` for TypeScript errors

2. **Auto-fix what's possible**:
   - `npm run lint:fix` for auto-fixable ESLint rules
   - `npm run format` for formatting

3. **Manually fix remaining issues**:
   - Unused variables: remove or prefix with `_`
   - Missing types: add proper TypeScript types
   - Import order: sort and group imports
   - Naming conventions: fix to match project style

4. **Verify**:
   - Re-run linter to confirm zero errors
   - Run tests to ensure fixes didn't break anything
