# Server

This server aggregates jobs from the local database and the Adzuna API, with rate limiting to protect API quota.

## Environment
Create a `.env` file in the `server/` folder with:

ADZUNA_APP_ID=your_app_id
ADZUNA_API_KEY=your_api_key

Optionally set `DATABASE_URL` for Prisma if you use DB features.

## Run
Install dependencies and start the server:

```bash
cd server
npm install
node index.js
```

## Jobs API
- GET `/api/jobs`
  - Query params: `q` (search), `location`, `page`, `country` (default: `us`).
  - Returns combined array from Adzuna and DB.
  - Rate limited to prevent exceeding Adzuna quota.
