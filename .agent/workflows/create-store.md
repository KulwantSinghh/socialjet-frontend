---
description: How to create a Zustand store for client-side state management
---

# Create Zustand Store Workflow

## When to use Zustand vs React Query

| Use Zustand for                              | Use React Query for                      |
| -------------------------------------------- | ---------------------------------------- |
| Auth state (user, token, isAuthenticated)    | Server data (leads, campaigns, invoices) |
| UI state (sidebar open, theme, active modal) | API responses with caching needs         |
| Client-only state (form drafts, preferences) | Data that needs background refetching    |
| Notification queue, toast messages           | Paginated/infinite lists                 |

## Steps

### Step 1: Create store file

```
src/stores/{domain}Store.ts
```

- File name = `{domain}Store.ts` (camelCase + `Store` suffix)

### Step 2: Store template

```ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,

        // Actions
        setUser: (user) => set({ user, isAuthenticated: true }),
        setToken: (token) => set({ token }),
        logout: () => set({ user: null, token: null, isAuthenticated: false }),
      }),
      {
        name: 'auth-storage', // localStorage key
        partialize: (state) => ({ token: state.token }), // Only persist token
      }
    ),
    { name: 'AuthStore' } // DevTools label
  )
);
```

**Rules:**

- Use `devtools` middleware in all stores (for debugging)
- Use `persist` middleware ONLY for state that must survive page refresh (auth token, theme preference)
- Use `partialize` to persist only what's needed — never persist the entire store
- State and actions are defined in the same interface
- Export the hook directly (`useAuthStore`), not the store object
- Store names follow pattern: `use{Domain}Store`
