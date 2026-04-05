<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## SocialJet CRM Frontend Rules

- This project is the SocialJet CRM frontend built with Next.js (App Router), TypeScript (strict), CSS Modules, Zustand, React Query, and Axios.
- ALWAYS read ARCHITECTURE.md at the project root before making structural decisions.
- ALWAYS follow .agent/workflows/ when creating components, pages, services, hooks, or stores.
- Use CSS Modules (.module.css) ONLY — never inline styles, never Tailwind, never global CSS classes in components.
- All CSS values (colors, spacing, fonts, shadows, radii) MUST use design tokens from src/styles/variables.css.
- Every component MUST be a folder: ComponentName/ComponentName.tsx + ComponentName.module.css + index.ts
- Use absolute imports only: @/components/..., @/hooks/..., @/lib/..., @/services/...
- Never put business logic in components — use hooks, services, or stores.
- Server Components by default — only add 'use client' when the component uses hooks, state, effects, or event handlers.
- All API URLs are defined ONLY in src/services/api/endpoints.ts — never hardcode URLs.
- TypeScript strict mode: no 'any' type allowed. Use 'unknown' for truly unknown types.
- Pages use default export (Next.js convention). All other components use named exports.
