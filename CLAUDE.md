# Survey Swap

Full-stack web app where users post their own surveys and complete others' surveys in exchange (swap-credit model).

## Stack

### Frontend (`frontend/`)
- React 19 + Vite 7
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router 7
- framer-motion (animations)
- axios (API calls)
- `@react-oauth/google` — Google Sign-In
- react-icons
- Deployed via Vercel (`vercel.json`)

### Backend (`backend/`)
- Node.js + Express 5
- Sequelize ORM + `pg` (PostgreSQL)
- JWT (`jsonwebtoken`) + bcryptjs for password hashing
- `google-auth-library` for Google OAuth verification
- `cors`, `dotenv`
- Dev: `nodemon`

## Layout
```
Survey Swap/
├── backend/
│   ├── server.js            # Express entrypoint
│   ├── seed.js              # DB seeder
│   ├── middleware/          # Auth middleware etc.
│   ├── models/              # Sequelize: User, Survey, SurveyResponse, SurveyCompletion
│   └── routes/              # auth.js, surveys.js, users.js
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── vercel.json
    └── src/
        ├── main.jsx / App.jsx
        ├── api/             # axios clients
        ├── components/
        ├── context/         # React context (likely auth)
        └── pages/
```

## Running
```bash
# Backend (port 5000)
cd backend && npm install && npm run dev

# Frontend (port 5173)
cd frontend && npm install && npm run dev
```
Both must run simultaneously. Configure `.env` in `backend/` with `DATABASE_URL`, `JWT_SECRET`, Google OAuth creds.

## Data model (Sequelize, `backend/models/`)
- **User** — auth identity (email/password + Google).
- **Survey** — user-authored survey.
- **SurveyResponse** — a user's answers to a survey.
- **SurveyCompletion** — tracks completions (likely drives swap-credit logic).
- `index.js` wires associations — read it before altering models.

## Where to make changes
- **New API route** → add file under `backend/routes/`, mount in `server.js`.
- **New page** → add under `frontend/src/pages/`, wire in router.
- **Shared API client** → `frontend/src/api/`.
- **Auth flow changes** → backend `middleware/` + `routes/auth.js`, frontend `context/`.

## Conventions
- Backend is CommonJS (`"type": "commonjs"`).
- Frontend is ESM (`"type": "module"`).
- Use Tailwind utility classes — no separate CSS modules.
- Keep JWT verification in middleware; never re-implement per route.

## Gotchas
- Express **5** is in use — error-handling semantics differ from Express 4 (async errors auto-forwarded). Don't copy-paste Express-4-era try/catch patterns blindly.
- React 19 + React Router 7 — use the latest router API (Data Router / `createBrowserRouter`), not v6 `<BrowserRouter>` patterns from stale tutorials.
- Tailwind v4 uses the new `@tailwindcss/vite` plugin — no `tailwind.config.js` needed in the traditional sense.
- No test suite yet.
