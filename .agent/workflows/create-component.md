---
description: How to create a new React component following the project architecture
---

# Create Component Workflow

## Rules

1. **Every component MUST be a folder** inside `src/components/` under the correct category:
   - `src/components/ui/` — Atomic/base components (Button, Input, Modal, Card, Badge, etc.)
   - `src/components/layout/` — Layout-level components (Sidebar, Topbar, PageHeader, BreadCrumbs)
   - `src/components/shared/` — Shared business components (DataTable, Charts, FilterPanel, SearchBar)

2. **Folder name** = PascalCase, matching the component name.

3. **Every component folder MUST contain exactly these files:**

```
ComponentName/
├── ComponentName.tsx          # Component implementation
├── ComponentName.module.css   # Scoped CSS Module styles
└── index.ts                   # Barrel export
```

4. **No exceptions** to this structure.

## Steps

### Step 1: Create the folder

```
src/components/{category}/ComponentName/
```

### Step 2: Create `ComponentName.tsx`

```tsx
import styles from './ComponentName.module.css';

interface ComponentNameProps {
  // Define props here
}

export const ComponentName = ({ ...props }: ComponentNameProps) => {
  return <div className={styles.root}>{/* Component content */}</div>;
};
```

**Rules for the .tsx file:**

- Export as **named export** (not default)
- Props interface is defined in the same file, named `ComponentNameProps`
- Use `styles.xxx` from the CSS Module — **never inline styles, never global classes**
- Add `'use client'` directive ONLY if the component uses hooks, state, effects, or event handlers
- Keep business logic OUT — use hooks from `src/hooks/` or stores from `src/stores/`
- Use absolute imports: `@/components/...`, `@/hooks/...`, `@/lib/...`

### Step 3: Create `ComponentName.module.css`

```css
.root {
  /* Use design tokens from variables.css */
  /* e.g., color: var(--color-text-primary); */
  /* e.g., padding: var(--space-4); */
}
```

**Rules for the CSS Module:**

- Use CSS custom properties from `src/styles/variables.css` for ALL values (colors, spacing, fonts, shadows, radii)
- Class names are camelCase (`.root`, `.header`, `.actionButton`)
- Support dark mode via `[data-theme='dark'] &` selectors where needed
- Never use `!important`
- Never use global selectors — CSS Modules handle scoping

### Step 4: Create `index.ts`

```ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

### Step 5: Verify import works

The component should be importable as:

```tsx
import { ComponentName } from '@/components/{category}/ComponentName';
```
