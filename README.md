Mapear Backend (Node.js + TypeScript + Prisma + MySQL)

Setup

1. Copy `.env.example` to `.env` and set values.
2. Ensure MySQL is running and `DATABASE_URL` points to your DB.
3. Install deps and generate client:

```bash
npm install
npm run prisma:generate
```

4. Apply migrations:

```bash
npx prisma migrate deploy
```

5. Dev server:

```bash
npm run dev
```

Auth

- POST `/auth/google` with `{ idToken }` to login via Google. Returns `{ token, user }`.

Games

- POST `/games/sessions` start session `{ gameKey }`
- PATCH `/games/sessions/:id` update `{ correctDelta, totalDelta, timeDeltaSeconds, complete }`
- GET `/games/sessions?gameKey=...` list sessions

Course

- PUT `/course/progress` upsert `{ courseKey, moduleKey, score, timeSpentSeconds, completed }`
- GET `/course/progress?courseKey=...` list progress

Analytics

- GET `/analytics/me` summarizes totals for authenticated user

Testing

```bash
npm test
```

Tests mock Google and Prisma; no external services are called.

# mapear
MAPEAR
