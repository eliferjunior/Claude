---
name: git-helper
description: Helps with git operations like branching, merging, resolving conflicts
---

When helping with git ($ARGUMENTS):

1. **Check current state**: `git status`, `git branch`, `git log --oneline -10`
2. **Understand the request** - branch, merge, rebase, conflict resolution, etc.
3. **Execute safely**:
   - Never force push to main/master
   - Always confirm destructive operations
   - Prefer creating new commits over amending
4. **Explain what was done** and the current state after
