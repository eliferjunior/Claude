---
name: git-helper
description: Helps with git operations - commits, branches, merge conflicts, history
---

When helping with git ($ARGUMENTS):

1. **Check current state**: `git status`, `git branch`, `git log --oneline -10`
2. **Understand the request**: commit, branch, merge, rebase, conflict resolution, history search
3. **Execute safely**:
   - Always show what will happen before destructive operations
   - Prefer creating new commits over amending
   - Use descriptive branch names (feature/, fix/, chore/)
   - Write conventional commit messages
4. **Verify results**: Show the result of the operation
