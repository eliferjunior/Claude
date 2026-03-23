---
name: code-review
description: Reviews code for bugs, security issues, and best practices
---

When reviewing code ($ARGUMENTS):

1. **Read the code** thoroughly
2. **Check for bugs**: logic errors, off-by-one, null references, race conditions
3. **Security audit**: injection, XSS, auth issues, sensitive data exposure
4. **Performance**: unnecessary loops, memory leaks, expensive operations
5. **Code quality**: naming, readability, DRY, SOLID principles
6. **TypeScript**: proper types, no `any` abuse, correct generics
7. **Rate severity**: Critical / Warning / Suggestion
8. **Provide specific fixes** for each issue found
