# Frontend (Angular) — skeleton

This folder contains a minimal Angular skeleton integrated with the existing Express API. I migrated the main homepage styles and UI into the Angular app (header + home + categories + styles).

Quick start (recommended approach using Angular CLI):

1. Install Angular CLI if you don't have it:
   ```bash
   npm i -g @angular/cli
   ```

2. From repository root, install frontend dependencies and run dev server:
   ```bash
   cd frontend
   npm install
   ng serve --proxy-config proxy.conf.json
   ```

Dev notes:
- Dev server uses `proxy.conf.json` to forward `/api` requests to `http://localhost:3000` (your backend).
- `ApiService` (in `src/app/core`) calls `/api/*` endpoints; `environment.apiBase` points to `/api` for dev.
- Migrated items:
  - Copied full `public/style.css` into `frontend/src/styles.scss`.
  - Implemented `HeaderComponent` with sticky scroll behavior.
  - Implemented `HomeComponent` with hero, tab buttons, search box and categories grid (fetches `/api/jobs` & `/api/categories`).
  - Simple `AuthService` and `AuthInterceptor` scaffolded for JWT handling.

Next steps I can do on request:
- Add more UI pages (payments, assignments, support tickets), improve forms and validations, and implement role-based views.
- Add full test coverage and E2E tests (Cypress) and CI improvements.

What I did in this iteration:
- Migrated header, home, categories and jobs list/detail into Angular components
- Implemented Login and Signup components and AuthService
- Copied CSS to `styles.scss` and wired components to it
- Added basic unit tests and a simple CI workflow

To run tests locally:

```bash
cd frontend
npm install
npm run test
```

If you'd like, I'll now: add E2E tests (Cypress), finish final cleanup (remove unused files), and run a full TypeScript/Lint pass.

Reply with which of these you'd like next: **"e2e"**, **"cleanup"**, **"ts-check"**, or **"all"**.
