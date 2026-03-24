---
name: scaffold
description: Scaffolds new components, modules, services, or features with boilerplate
---

When scaffolding ($ARGUMENTS):

1. **Determine what to create**:
   - Component, module, service, utility, hook, middleware, etc.
   - Check existing patterns in the project for consistency

2. **Generate files**:
   - Main implementation file in `src/`
   - Test file in `tests/`
   - Types/interfaces if needed
   - Export from index if applicable

3. **Follow project conventions**:
   - File naming: match existing pattern (camelCase, kebab-case, PascalCase)
   - Directory structure: place in correct location
   - TypeScript: strict types, no `any`
   - Exports: named exports preferred

4. **Include in generated code**:
   - Proper TypeScript types
   - Error handling
   - Basic JSDoc for public API
   - Placeholder test cases

5. **Wire up**: Update imports/exports in parent modules if needed
