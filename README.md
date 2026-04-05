# SocialJet CRM Frontend

SocialJet is a high-performance, industry-standard CRM built for agency-scale influencer marketing. This frontend is engineered for pixel-perfect UI, lag-free UX, and a strictly modular architecture.

## 🚀 Key Features

- **Sales Dashboard:** Role-based analytics with conversion funnels and lead distribution charts.
- **Lead Capture:** Automated ingestion of prospective influencer campaigns.
- **Nurture Agent:** AI-assisted conversational flows for warming up leads via LinkedIn and WhatsApp.
- **Sales Intelligence:** AI call analysis with automated transcript processing, discussion points extraction, and proposal generation.
- **Dynamic Proposals:** High-fidelity, document-style proposal previews generated directly from AI insights.

## 🏗️ Architecture 

This project follows a strict **Atomic/Modular Architecture** to ensure horizontal scalability:

- **Next.js 15 (App Router):** Using the latest server component patterns for maximum performance.
- **Strict TypeScript:** Zero `any` policy with robust type definitions for roles and API responses.
- **CSS Modules:** 100% encapsulated styling with zero Tailwind or global runtime dependencies.
- **Design Tokens:** All UI values (colors, spacing, shadows) are derived from a centralized `variables.css` system.
- **Folder Consistency:** Every component is a specialized unit: `ComponentName/index.ts` + `.tsx` + `.module.css`.

## 🛠️ Technology Stack

- **Framework:** [Next.js 15](https://nextjs.org/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching:** [React Query (TanStack)](https://tanstack.com/query/latest)
- **Styling:** CSS Modules (Vanilla CSS)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** Custom SVG Components

## 🏁 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or pnpm

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:PG-AGI/socialjet-frontend.git
   cd socialjet-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📜 Coding Standards

We follow strict linting and architectural rules defined in `AGENTS.md` and `ARCHITECTURE.md`.

- Always use **Absolute Imports** (`@/components/...`).
- **Server Components** by default.
- Zero business logic in components (use hooks/services).

---

Developed with ❤️ by SocialJet Engineering.
