---
name: code-review
description: Performs a thorough code review checking for bugs, security, and best practices
---

When reviewing code ($ARGUMENTS):

Review the code for the following categories:

### Security

- SQL injection, XSS, command injection vulnerabilities
- Hardcoded secrets or credentials
- Insecure data handling

### Bugs

- Off-by-one errors, null pointer issues
- Race conditions, async issues
- Incorrect logic or edge cases

### Performance

- Unnecessary loops or computations
- Memory leaks
- Missing caching opportunities

### Code Quality

- Naming conventions
- Code duplication
- Function complexity (cyclomatic)
- Error handling completeness

### Best Practices

- SOLID principles adherence
- Type safety
- Proper error handling
- Accessibility (for UI code)

Format findings as:

- **CRITICAL**: Must fix before merge
- **WARNING**: Should fix, potential issues
- **SUGGESTION**: Nice to have improvements
