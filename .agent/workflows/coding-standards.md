---
description: General coding standards and conventions for the SocialJet CRM frontend
---

# Coding Standards

## Import Order

Imports must follow this order (ESLint enforces this):

```ts
// 1. React / Next.js
import { useState } from 'react';
import Image from 'next/image';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal modules (absolute imports)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';

// 4. Types
import type { User } from '@/types/auth.types';

// 5. Styles (always last)
import styles from './Component.module.css';
```

## Naming Conventions

| Thing           | Convention                | Example                         |
| --------------- | ------------------------- | ------------------------------- |
| Components      | PascalCase                | `LeadCard`, `FilterPanel`       |
| Component files | PascalCase.tsx            | `LeadCard.tsx`                  |
| CSS Modules     | PascalCase.module.css     | `LeadCard.module.css`           |
| CSS classes     | camelCase                 | `.actionButton`, `.headerTitle` |
| Hooks           | camelCase, `use` prefix   | `useDebounce`, `useAuth`        |
| Services        | camelCase, `.service.ts`  | `auth.service.ts`               |
| Stores          | camelCase, `Store` suffix | `authStore.ts`                  |
| Types           | PascalCase, `.types.ts`   | `auth.types.ts`                 |
| Pages/routes    | kebab-case folders        | `forgot-password/page.tsx`      |
| Constants       | SCREAMING_SNAKE_CASE      | `MAX_PAGE_SIZE`, `API_BASE_URL` |
| Enums           | PascalCase                | `UserRole.Sales`                |

## Component Rules

1. **Named exports only** (except pages which use default export per Next.js convention)
2. **No business logic in components** — use hooks, services, or stores
3. **`'use client'` only when needed** — Server Components by default
4. **Props interface defined in same file**, named `{Component}Props`
5. **No inline styles** — always CSS Modules
6. **No global CSS classes in components** — only `styles.xxx`

## TypeScript Rules

1. **Strict mode enabled** — no `any` type allowed
2. **Use `interface` for object shapes**, `type` for unions/intersections
3. **All function parameters and return types must be typed**
4. **Use `type` imports**: `import type { User } from '...'`
5. **Prefer `unknown` over `any`** for truly unknown types

## CSS Module Rules

1. **Every component has its own `.module.css`** — no sharing CSS Modules between components
2. **Use design tokens** from `variables.css` for all values:
   - Colors: `var(--color-xxx)`
   - Spacing: `var(--space-xxx)`
   - Typography: `var(--font-xxx)`, `var(--text-xxx)`
   - Shadows: `var(--shadow-xxx)`
   - Border radius: `var(--radius-xxx)`
3. **Dark mode**: Use `[data-theme='dark']` selector
4. **Responsive**: Use the breakpoint variables or media queries defined in `variables.css`

## File Organization Rules

1. **No file should exceed 200 lines** — split into smaller components/hooks
2. **Each module has a single responsibility**
3. **Barrel exports** (`index.ts`) in every component folder
4. **Absolute imports only**: `@/components/...`, never `../../../components/...`

## Git Commit Rules

Pre-commit hooks automatically run:

1. ESLint (with `--max-warnings 0`)
2. Prettier formatting
3. TypeScript type checking (`tsc --noEmit`)

All must pass before a commit is accepted.
