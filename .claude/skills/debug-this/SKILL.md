---
name: debug-this
description: Debugs issues by analyzing code, logs, and error messages
---

When debugging ($ARGUMENTS):

1. **Reproduce the issue** - understand the error message or unexpected behavior
2. **Trace the execution path** - follow the code from entry point to error
3. **Check common causes**: typos, wrong types, async issues, missing imports, stale state
4. **Add diagnostic logging** if needed (temporary)
5. **Fix the root cause** - not just the symptoms
6. **Verify the fix** - run tests or demonstrate it works
7. **Clean up** - remove any temporary debug code
