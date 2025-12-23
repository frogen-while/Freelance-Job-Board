# Freelance-Job-Board
This project is about creating a web application for companies to post projects and people who wish to work on them can bid and apply for the wanted job. A payment tracking system will also be implemented into this web application.

## Frontend (Angular)
A minimal Angular skeleton is available in `frontend/` with examples of `ApiService`, `AuthService`, a `Header` component and `Home` component.

To run the frontend locally (recommended):

1. Install Angular CLI (if needed): `npm i -g @angular/cli`
2. From project root: `npm run start:frontend` — this will install frontend deps and start `ng serve` with a proxy to `http://localhost:3000`.

To build for production:

- `npm run build:frontend` then copy `frontend/dist` into your server `public/` or configure your server to serve static files from that directory.

If you use the included Express server, after building the frontend run the server (from project root):

1. `npm run build:frontend`
2. `npm run dev` (or `tsx src/server.ts`) — the server will detect `frontend/dist/frontend` and serve it automatically as static files.

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

- Simple CI (GitHub Actions) is included to run frontend build, tests and E2E on push to `main`. The workflow uses `npm ci` with the checked-in `frontend/package-lock.json` for deterministic installs, builds the app, serves the built artifacts on port 4200 and runs Cypress headless (E2E).


