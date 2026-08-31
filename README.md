# CodeBazaar — Digital Marketplace Platform

A production-oriented Next.js marketplace for buying and selling code, scripts, plugins, and templates. Modeled on the UX patterns of major code marketplaces, with **original branding** (CodeBazaar).

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + custom UI primitives (shadcn-style)
- **Zustand** for cart state (persisted)
- **Prisma** schema ready (SQLite for local demo; switch to PostgreSQL for production)
- **NextAuth**, **Stripe** — structured for integration (env vars documented)

## Quick Start

```bash
cd marketplace
npm install --legacy-peer-deps
cp .env.example .env
npx prisma generate
npm run dev
```

Open http://localhost:3000

## Implemented

- Global layout (Header mega-menu, Footer, Cookie consent)
- Homepage (hero, categories, featured, bestsellers, value props)
- Item Card + Item Grid
- Category listing + Search with sort
- Item detail (license selector, add-to-cart, tabs)
- Cart (Zustand, persisted, license-aware)
- License types explainer
- Author storefront
- Sign-in stub
- Full Prisma domain schema

## License

MIT — original CodeBazaar branding. Do not use trademarked names or scraped assets.
