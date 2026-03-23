---
name: optimize
description: Optimizes code for performance, bundle size, or readability
---

When optimizing ($ARGUMENTS):

1. **Read and profile the code** - identify the bottleneck
2. **Measure before changing** - establish a baseline
3. **Apply optimizations**:
   - Algorithm improvements (O(n^2) -> O(n log n))
   - Memoization / caching
   - Lazy loading / code splitting
   - Reduce unnecessary re-renders (React)
   - Batch operations
4. **Preserve correctness** - optimizations must not break behavior
5. **Run tests** after changes
6. **Report improvements** with before/after comparison
