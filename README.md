# Expensify — Personal Expense Tracker

Production-ready personal expense tracker built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, MongoDB, and Auth.js. This repo contains the **project scaffold** — folder structure, config, models, auth, and theme — ready for feature implementation.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Forms | React Hook Form + Zod |
| Data fetching | TanStack Query |
| Charts | Recharts |
| Backend | Next.js Route Handlers + Server Actions |
| Database | MongoDB Atlas + Mongoose |
| Auth | Auth.js (Google + Credentials), JWT sessions, bcrypt |
| File storage | Cloudinary (receipts) |
| Deployment | Vercel + MongoDB Atlas |
| Tooling | ESLint, Prettier, Husky, GitHub Actions |

## Theme / Color Palette

Colors are derived from the provided dashboard reference and defined as CSS variables + Tailwind tokens so light/dark mode both work out of the box.

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#6C5CE7` | Buttons, active nav, sidebar highlight |
| `success` | `#00B894` | Food & Grocery, positive values |
| `warning` | `#FDCB6E` | Shopping, goal progress |
| `danger` | `#FF6B81` | Expenses, negative deltas |
| `info` | `#54A0FF` | Travelling, informational charts |
| `accentPink` | `#FD79A8` | Misc category |
| `accentTeal` | `#00CEC9` | Bills & subscriptions |

See `tailwind.config.ts` and `app/globals.css`.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Folder Structure

```
expense-tracker/
├── app/
│   ├── (auth)/login, register, forgot-password
│   ├── dashboard/
│   ├── expenses/
│   ├── income/
│   ├── reports/
│   ├── budgets/
│   ├── goals/
│   ├── settings/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── expenses/
│   │   ├── income/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── goals/
│   │   └── reports/
│   ├── layout.tsx
│   ├── providers.tsx
│   └── globals.css
├── components/
│   ├── ui/            → shadcn primitives
│   ├── dashboard/
│   ├── expenses/
│   ├── income/
│   ├── charts/
│   └── shared/
├── lib/                → db.ts, auth.ts, utils.ts
├── models/             → User, Expense, Income, Category, Budget, Goal, Notification
├── services/           → API/business logic layer
├── hooks/              → custom React hooks
├── types/              → shared TS types
├── utils/              → helper functions
├── middleware.ts        → route protection
├── components.json      → shadcn config
├── tailwind.config.ts
└── package.json
```

## Database Collections

`users`, `expenses`, `income`, `categories`, `budgets`, `goals`, `notifications`

## Next Steps (Feature Build-Out)

This scaffold intentionally ships **structure and config only**. To build out features:

1. Run `npx shadcn@latest add button card dialog input select tabs toast avatar switch label dropdown-menu` to pull in UI primitives.
2. Implement CRUD API routes under `app/api/*` using the models in `models/`.
3. Build pages under `app/(auth)`, `app/dashboard`, `app/expenses`, etc.
4. Wire up TanStack Query hooks in `hooks/` for each resource.
5. Add Recharts-based visualizations in `components/charts/`.

## Deployment

1. Push to GitHub.
2. Import the repo into [Vercel](https://vercel.com/new).
3. Add environment variables from `.env.example` in the Vercel dashboard.
4. Provision a MongoDB Atlas cluster and whitelist Vercel's IPs (or allow all `0.0.0.0/0` for serverless).
5. Deploy — Vercel builds and hosts both frontend and API routes.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
