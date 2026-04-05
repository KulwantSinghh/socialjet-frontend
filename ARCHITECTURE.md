# SocialJet CRM — Frontend Architecture

> **Read this before making any changes to the codebase.**

## Tech Stack

| Layer           | Technology                  |
| --------------- | --------------------------- |
| Framework       | Next.js 15 (App Router)     |
| Language        | TypeScript (strict mode)    |
| Styling         | CSS Modules (`.module.css`) |
| Server State    | TanStack React Query v5     |
| Client State    | Zustand                     |
| HTTP Client     | Axios (centralized)         |
| Forms           | React Hook Form + Zod       |
| Charts          | Recharts                    |
| Package Manager | npm                         |

## User Roles

| Role               | Route Prefix   | Description                                        |
| ------------------ | -------------- | -------------------------------------------------- |
| `sales`            | `/sales/*`     | Sales team — leads, pipeline, deals, reports       |
| `campaign_manager` | `/campaigns/*` | Campaign management — create, analytics, templates |
| `finance`          | `/finance/*`   | Finance — invoices, billing, revenue reports       |
| `admin`            | `/admin/*`     | Admin — user management, roles, settings           |
| `client`           | `/client/*`    | Client portal — auth TBD, may be public            |

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (no sidebar, no auth required)
│   ├── (dashboard)/        # Protected pages (sidebar + topbar)
│   │   ├── sales/
│   │   ├── campaigns/
│   │   ├── finance/
│   │   ├── admin/
│   │   └── shared/         # Cross-role pages
│   └── (client)/           # Client portal (auth TBD)
│
├── components/
│   ├── ui/                 # Atomic components (Button, Input, Modal, etc.)
│   ├── layout/             # Layout components (Sidebar, Topbar, etc.)
│   └── shared/             # Shared business components (DataTable, Charts, etc.)
│
├── hoc/                    # Higher-Order Components (withAuth, withRole, withErrorBoundary)
├── hooks/                  # Custom React hooks
├── services/               # API services
│   └── api/                # Axios client, endpoints, API types
├── stores/                 # Zustand stores
├── providers/              # React context providers
├── lib/                    # Utils, constants, validators, role config
├── types/                  # Global TypeScript types
└── styles/                 # Global styles, design tokens, CSS variables
```

## Data Flow

```
Component → React Query (useQuery/useMutation) → Service → Axios Client → endpoints.ts → API
```

- **Components** render UI only. No direct API calls.
- **React Query hooks** (in `hooks/`) handle caching, loading states, refetching.
- **Services** (in `services/`) make typed HTTP calls via the centralized Axios client.
- **Endpoints** (in `services/api/endpoints.ts`) define ALL API URLs in one place.
- **Axios client** (in `services/api/client.ts`) handles auth token injection, refresh, error normalization.

## Auth Flow

```
middleware.ts (edge)
├── No token → Redirect to /login
├── Expired token → Redirect to /login
├── Valid token + /login → Redirect to role's default dashboard
└── Valid token + wrong role route → Redirect to user's correct dashboard
```

- **middleware.ts**: First line of defense (runs at the edge, before page loads)
- **withAuth HOC**: Second line of defense (component-level redirect)
- **withRole HOC**: Third line of defense (role-specific access control)

## Styling Rules

1. **CSS Modules only** — no inline styles, no global classes in components
2. **Design tokens** — all values (colors, spacing, fonts, shadows, radii) come from CSS custom properties in `styles/variables.css`
3. **Dark mode** — toggle via `data-theme` attribute on `<html>`, use `[data-theme='dark']` selectors in CSS Modules
4. **Each component has its own `.module.css`** — no sharing CSS Modules

## Component Convention

Every component is a folder:

```
ComponentName/
├── ComponentName.tsx          # Named export, typed props
├── ComponentName.module.css   # Scoped styles using design tokens
└── index.ts                   # Barrel export
```

## Key Files

| File                            | Purpose                                          |
| ------------------------------- | ------------------------------------------------ |
| `src/middleware.ts`             | Auth guard + role routing at the edge            |
| `src/lib/roleConfig.ts`         | Role → default route, sidebar items, permissions |
| `src/services/api/client.ts`    | Centralized Axios instance with interceptors     |
| `src/services/api/endpoints.ts` | All API endpoint URLs                            |
| `src/stores/authStore.ts`       | Auth state (user, token, isAuthenticated)        |
| `src/styles/variables.css`      | Design tokens (colors, spacing, fonts, shadows)  |

## Performance Rules

1. **Server Components by default** — only add `'use client'` when using hooks/state/effects
2. **Dynamic imports** for heavy components (charts, editors): `next/dynamic`
3. **Image optimization** via Next.js `<Image>` component
4. **React Query caching** — `staleTime: 5min` for lists, `30s` for dashboards
5. **Route-based code splitting** — automatic via App Router structure
