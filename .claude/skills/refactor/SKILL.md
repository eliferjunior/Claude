---
name: refactor
description: Refactors code following best practices and clean code principles
---

When refactoring code ($ARGUMENTS):

1. **Read the target code** first to understand it completely
2. **Identify code smells**: duplication, long methods, large classes, deep nesting, etc.
3. **Apply refactoring patterns**:
   - Extract Method/Function for long blocks
   - Rename variables/functions for clarity
   - Remove dead code
   - Simplify conditionals
   - Use early returns to reduce nesting
4. **Preserve behavior** - Do NOT change what the code does, only how it does it
5. **Run tests** after refactoring to ensure nothing broke
6. **Summarize changes** made and why
