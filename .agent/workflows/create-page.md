---
description: How to create a new page under a role's route group
---

# Create Page Workflow

## Route Group Structure

All pages live under `src/app/` in the correct route group:

```
src/app/
├── (auth)/          → Login, forgot-password, reset-password (no auth required)
├── (dashboard)/     → Protected pages (requires authentication)
│   ├── sales/       → Sales role pages
│   ├── campaigns/   → Campaign Manager role pages
│   ├── finance/     → Finance role pages
│   ├── admin/       → Admin role pages
│   └── shared/      → Cross-role pages (profile, notifications, settings)
└── (client)/        → Client-facing portal (auth TBD)
```

## Steps

### Step 1: Identify the correct route group

- Ask/determine which **role** this page belongs to
- Place it under the correct role folder in `(dashboard)/`
- If it's accessible by multiple roles, place it under `(dashboard)/shared/`
- If it's an auth page, place under `(auth)/`

### Step 2: Create the page folder and file

```
src/app/(dashboard)/{role}/{page-name}/page.tsx
```

- Folder name = **kebab-case** (e.g., `deal-tracking`, `lead-management`)
- File is always `page.tsx`

### Step 3: Page file template

```tsx
// Add 'use client' ONLY if the page uses hooks/state/effects
// Otherwise, keep it as a Server Component for performance

import styles from './page.module.css';

export default function PageNamePage() {
  return (
    <main className={styles.root}>
      <h1>Page Title</h1>
    </main>
  );
}
```

**Rules:**

- Pages use **default export** (Next.js requirement)
- Page components are named `{PageName}Page` (e.g., `LeadsPage`, `PipelinePage`)
- Create a `page.module.css` alongside `page.tsx` for page-specific styles
- Use components from `@/components/` — never build complex UI directly in the page
- Server Components by default — only add `'use client'` when necessary

### Step 4: Create `page.module.css`

```css
.root {
  padding: var(--space-6);
}
```

### Step 5: Update role config if needed

If this page should appear in the sidebar navigation, update `src/lib/roleConfig.ts` to include the new route in the role's navigation items.

### Step 6: Loading & Error states (optional)

For important pages, consider adding:

- `loading.tsx` — Loading skeleton for the page
- `error.tsx` — Error boundary for the page

These are placed alongside `page.tsx` in the same folder.
