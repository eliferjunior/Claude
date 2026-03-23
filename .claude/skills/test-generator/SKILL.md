---
name: test-generator
description: Generates comprehensive tests for the specified code
---

When generating tests for ($ARGUMENTS):

1. **Read the target code** to understand all branches and edge cases
2. **Determine test framework** - Check existing tests for the framework in use (Jest, Vitest, etc.)
3. **Generate tests** covering:
   - Happy path / normal cases
   - Edge cases (empty inputs, null, undefined, boundaries)
   - Error cases (invalid inputs, exceptions)
   - Async behavior if applicable
4. **Follow existing test patterns** in the project
5. **Use descriptive test names** that explain what is being tested
6. **Run the tests** to make sure they pass
