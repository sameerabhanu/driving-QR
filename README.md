# QR Driving Pages

A production-ready platform for creating QR-coded landing pages for driving schools. Each school gets a unique URL, QR code, and mobile-optimized landing page with WhatsApp, call, and directions buttons.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Neon PostgreSQL**
- **Drizzle ORM**
- **Server Actions**

## Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
ADMIN_PASSWORD=your-secure-admin-password
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `ADMIN_PASSWORD` | Password for admin dashboard login |
| `NEXT_PUBLIC_BASE_URL` | Public base URL used for QR code generation (e.g. `https://mydomain.com`) |

**Important:** QR codes are generated using `NEXT_PUBLIC_BASE_URL/{slug}`. Never hardcode domain names.

## Installation

```bash
npm install
```

## Database Setup

### 1. Create a Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL` in your `.env`

### 2. Run Migrations

Push the schema to your database:

```bash
npm run db:push
```

Or run migrations:

```bash
npm run db:migrate
```

### 3. Drizzle Studio (Optional)

Inspect your database visually:

```bash
npm run db:studio
```

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public homepage.

Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## Project Structure

```
src/
├── actions/          # Server Actions (auth, schools)
├── app/
│   ├── admin/        # Admin dashboard pages
│   ├── api/qr/       # QR code download API
│   ├── [slug]/       # Driving school landing pages
│   └── page.tsx      # Public homepage
├── components/       # UI and admin components
├── db/               # Drizzle schema and connection
└── lib/              # Utilities, auth, QR generation
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Public SaaS homepage |
| `/admin` | Admin dashboard with school management |
| `/admin/schools/new` | Add new driving school |
| `/admin/renewals` | Monthly renewal tracking with CSV export |
| `/[slug]` | Driving school landing page (QR destination) |

## Expiry Rules

- Created on **day 1** of a month → expires same day next year
- Created on **any other day** → expires first day of next month next year

Examples:
- `2026-06-01` → `2027-06-01`
- `2026-06-02` → `2027-07-01`
- `2026-06-15` → `2027-07-01`

## Vercel Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Add environment variables in Project Settings → Environment Variables:
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_BASE_URL` (set to your Vercel domain, e.g. `https://mydomain.com`)
3. Deploy

### 3. Run Database Migration

After first deploy, run migrations against your production database:

```bash
DATABASE_URL="your-production-url" npm run db:push
```

Or use the Vercel CLI / Neon console to run the SQL from `drizzle/0000_initial.sql`.

### 4. Custom Domain

If using a custom domain, update `NEXT_PUBLIC_BASE_URL` to match and redeploy so QR codes point to the correct URL.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate new migration |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |

## License

Private — All rights reserved.
