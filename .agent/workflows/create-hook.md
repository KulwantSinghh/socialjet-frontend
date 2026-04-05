---
description: How to create a custom React hook following project conventions
---

# Create Hook Workflow

## Rules

1. All custom hooks live in `src/hooks/`
2. File name = `use{HookName}.ts` (camelCase, prefixed with `use`)
3. Hook function name matches the file name exactly
4. Hooks are the ONLY place for reusable business logic (not components, not services)

## Steps

### Step 1: Create the hook file

```
src/hooks/use{HookName}.ts
```

### Step 2: Hook template

```ts
import { useState, useCallback } from 'react';

/**
 * Brief description of what this hook does.
 *
 * @example
 * const { value, toggle } = useHookName();
 */
export function useHookName() {
  // Implementation

  return {
    // Return object with named values (not array)
  };
}
```

**Rules:**

- Named export (not default)
- JSDoc with `@example` usage
- Return an **object** (not a tuple/array) for better readability at call sites
- Use TypeScript generics where applicable for reusability
- No direct API calls — delegate to services
- No direct DOM manipulation — use refs

### Step 3: Categories of hooks

| Category       | Examples                                          | Notes                                          |
| -------------- | ------------------------------------------------- | ---------------------------------------------- |
| **Data hooks** | `useInvoices`, `useLeads`                         | Wrap React Query (see create-service workflow) |
| **UI hooks**   | `useDebounce`, `useMediaQuery`, `useClickOutside` | Generic, reusable across project               |
| **Auth hooks** | `useAuth`, `useRole`                              | Access auth/role state from Zustand store      |
| **Form hooks** | `usePagination`, `useFilters`                     | Stateful logic for forms/tables                |
