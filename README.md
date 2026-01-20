# SkillConnect

A web application for posting projects and hiring freelancers. Companies can post job listings, and freelancers can apply and complete work. Includes payment tracking, reviews, and messaging system.

## Table of Contents

- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Requirements

Before you begin, make sure you have the following installed:

| Software | Version | Check Installation |
|----------|---------|-------------------|
| **Node.js** | 18.x or higher | `node --version` |
| **npm** | 9.x or higher | `npm --version` |
| **Git** | any | `git --version` |

### Installing Node.js

**Windows:**
1. Download the installer from [nodejs.org](https://nodejs.org/)
2. Choose the LTS version (recommended)
3. Run the installer and follow the instructions
4. Restart your terminal after installation

**macOS (via Homebrew):**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/frogen-while/Freelance-Job-Board.git
cd Freelance-Job-Board

# 2. Install backend dependencies
npm install

# 3. Initialize the database
npm run init-db

# 4. Start the backend (in a separate terminal)
npm run dev

# 5. Start the frontend (in a new terminal)
npm run start:frontend
```

After starting:
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000/api

---

## Detailed Installation

### 1. Clone the Repository

```bash
git clone https://github.com/frogen-while/Freelance-Job-Board.git
cd Freelance-Job-Board
```

### 2. Install Backend Dependencies

```bash
npm install
```

This will install:
- `express` — web server
- `sqlite3` / `sqlite` — database
- `bcrypt` — password hashing
- `jsonwebtoken` — JWT authentication
- `cors` — Cross-Origin Resource Sharing
- `dotenv` — environment variables
- `tsx` — TypeScript runner

### 3. Initialize the Database

```bash
npm run init-db
```

This command creates the `db/freelance.sqlite3` file with all required tables:
- `Users` — user accounts
- `Profiles` — freelancer profiles
- `Skills` — skills
- `Categories` — job categories
- `Jobs` — job listings/projects
- `JobApplications` — job applications
- `Assignments` — freelancer assignments
- `Payments` — payments
- `Messages` — messages
- `Reviews` — reviews
- `SupportTickets` — support tickets

### 4. Install Frontend Dependencies (optional)

Frontend dependencies are installed automatically when running `npm run start:frontend`. To install manually:

```bash
cd frontend
npm install
cd ..
```

---

## Running the Project

### Development Mode (recommended)

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
npm run dev
```
Server will start at http://localhost:3000

**Terminal 2 — Frontend:**
```bash
npm run start:frontend
```
Angular app will open at http://localhost:4200

### Production Build

```bash
# Build the frontend
npm run build:frontend

# Start the server (will serve the built frontend)
npm run dev
```

After building, the Express server automatically serves static files from `frontend/dist/frontend`.

---

## Project Structure

```
Freelance-Job-Board/
├── package.json          # Backend dependencies and scripts
├── README.md             # This file
├── db/
│   └── freelance.sqlite3 # SQLite database
├── docs/
│   └── REST_endpoints.md # API documentation
├── frontend/             # Angular application
│   ├── package.json      # Frontend dependencies
│   ├── angular.json      # Angular configuration
│   ├── proxy.conf.json   # API request proxy
│   └── src/
│       ├── app/          # Application components
│       ├── assets/       # Static files
│       └── environments/ # Environment configurations
└── src/                  # Backend (Express + TypeScript)
    ├── server.ts         # Server entry point
    ├── app.ts            # Express configuration
    ├── config/
    │   └── init_db.ts    # Database initialization
    ├── controllers/      # Request handlers
    ├── interfaces/       # TypeScript interfaces
    ├── repositories/     # Database operations
    ├── routes/           # API routes
    └── utils/            # Helper functions
```

---

## API Endpoints

Full API documentation is available at [docs/REST_endpoints.md](docs/REST_endpoints.md).

### Main Endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Register |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/jobs` | List jobs |
| `POST` | `/api/jobs` | Create job |
| `GET` | `/api/profiles` | Freelancer profiles |
| `POST` | `/api/jobapplications` | Submit application |
| `GET` | `/api/health` | API health check |

### API Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

---

## Testing

### Unit Tests (Frontend)

```bash
cd frontend
npm install
npm run test
```

### TypeScript Check

```bash
cd frontend
npm run check:ts
```

### E2E Tests (Cypress)

```bash
# Run in interactive mode
cd frontend
npm run e2e:open

# Run in CLI mode
npm run e2e:run
```

### API Health Check

```bash
# Check that the server is running
curl http://localhost:3000/api/health
```

Expected response:
```json
{"success":true,"data":{"status":"ok"}}
```

---

## Available Scripts

### Root package.json

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend in development mode |
| `npm run init-db` | Initialize the database |
| `npm run start:frontend` | Install dependencies and start Angular |
| `npm run build:frontend` | Production build of frontend |

### Frontend package.json

| Command | Description |
|---------|-------------|
| `npm start` | Start Angular dev server |
| `npm run build` | Build project |
| `npm run test` | Run unit tests |
| `npm run e2e:open` | Cypress in interactive mode |
| `npm run check:ts` | TypeScript check |

---

## Troubleshooting

### Error: `node-gyp` / `bcrypt` won't install

**Windows:** Install build tools:
```bash
npm install --global windows-build-tools
```

Or install Visual Studio Build Tools manually.

### Error: EACCES when installing npm packages

**Linux/macOS:** Don't use `sudo npm install`. Instead, configure npm to work without sudo:
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Error: Port 3000 already in use

Find and stop the process:

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/macOS:**
```bash
lsof -i :3000
kill -9 <PID>
```

### Error: SQLITE_CANTOPEN

Make sure the `db/` folder exists:
```bash
mkdir db
npm run init-db
```

### Frontend can't reach API

1. Make sure the backend is running on port 3000
2. Check `frontend/proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

### Clean reinstall

```bash
# Remove node_modules
rm -rf node_modules
rm -rf frontend/node_modules

# Remove database
rm db/freelance.sqlite3

# Reinstall everything
npm install
npm run init-db
```

---

## License

ISC

---

## Authors

University WAD Project


