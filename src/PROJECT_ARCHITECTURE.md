# SkillConnect Project Architecture

A detailed guide to the project structure and technologies for beginner developers.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What is a Web Application](#2-what-is-a-web-application)
3. [Project Technologies](#3-project-technologies)
4. [Folder Structure](#4-folder-structure)
5. [Backend (Server-Side)](#5-backend-server-side)
6. [Frontend (Client-Side)](#6-frontend-client-side)
7. [Database](#7-database)
8. [How Everything Works Together](#8-how-everything-works-together)
9. [Styles and Theming](#9-styles-and-theming)
10. [Configuration Files](#10-configuration-files)

---

## 1. Project Overview

**SkillConnect** is a web platform for job search and freelancer hiring.

### What the application does:

- **Employers** can publish jobs/projects
- **Freelancers** can browse jobs and submit applications
- Users can exchange messages
- After completing work, users can leave reviews
- The system tracks payments

### User Roles:

| Role | Description |
|------|-------------|
| Employer | Creates job listings, hires freelancers |
| Freelancer | Searches for work, submits applications |
| Support | Handles support tickets |

---

## 2. What is a Web Application

A web application consists of two parts:

```
+------------------+         +------------------+         +------------------+
|                  |         |                  |         |                  |
|    FRONTEND      | <-----> |    BACKEND       | <-----> |    DATABASE      |
|   (Browser)      |   API   |   (Server)       |   SQL   |  (Data Storage)  |
|                  |         |                  |         |                  |
+------------------+         +------------------+         +------------------+
     Angular                    Node.js                      SQLite
```

### Frontend
**What it is:** What the user sees in the browser - buttons, forms, text, images.

**Analogy:** It's like a store window - beautiful, interactive, but doesn't store anything on its own.

### Backend
**What it is:** A server that processes requests, stores data, validates passwords.

**Analogy:** It's like the warehouse and cash register of a store - this is where all the "work" happens.

### API (Application Programming Interface)
**What it is:** The "language of communication" between frontend and backend.

**Analogy:** Like a waiter in a restaurant - takes the order (request), carries it to the kitchen (server), returns the dish (response).

---

## 3. Project Technologies

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 16.x | Framework for building the user interface |
| **TypeScript** | 5.x | Programming language (enhanced JavaScript) |
| **SCSS** | - | Language for writing styles (enhanced CSS) |
| **RxJS** | 7.x | Library for handling asynchronous data |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Platform for running JavaScript on the server |
| **Express** | 5.x | Web framework for creating APIs |
| **TypeScript** | 5.x | Programming language |
| **SQLite** | 3.x | Database (data storage) |
| **bcrypt** | 6.x | Password encryption |
| **JWT** | 9.x | Tokens for authorization |

### What Each Technology Does:

#### TypeScript
JavaScript with types. Helps find errors before running the program.

```typescript
let name = "John";
name = 123;
```

#### Angular
Framework for creating complex web interfaces. Divides the page into components.

```
Page = Header Component + Content Component + Footer Component
```

#### Express
Simplifies server creation. Instead of hundreds of lines of code - just a few:

```typescript
app.get('/api/jobs', (req, res) => {
  res.json({ jobs: [...] });
});
```

#### SQLite
A lightweight database stored in a single file. Ideal for small projects.

---

## 4. Folder Structure

```
Freelance-Job-Board/
|
+-- src/                       # BACKEND - server code
|   +-- server.ts              # Server entry point
|   +-- app.ts                 # Express configuration
|   +-- config/                # Configuration
|   +-- controllers/           # Request handlers
|   +-- routes/                # API routes
|   +-- repositories/          # Database operations
|   +-- interfaces/            # TypeScript types
|   +-- utils/                 # Helper functions
|
+-- frontend/                  # FRONTEND - client code
|   +-- src/
|   |   +-- app/               # Angular components
|   |   +-- assets/            # Images, fonts
|   |   +-- environments/      # Environment settings
|   +-- angular.json           # Angular configuration
|   +-- package.json           # Frontend dependencies
|
+-- db/                        # Database
|   +-- freelance.sqlite3      # Database file
|
+-- docs/                      # Documentation
|
+-- package.json               # Backend dependencies
+-- README.md                  # Getting started guide
```

---

## 5. Backend (Server-Side)

The backend is located in the `src/` folder and uses the **MVC** (Model-View-Controller) architecture.

### 5.1 Entry Point: `server.ts`

```typescript
import app from './app.js';

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**What it does:** Starts the server on port 3000.

### 5.2 Application Setup: `app.ts`

```typescript
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

export default app;
```

**What it does:** Configures Express and connects all API routes.

### 5.3 Routes

**Folder:** `src/routes/`

Routes determine which code to execute for which URL.

```typescript
import { Router } from 'express';
import { getAllJobs, createJob } from '../controllers/jobController.js';

const router = Router();

router.get('/', getAllJobs);
router.post('/', createJob);
router.get('/:id', getJobById);

export default router;
```

**Analogy:** Routes are like road signs, showing where to go.

### List of All Routes:

| File | Base Path | Purpose |
|------|-----------|---------|
| authRoutes.ts | /api/auth | Login, registration |
| userRoutes.ts | /api/users | User management |
| profilesRoutes.ts | /api/profiles | Freelancer profiles |
| jobRoutes.ts | /api/jobs | Job listings/projects |
| jobaplRoutes.ts | /api/jobapplications | Job applications |
| assignmentsRoutes.ts | /api/assignments | Assignment of workers |
| paymentsRoutes.ts | /api/payments | Payments |
| messageRoutes.ts | /api/messages | Messages |
| reviewRoutes.ts | /api/reviews | Reviews |
| categoryRoutes.ts | /api/categories | Job categories |
| skillsRoutes.ts | /api/skills | Skills |
| supportticketsRoutes.ts | /api/supporttickets | Support tickets |

### 5.4 Controllers

**Folder:** `src/controllers/`

Controllers contain the request processing logic.

```typescript
import { Request, Response } from 'express';
import { jobRepo } from '../repositories/jobRepo.js';

export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await jobRepo.get_all();
    return res.json({ success: true, data: jobs });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Server error' } });
  }
};
```

**What it does:**
1. Receives a request from the client
2. Accesses the database through the Repository
3. Formats and sends the response

### 5.5 Repositories

**Folder:** `src/repositories/`

Repositories work directly with the database.

```typescript
import { db } from '../config/init_db.js';

export const jobRepo = {
  async get_all() {
    return await db.connection?.all('SELECT * FROM jobs');
  },
  
  async findById(id: number) {
    return await db.connection?.get('SELECT * FROM jobs WHERE job_id = ?', id);
  },
  
  async create(job: Job) {
    const result = await db.connection?.run(
      'INSERT INTO jobs (title, description, budget) VALUES (?, ?, ?)',
      job.title, job.description, job.budget
    );
    return result?.lastID;
  }
};
```

**Analogy:** A repository is like a librarian who knows where the books (data) are stored and how to find them.

### 5.6 Interfaces

**Folder:** `src/interfaces/`

Interfaces describe the data structure.

```typescript
export interface Job {
  job_id: number;
  employer_id: number;
  title: string;
  description: string;
  budget: number;
  status: 'Open' | 'In Progress' | 'Completed';
  created_at?: string;
}
```

**Why this is needed:** TypeScript checks that data matches the structure. If there's an error somewhere - the editor will show it immediately.

### 5.7 Utils

**Folder:** `src/utils/`

Helper functions used throughout the project.

```typescript
export function sendSuccess(res: Response, data: any, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res: Response, status: number, message: string) {
  return res.status(status).json({ success: false, error: { message } });
}
```

---

## 6. Frontend (Client-Side)

The frontend is located in the `frontend/` folder and is built with Angular.

### 6.1 What is Angular

Angular is a framework for creating Single Page Applications (SPA).

**SPA** is an application that loads once and then works without page reloads.

### 6.2 Angular Application Structure

```
frontend/src/
+-- index.html
+-- main.ts
+-- styles.scss
|
+-- app/
    +-- app.module.ts
    +-- app.component.ts
    +-- app-routing.module.ts
    |
    +-- core/
    |   +-- api.service.ts
    |   +-- auth.service.ts
    |   +-- models.ts
    |
    +-- header/
    |
    +-- features/
    |   +-- home/
    |   +-- auth/
    |   +-- jobs/
    |   +-- categories/
    |
    +-- shared/
```

### 6.3 Angular Components

A component is a reusable piece of interface.

Each component consists of 3-4 files:

```
header/
+-- header.component.ts
+-- header.component.html
+-- header.component.scss
+-- header.component.spec.ts
```

#### header.component.ts - Logic

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  categories: Category[] = [];
  
  constructor(
    public auth: AuthService
  ) {}
  
  ngOnInit() {
    this.loadCategories();
  }
  
  logout() {
    this.auth.logout();
  }
}
```

#### header.component.html - Markup

```html
<header class="header">
  <a class="brand" routerLink="/">FJB</a>
  
  <nav>
    <button *ngIf="auth.isLoggedIn()" (click)="logout()">
      Log out
    </button>
    
    <a *ngFor="let cat of categories">
      {{ cat.name }}
    </a>
  </nav>
</header>
```

**Angular Special Syntax:**

| Syntax | What it does |
|--------|--------------|
| `{{ value }}` | Output variable value |
| `[property]="value"` | Property binding |
| `(event)="method()"` | Event handling |
| `*ngIf="condition"` | Conditional rendering |
| `*ngFor="let item of items"` | Loop |
| `[(ngModel)]="value"` | Two-way binding |
| `routerLink="/path"` | Page link |

### 6.4 Services

Services contain logic shared across different components.

#### api.service.ts - Server Requests

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';
  
  constructor(private http: HttpClient) {}
  
  getJobs(): Observable<ApiResponse<Job[]>> {
    return this.http.get<ApiResponse<Job[]>>(`${this.apiUrl}/jobs`);
  }
  
  createJob(job: Job): Observable<ApiResponse<Job>> {
    return this.http.post<ApiResponse<Job>>(`${this.apiUrl}/jobs`, job);
  }
}
```

**Observable** is a "data stream". When the server responds, data arrives to the subscriber:

```typescript
this.api.getJobs().subscribe(response => {
  this.jobs = response.data;
});
```

#### auth.service.ts - Authentication

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  
  login(email: string, password: string): Observable<any> {
    return this.http.post('/api/auth/login', { email, password });
  }
  
  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }
  
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
  
  logout() {
    localStorage.removeItem(this.tokenKey);
  }
}
```

### 6.5 Routing

Defines which component to show for which URL.

```typescript
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'jobs', component: JobsListComponent },
  { path: 'jobs/:id', component: JobDetailComponent }
];
```

### 6.6 Modules

A module groups related components, services, and other modules.

```typescript
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## 7. Database

### 7.1 What is SQLite

SQLite is an embedded database. The entire database is a single file `freelance.sqlite3`.

**Advantages:**
- Doesn't require a separate server installation
- Portability - you can just copy the file
- Simplicity - perfect for learning

### 7.2 Database Tables

```
+--------------+     +--------------+     +--------------+
|    users     |---->|   profiles   |     |    skills    |
+--------------+     +--------------+     +--------------+
      |                    |                    |
      |                    +--------------------+
      |                            |
      v                            v
+--------------+     +----------------------+
|    jobs      |<----|    profile_skills    |
+--------------+     +----------------------+
      |
      +------------------+------------------+
      v                  v                  v
+--------------+   +-------------+   +--------------+
| applications |   | assignments |   |   messages   |
+--------------+   +-------------+   +--------------+
                         |
                         v
               +-----------------+
               |    payments     |
               +-----------------+
                         |
                         v
               +-----------------+
               |    reviews      |
               +-----------------+
```

### 7.3 Table Descriptions

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **users** | Users | user_id, email, password_hash, main_role |
| **profiles** | Freelancer profiles | profile_id, user_id, headline, hourly_rate |
| **skills** | Skills | skill_id, name |
| **profile_skills** | Profile-skills relationship | user_id, skill_id |
| **categories** | Job categories | category_id, name |
| **jobs** | Job listings/projects | job_id, employer_id, title, budget, status |
| **jobapplications** | Job applications | application_id, job_id, freelancer_id, bid_amount |
| **assignments** | Worker assignments | assignment_id, job_id, freelancer_id |
| **payments** | Payments | payment_id, job_id, amount, status |
| **messages** | Messages | message_id, sender_id, receiver_id, body |
| **reviews** | Reviews | review_id, job_id, rating, feedback |
| **supporttickets** | Support tickets | ticket_id, user_id, subject, status |

### 7.4 Database Initialization

The file `src/config/init_db.ts` creates all tables:

```typescript
export const usersTableDef = {
  name: 'users',
  columns: {
    user_id: { type: 'INTEGER', primaryKey: true, autoincrement: true },
    email: { type: 'TEXT', notNull: true, unique: true },
    password_hash: { type: 'TEXT', notNull: true },
  }
};
```

---

## 8. How Everything Works Together

### Example: User Opens the Job List

```
1. User enters URL: http://localhost:4200/jobs

2. Angular sees route /jobs -> shows JobsListComponent

3. JobsListComponent on load calls:
   this.api.getJobs().subscribe(...)

4. ApiService makes HTTP request:
   GET http://localhost:3000/api/jobs

5. Express receives request, finds route:
   router.get('/', getAllJobs)

6. JobController calls repository:
   const jobs = await jobRepo.get_all()

7. JobRepo executes SQL:
   SELECT * FROM jobs

8. SQLite returns data

9. Data travels back through the chain:
   Repo -> Controller -> Express -> HTTP -> ApiService -> Component

10. Angular updates HTML with new data
```

### Visually:

```
+------------------------------------------------------------------+
|                            BROWSER                                |
|  +------------------------------------------------------------+  |
|  |  JobsListComponent                                          |  |
|  |  +------------------------------------------------------+   |  |
|  |  |  this.api.getJobs().subscribe(jobs => ...)           |   |  |
|  |  +-------------------------+----------------------------+   |  |
|  +----------------------------|--------------------------------+  |
+-------------------------------|------------------------------------+
                                | HTTP GET /api/jobs
                                v
+------------------------------------------------------------------+
|                            SERVER                                 |
|  +------------------------------------------------------------+  |
|  |  Express Router: /api/jobs -> getAllJobs()                  |  |
|  +-------------------------+----------------------------------+  |
|                            v                                      |
|  +------------------------------------------------------------+  |
|  |  JobController: jobRepo.get_all()                           |  |
|  +-------------------------+----------------------------------+  |
|                            v                                      |
|  +------------------------------------------------------------+  |
|  |  JobRepo: db.all('SELECT * FROM jobs')                      |  |
|  +-------------------------+----------------------------------+  |
+----------------------------|-----------------------------------------+
                             v
+------------------------------------------------------------------+
|                          DATABASE                                 |
|  +------------------------------------------------------------+  |
|  |  freelance.sqlite3                                          |  |
|  |  +------------------------------------------------------+   |  |
|  |  |  jobs: [{ job_id: 1, title: "..." }, ...]            |   |  |
|  |  +------------------------------------------------------+   |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

---

## 9. Styles and Theming

### 9.1 What is CSS and SCSS

**CSS** (Cascading Style Sheets) is a language for styling HTML.

**SCSS** (Sassy CSS) is an extension of CSS with additional features:
- Variables
- Nesting
- Mixins (reusable styles)
- Imports

### 9.2 Styles Structure

```
frontend/src/
+-- styles.scss
|
+-- app/
    +-- shared/
    |   +-- _tokens.scss
    |   +-- _utilities.scss
    |   +-- _categories.scss
    |   +-- _index.scss
    |
    +-- header/
    |   +-- header.component.scss
    |
    +-- features/
        +-- home/
            +-- home.component.scss
```

### 9.3 Tokens (Variables)

The file `_tokens.scss` contains all colors, sizes, and other constants:

```scss
$primary: #0f172a;
$accent: #6366f1;
$success: #16a34a;
$error: #b91c1c;

$text-primary: #0f172a;
$text-secondary: #475569;
$text-muted: #94a3b8;

$bg-page: #f5f5f7;
$bg-card: rgba(255, 255, 255, 0.92);

$radius-sm: 6px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-full: 999px;

$shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);
$shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
```

**Why this is needed:**
- Changing a color in one place changes it everywhere
- Design consistency
- Easy to create a dark theme

### 9.4 Mixins (Reusable Styles)

File `_utilities.scss`:

```scss
@mixin card-base {
  background: $bg-card;
  border: 1px solid $border-light;
  border-radius: $radius-2xl;
  box-shadow: $shadow-sm;
  transition: transform 0.2s, box-shadow 0.2s;
}

@mixin button-primary {
  background: $primary;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: $radius-full;
  cursor: pointer;
  
  &:hover {
    background: $primary-dark;
  }
}
```

**Usage in a component:**

```scss
@use '../../shared' as *;

.job-card {
  @include card-base;
  padding: 20px;
}

.submit-btn {
  @include button-primary;
}
```

### 9.5 Global Styles

The file `styles.scss` applies to the entire application:

```scss
@use 'app/shared' as tokens;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-primary: #{tokens.$primary};
  --color-accent: #{tokens.$accent};
}

html {
  font-size: 16px;
}

body {
  font-family: 'Inter', sans-serif;
  background: tokens.$bg-page;
}
```

### 9.6 Component Styles

Each component has its own style file that applies ONLY to that component.

```scss
@use '../../shared' as *;

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba($bg-page, 0.72);
  backdrop-filter: blur(14px);
  
  .brand {
    font-size: 24px;
    font-weight: 700;
    color: $primary;
    text-decoration: none;
  }
  
  .nav-link {
    color: $text-secondary;
    
    &:hover {
      color: $primary;
    }
  }
}
```

### 9.7 Responsive Design

The site should look good on all devices:

```scss
$bp-xs: 480px;
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;
$bp-xl: 1280px;

@mixin respond-to($breakpoint) {
  @if $breakpoint == sm {
    @media (max-width: $bp-sm) { @content; }
  }
  @if $breakpoint == md {
    @media (max-width: $bp-md) { @content; }
  }
}

.hero-title {
  font-size: 54px;
  
  @include respond-to(md) {
    font-size: 36px;
  }
  
  @include respond-to(sm) {
    font-size: 28px;
  }
}
```

---

## 10. Configuration Files

### 10.1 package.json (Root)

Describes the project and its dependencies:

```json
{
  "name": "freelance-job-board",
  "scripts": {
    "dev": "tsx src/server.ts",
    "init-db": "tsx src/config/init_db.ts",
    "start:frontend": "...",
    "build:frontend": "..."
  },
  "dependencies": {
    "express": "^5.2.1",
    "sqlite3": "^5.1.7",
    "bcrypt": "^6.0.0",
    "jsonwebtoken": "^9.0.3"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "tsx": "^4.20.5"
  }
}
```

### 10.2 tsconfig.json

TypeScript compiler settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### 10.3 angular.json

Angular CLI configuration:

```json
{
  "projects": {
    "frontend": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/frontend",
            "index": "src/index.html",
            "main": "src/main.ts",
            "styles": ["src/styles.scss"]
          }
        },
        "serve": {
          "options": {
            "port": 4200,
            "proxyConfig": "proxy.conf.json"
          }
        }
      }
    }
  }
}
```

### 10.4 proxy.conf.json

Redirects API requests to the backend:

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

**What this means:**
- Frontend runs on port 4200
- Backend runs on port 3000
- Requests to `/api/*` are redirected to `http://localhost:3000/api/*`

---

## Conclusion

Now you know:

1. **Architecture** - Frontend (Angular) + Backend (Express) + Database (SQLite)
2. **Data flows**: Component -> Service -> HTTP -> Controller -> Repository -> Database
3. **Styles** are organized through SCSS: tokens -> mixins -> components
4. **Configuration files** set up building and running

### Useful Commands:

```bash
npm run dev

npm run start:frontend

npm run init-db
```

### Where to Look When Debugging:

| Problem | Where to Look |
|---------|---------------|
| Page doesn't load | `frontend/src/app/app-routing.module.ts` |
| Data doesn't arrive | `frontend/src/app/core/api.service.ts` |
| Server error | `src/controllers/*.ts` |
| Database error | `src/repositories/*.ts` |
| Styles not applying | `*.component.scss` or `shared/_tokens.scss` |
