# Domain Scraper Listing Platform

A robust domain scraping system that extracts dropped domains from ExpiredDomains.net with precision filters. Built with Next.js 16 (App Router), Playwright, Prisma, and PostgreSQL.

## Features

- **Automated Scraping:** Daily extraction of dropped `.com` domains using Playwright Stealth.
- **Precision Filters:** Automatic filtering for name length (≤12), no numbers/hyphens, and history (ABY ≥ 2).
- **Interactive Dashboard:** Unified view with live search, sortable columns, and pagination.
- **Scrape Tracking:** Monitor the history and status of scrape runs directly in the UI.
- **API Access:** REST API for domain data and manual scrape triggers.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Scraper:** Playwright (Stealth mode)
- **Database:** PostgreSQL via Prisma ORM
- **Styling:** Tailwind CSS v4
- **Automation:** `node-cron`

## Setup Instructions

### 1. Prerequisites
- Node.js 18+
- PostgreSQL database

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```env
DATABASE_URL=postgresql://...
EXPIREDDOMAINS_EMAIL=your@email.com
EXPIREDDOMAINS_PASSWORD=yourpassword
SCRAPE_SECRET=your-random-token
```

### 3. Database Setup
```bash
npx prisma migrate dev
```

### 4. Running the Scraper
#### Manual (Terminal):
```bash
# Recommended for manual testing
npx ts-node scripts/scrape.ts
```

#### Manual (API):
```bash
curl -X POST http://localhost:3000/api/scrape -H "x-scrape-secret: YOUR_SECRET"
```

### 5. Development Server
```bash
npm run dev
```

## Anti-Bot Design
This system uses several strategies to avoid detection:
- **Stealth Mode:** Playwright extra stealth plugin.
- **Session Persistence:** Cookies are stored in `lib/scraper/session.json` to prevent repeated logins.
- **Human Mimicry:** Random 1–3s delays between navigation and clicks to emulate real user behavior.
- **Headless Options:** Can be toggled in `lib/scraper/browser.ts`.
