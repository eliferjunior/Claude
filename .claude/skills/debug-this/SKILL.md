---
name: debug-this
description: Debugs issues by analyzing code, logs, and errors systematically
---

When debugging ($ARGUMENTS):

1. **Reproduce**: Understand the error/issue reported
2. **Gather info**:
   - Read error messages and stack traces carefully
   - Check recent changes (git diff, git log)
   - Look at related files and dependencies
3. **Form hypotheses**: List possible causes ranked by likelihood
4. **Investigate**: Check each hypothesis methodically
5. **Fix**: Apply the minimal fix needed
6. **Verify**: Run tests or reproduce the scenario to confirm the fix
7. **Explain**: Describe what caused the bug and why the fix works
