# LifeOS — Personal Productivity Dashboard

> A full-stack **MERN** application that serves as an all-in-one life management platform for students. Manage your tasks, habits, notes, finances, and calendar — all in one beautiful dark-mode dashboard.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture Diagram](#architecture-diagram)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Getting Started](#getting-started)
8. [Environment Variables](#environment-variables)
9. [Deployment](#deployment)
10. [Design System](#design-system)
11. [Known Issues & Fixes Applied](#known-issues--fixes-applied)

---

## Features

| Module | What it does |
|---|---|
| **Dashboard** | Live overview — task completion rate, net balance, longest habit streak, upcoming events, habit heatmap, recent transactions |
| **Tasks** | Create, update, delete tasks with priority (Low / Medium / High) and status (To Do / In Progress / Completed) |
| **Calendar** | Monthly event calendar — create colour-coded events, view upcoming events by date |
| **Finances** | Track income and expenses with categories; see total income, total expenses, and net balance |
| **Habits** | Daily habit tracker with automatic streak calculation, 18-week heatmap, and toggle-per-day completion |
| **Notes** | Rich note cards with colour themes, tags, pinning, and full CRUD |
| **Auth** | JWT-based registration, login, logout, forgot-password (email or console dev token), reset-password |
| **Profile** | Edit name, bio, phone, college, year, role, and avatar (URL or base64) |
| **Pomodoro Timer** | Floating focus timer (25 / 5 / 15 min modes) with custom editable time |
| **Command Palette** | `Ctrl+K` / `Cmd+K` spotlight-style search to navigate any page instantly |
| **Notifications Panel** | Bell-icon dropdown notification panel |

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB (Atlas in production, `mongodb-memory-server` for local dev) |
| ODM | Mongoose v9 |
| Auth | JWT (`jsonwebtoken`) + bcrypt password hashing (`bcryptjs`) |
| Email | Nodemailer (Gmail SMTP; falls back to console log in dev) |
| Environment | dotenv |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite` plugin) |
| Animations | Framer Motion v12 |
| Icons | Lucide React |
| Charts | Recharts |
| HTTP Client | Axios (with JWT interceptor) |
| Date Utils | date-fns |## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐    │
│  │  Login / │  │Dashboard │  │  Tasks / │  │  Habits /     │    │
│  │ Register │  │   (/)    │  │ Calendar │  │  Notes /      │    │
│  │          │  │          │  │ Finances │  │  Finances     │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬────────┘    │
│       │              │              │                │          │
│       └──────────────┴──────────────┴────────────────┘          │
│                              │                                  │
│                    ┌─────────▼──────────┐                       │
│                    │   api.js (Axios)   │                       │
│                    │  + JWT Interceptor │                       │
│                    │  + 401 Auto-logout │                       │
│                    └─────────┬──────────┘                       │
└──────────────────────────────┼──────────────────────────────────┘
                               │ HTTPS / REST
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                  EXPRESS.JS SERVER (Port 5000)                  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                       Middleware                        │   │
│   │  cors({ origin: [...] })  │  express.json()             │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                  │
│   ┌──────────────────────────▼──────────────────────────────┐   │
│   │                        Routes                           │   │
│   │  /api/auth  │ /api/tasks │ /api/habits │ /api/notes     │   │
│   │  /api/events│ /api/transactions │ /api/finance          │   │
│   │  /api/academics │ /api/health │ /api/dashboard          │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                  │
│   ┌──────────────────────────▼──────────────────────────────┐   │
│   │              Auth Middleware (JWT verify)               │   │
│   │     Attaches req.user = { id, email, name }             │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                  │
│   ┌──────────────────────────▼──────────────────────────────┐   │
│   │                     Controllers                         │   │
│   │   authController  │  financeController                  │   │
│   │   academicsController  │  healthController              │   │
│   └──────────────────────────┬──────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │ Mongoose ODM
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                   MONGODB (Atlas / In-Memory)                   │
│                                                                 │
│  Collections:                                                   │
│  users │ tasks │ habits │ notes │ events │ transactions         │
│  academics │ finances │ healthlogs                              │
└─────────────────────────────────────────────────────────────────┘
```��   │
└──────────────────────────────┼──────────────────────────────────┘
                               │ Mongoose ODM
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                   MONGODB (Atlas / In-Memory)                   │
│                                                                 │
│  Collections:                                                   │
│  users │ tasks │ habits │ notes │ events │ transactions         │
│  academics │ finances │ healthlogs                              │
└─────────────────────────────────────────────────────────────────┘───────────┬──────────────────────────────┘   │
│                              │                                  │
│   ┌──────────────────────────▼──────────────────────────────┐   │
│   │              Auth Middleware (JWT verify)               │   │
│   │     Attaches req.user = { id, email, name }             │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                  │
│   ┌──────────────────────────▼──────────────────────────────┐   │
│   │                     Controllers                         │   │
│   │   authController  │  financeController                  │   │
│   │   academicsController  │  healthController              │   │
│   └──────────────────────────┬──────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │ Mongoose ODM
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                   MONGODB (Atlas / In-Memory)                   │
│                                                                 │
│  Collections:                                                   │
│  users │ tasks │ habits │ notes │ events │ transactions         │
│  academics │ finances │ healthlogs                              │
└─────────────────────────────────────────────────────────────────┘


Authentication Flow:
────────────────────
  POST /api/auth/register  ──►  Hash password  ──►  Save User  ──►  Return JWT
  POST /api/auth/login     ──►  bcrypt compare  ──►  Return JWT
  All protected routes     ──►  Bearer <token>  ──►  JWT verify  ──►  req.user

Password Reset Flow:
────────────────────
  POST /api/auth/forgot-password
    ├── User not found  ──►  { notFound: true }  (UX: explicit message)
    └── User found      ──►  Generate crypto token (1h expiry)
                             ├── SMTP configured  ──►  Send email
                             └── Dev mode         ──►  Log URL to console

  POST /api/auth/reset-password/:token
    ──►  Validate token + expiry  ──►  Hash new password  ──►  Clear token
```

---

## Project Structure

```
project/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # register, login, profile, password reset
│   │   ├── academicsController.js   # assignments, study plans, courses
│   │   ├── financeController.js     # budget, expenses (legacy module)
│   │   └── healthController.js      # water, sleep, steps tracking
│   ├── middleware/
│   │   └── auth.js                  # JWT Bearer token verification
│   ├── models/
│   │   ├── User.js                  # name, email, password, avatar, profile
│   │   ├── Task.js                  # title, status, priority, due date
│   │   ├── Habit.js                 # name, completedDates[], streak
│   │   ├── Note.js                  # title, content, color, tags, pinned
│   │   ├── Event.js                 # title, date, color, description
│   │   ├── Transaction.js           # name, amount, type (income/expense)
│   │   ├── Academics.js             # Assignment, StudyPlan, Course schemas
│   │   ├── Finance.js               # Budget, Expense schemas (legacy)
│   │   └── HealthLog.js             # water, sleep, steps, workout
│   ├── routes/
│   │   ├── auth.js                  # /api/auth/*
│   │   ├── tasks.js                 # /api/tasks (CRUD + auth)
│   │   ├── habits.js                # /api/habits + /api/habits/:id/toggle
│   │   ├── notes.js                 # /api/notes (CRUD + auth)
│   │   ├── events.js                # /api/events (CRUD + auth)
│   │   ├── transactions.js          # /api/transactions (CRUD + auth)
│   │   ├── finance.js               # /api/finance (legacy)
│   │   ├── academics.js             # /api/academics (legacy)
│   │   ├── health.js                # /api/health (legacy)
│   │   └── dashboard.js             # /api/dashboard (legacy aggregate)
│   ├── .env                         # ⚠️ NOT committed — see .env.example
│   ├── .env.example                 # Template for environment variables
│   └── server.js                    # Express app entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   └── Card.jsx         # Reusable glass-card wrapper
│   │   │   ├── Layout.jsx           # App shell — sidebar + header + outlet
│   │   │   ├── Sidebar.jsx          # Nav links + logout
│   │   │   ├── CommandPalette.jsx   # Ctrl+K spotlight search
│   │   │   ├── Pomodoro.jsx         # Floating focus timer
│   │   │   ├── NotificationPanel.jsx# Bell dropdown
│   │   │   └── ProfileModal.jsx     # Edit profile + change password
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Overview metrics + heatmap
│   │   │   ├── Tasks.jsx            # Kanban-style task manager
│   │   │   ├── Calendar.jsx         # Monthly event calendar
│   │   │   ├── Finances.jsx         # Income/expense tracker + charts
│   │   │   ├── Habits.jsx           # Habit tracker + heatmap
│   │   │   ├── Notes.jsx            # Note cards with CRUD
│   │   │   ├── Login.jsx            # Auth — sign in
│   │   │   ├── Register.jsx         # Auth — sign up
│   │   │   ├── ForgotPassword.jsx   # Password reset request
│   │   │   └── ResetPassword.jsx    # Password reset confirm
│   │   ├── App.jsx                  # Router + PrivateRoute guard
│   │   ├── api.js                   # Axios instance + all API calls
│   │   ├── index.css                # Tailwind + design tokens + utilities
│   │   └── main.jsx                 # React DOM entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── package.json                     # Root scripts: npm start / npm run dev
└── README.md
```

---

## Database Schema

### User
```js
{ name, email, password (hashed), avatar, bio, phone, college, year,
  role, resetToken, resetTokenExpiry, createdAt }
```

### Task
```js
{ user (ref), title, status: ['To Do','In Progress','Completed'],
  priority: ['Low','Medium','High'], due, timestamps }
```

### Habit
```js
{ user (ref), name, target, color, streak (number),
  completedDates: [String 'YYYY-MM-DD'], timestamps }
```

### Note
```js
{ user (ref), title, content, color, imageUrl, tags: [String],
  pinned (bool), date, timestamps }
```

### Event
```js
{ user (ref), title, date (ISO string), color, description, timestamps }
```

### Transaction
```js
{ user (ref), name, amount, type: ['income','expense'],
  date, category, timestamps }
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | ✗ | Register new user, returns JWT |
| POST | `/login` | ✗ | Login, returns JWT + user object |
| GET | `/profile` | ✓ | Get authenticated user profile |
| PUT | `/profile` | ✓ | Update profile fields |
| PUT | `/change-password` | ✓ | Change password (requires current) |
| POST | `/forgot-password` | ✗ | Send reset link (or log in dev) |
| POST | `/reset-password/:token` | ✗ | Reset password via token |

### Tasks — `/api/tasks`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | Get all tasks for current user |
| POST | `/` | ✓ | Create new task |
| PUT | `/:id` | ✓ | Update task (title, status, priority, due) |
| DELETE | `/:id` | ✓ | Delete task |

### Habits — `/api/habits`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | Get habits (auto-corrects streaks) |
| POST | `/` | ✓ | Create habit |
| PUT | `/:id` | ✓ | Update habit |
| DELETE | `/:id` | ✓ | Delete habit |
| POST | `/:id/toggle` | ✓ | Toggle completion for a date |

### Notes — `/api/notes`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | Get all notes |
| POST | `/` | ✓ | Create note |
| PUT | `/:id` | ✓ | Update note |
| DELETE | `/:id` | ✓ | Delete note |

### Events — `/api/events`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | Get all events |
| POST | `/` | ✓ | Create event |
| DELETE | `/:id` | ✓ | Delete event |

### Transactions — `/api/transactions`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | Get all transactions |
| POST | `/` | ✓ | Create transaction |
| DELETE | `/:id` | ✓ | Delete transaction |

> **Auth header format:** `Authorization: Bearer <jwt_token>`

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account **or** leave `MONGO_URI` as localhost (auto uses in-memory DB)

### 1 — Clone & Install

```bash
git clone https://github.com/your-username/lifeos.git
cd lifeos

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2 — Configure Environment

```bash
cp backend/.env.example backend/.env
# Open backend/.env and fill in your values
```

At minimum, set `JWT_SECRET` to any long random string. The database will work automatically with the in-memory server if `MONGO_URI` is left as localhost.

### 3 — Run Development Servers

**Terminal 1 — Backend:**
```bash
npm run dev          # Runs: node backend/server.js
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev          # Vite dev server
# App opens at http://localhost:5173
```

### 4 — Register & Login

Navigate to `http://localhost:5173/register`, create an account, and you're in.

---

## Environment Variables

Create `backend/.env` (copy from `backend/.env.example`):

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB Atlas URI or `mongodb://localhost:27017/lifeos` |
| `JWT_SECRET` | Yes | Secret string for signing JWTs (min 32 chars) |
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_URL` | Prod only | Your frontend domain (e.g. `https://lifeos.vercel.app`) |
| `SMTP_USER` | No | Gmail address for sending password reset emails |
| `SMTP_PASS` | No | Gmail App Password (not your real password) |

> **Note:** If `SMTP_USER` / `SMTP_PASS` are not set, password reset tokens are printed to the backend console — perfect for local development.

---

## Deployment

### Backend → Render

1. Push to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Root Directory** to `/` and **Build Command** to `npm install`
4. Set **Start Command** to `node backend/server.js`
5. Add all environment variables from the table above
6. Set `FRONTEND_URL` to your Vercel frontend URL

### Frontend → Vercel

1. Import the repository on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Build command: `npm run build` | Output directory: `dist`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-render-app.onrender.com/api
   ```

---

## Design System

The entire UI is built on a custom dark glassmorphism design system defined in `frontend/src/index.css`.

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-brand-primary` | `#6366f1` | Indigo — primary actions, active nav, links |
| `--color-brand-secondary` | `#a855f7` | Purple — gradients, secondary highlights |
| `--color-brand-accent` | `#10b981` | Emerald — success states, income |
| `--background` | `#050505` | Page background |
| `--foreground` | `#f8fafc` | Primary text |
| `--glass-bg` | `rgba(17,24,39,0.6)` | Card / panel backgrounds |
| `--text-muted` | `#9ca3af` | Secondary / helper text |

### Utility Classes

| Class | Effect |
|---|---|
| `.glass-panel` | Blur backdrop + glass border + shadow |
| `.glass-card` | Same as panel + hover lift animation |
| `.text-gradient` | Indigo → purple gradient text |
| `.scrollbar-hide` | Hides all scrollbars |
| `.scrollbar-thin` | Thin branded indigo scrollbar |

### Typography

Font: **Inter** (loaded from system stack). All headings use `font-bold` with tight tracking. Monospace elements (Pomodoro timer) use `font-mono`.

---

## Known Issues & Fixes Applied

The following issues were identified during the final audit and corrected:

| # | File | Issue | Fix Applied |
|---|---|---|---|
| 1 | `CommandPalette.jsx` | `'Go to Scratchpad'` navigated to `/scratchpad` — a route that does not exist | Changed to `'Go to Notes'` → `/notes` |
| 2 | `package.json` (root) | `name: "project"`, no `start`/`dev` scripts, `license: ISC` | Updated name to `lifeos`, added `start` + `dev` scripts, set `license: MIT` |
| 3 | `backend/server.js` | `app.use(cors())` allowed **all** origins — security risk in production | Replaced with allowlist: `localhost:5173` + `FRONTEND_URL` env var |
| 4 | `backend/.env` | No `.env.example` template for onboarding | Created `backend/.env.example` with all variables documented |
| 5 | Root | No root `.gitignore` | Created root `.gitignore` covering `node_modules`, `.env`, `dist`, editor files |
| 6 | `backend/routes/dashboard.js` | Legacy route referencing old `Academics`/`Finance`/`HealthLog` models not used by the current frontend Dashboard | Documented as legacy; frontend Dashboard uses individual API endpoints instead |

---

## Scripts Reference

### Root (Backend)
```bash
npm start        # node backend/server.js
npm run dev      # node backend/server.js
```

### Frontend
```bash
npm run dev      # Vite dev server (hot reload)
npm run build    # Production build → frontend/dist/
npm run preview  # Preview production build locally
npm run lint     # ESLint check
```

---

## License

MIT © LifeOS Contributors
