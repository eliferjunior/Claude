---
name: test-generator
description: Generates comprehensive tests for code including edge cases
---

When generating tests for ($ARGUMENTS):

1. **Analyze the code** to understand all code paths
2. **Identify test scenarios**:
   - Happy path (normal expected usage)
   - Edge cases (empty input, null, undefined, boundary values)
   - Error cases (invalid input, exceptions)
   - Async behavior if applicable
3. **Write tests** using the project's test framework (Jest, Vitest, Mocha, etc.)
4. **Structure tests** with clear describe/it blocks
5. **Include**:
   - Descriptive test names that explain expected behavior
   - Arrange-Act-Assert pattern
   - Mock external dependencies
   - Test both input and output
6. **Run tests** to verify they pass
