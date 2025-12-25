# Freelance-Job-Board
This project is about creating a web application for companies to post projects and people who wish to work on them can bid and apply for the wanted job. A payment tracking system will also be implemented into this web application.

## Frontend (Angular)
The Angular SPA lives in `frontend/` and talks to the backend via `/api/*`.

Auth is intentionally not implemented right now (no login/signup flow).

To run the frontend locally (recommended):

1. Start the backend API (see next section).
2. From project root run: `npm run start:frontend`
	- This installs frontend deps (to avoid common Windows install issues) and starts `ng serve` with a proxy to `http://localhost:3000`.

To build for production:

- `npm run build:frontend`

If you use the included Express server, it will serve the built SPA automatically from `frontend/dist/frontend` when that folder exists.

1. `npm run build:frontend`
2. `npm run dev` — the server will detect `frontend/dist/frontend` and serve it.

## Backend (Express + SQLite)

### Run locally

From project root:

1. `npm install`
2. `npm run init-db` (creates/initializes the SQLite schema)
3. `npm run dev`

The API health endpoint is:

- `GET /api/health` → `{ success: true, data: { status: 'ok' } }`

### API response format

- Success: `{ success: true, data }`
- Error: `{ success: false, error: { message, code?, details? } }`
- `DELETE` endpoints return `204 No Content` (no body).

### Tests & checks

- Frontend unit tests (basic specs) are available in `frontend/src/app/.../*.spec.ts`. To run frontend tests (requires Angular dev dependencies):

```bash
cd frontend
npm install
npm run test
```

- TypeScript check for the frontend:

```bash
cd frontend
npm run check:ts
```

This checks the Angular app build config (not Cypress or unit-test typings).

- CI (GitHub Actions) runs:
	- frontend build
	- frontend unit tests
	- backend health smoke test
	- Cypress E2E against a built SPA served on port 4200 (proxying `/api` to the backend on port 3000)


