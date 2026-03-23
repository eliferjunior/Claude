---
name: refactor
description: Refactors code for better readability, performance, and maintainability
---

When refactoring code ($ARGUMENTS):

1. **Read the target code** thoroughly before making changes
2. **Identify issues**: code smells, duplication, complexity, naming
3. **Plan changes** - List what will change and why
4. **Apply refactoring** following these principles:
   - Extract repeated logic into functions
   - Use meaningful variable/function names
   - Reduce nesting (early returns, guard clauses)
   - Follow Single Responsibility Principle
   - Prefer immutability where possible
   - Remove dead code
5. **Verify** the refactored code maintains the same behavior
6. **Summarize** what was changed and why
