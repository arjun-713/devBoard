# DevBoard — Project Context

## What This Is
A fullstack developer-focused Kanban task tracker. The complexity is in the implementation, not the idea — state architecture, auth patterns, CI/CD, and a high-polish UI are the selling points.

## Tech Stack
```
Frontend  → React + TypeScript + Tailwind + Vite
State     → Redux Toolkit (server state) + Zustand (UI state)
Backend   → Node.js + Express + TypeScript
Database  → MongoDB via Mongoose
Auth      → JWT (access token 15min, refresh token 7d)
Deploy    → Vercel (frontend) + Render (backend)
CI/CD     → GitHub Actions (lint → build → deploy on push to main)
DnD       → @dnd-kit/core
```

## Monorepo Structure
```
devboard/
├── client/                    # React frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── Board/         # Board.tsx, Column.tsx, TaskCard.tsx
│       │   ├── Auth/          # Login.tsx, Register.tsx
│       │   └── UI/            # Badge.tsx, Modal.tsx, Avatar.tsx, Button.tsx
│       ├── store/
│       │   ├── index.ts
│       │   ├── slices/        # taskSlice, authSlice, boardSlice
│       │   └── zustand/       # uiStore.ts (modals, sidebar, toasts)
│       ├── hooks/             # useAuth, useTasks, useDebounce, useLocalStorage
│       ├── api/               # client.ts (Axios + interceptors)
│       └── pages/             # Dashboard, Login, Register
├── server/                    # Express backend (TypeScript)
│   └── src/
│       ├── controllers/       # auth, task, board
│       ├── models/            # User, Task, Board (Mongoose)
│       ├── routes/            # auth, task, board
│       ├── middleware/        # auth.middleware.ts, error.middleware.ts
│       └── app.ts
└── .github/workflows/
    └── deploy.yml
```

## State Management Split (Critical — explain in interviews)
- **Redux Toolkit** → server state only: tasks, boards, auth user. Anything fetched from the API.
- **Zustand** → UI state only: modal open/close, sidebar collapsed, toast notifications. No boilerplate, no reducers needed.
- Never mix server state into Zustand. Never put UI state in Redux.

## Auth Flow
- Register/Login returns `accessToken` (15min) + `refreshToken` (7d)
- Axios interceptor catches 401 → silently hits `/auth/refresh` → retries original request
- Frontend protected routes via React Router `<PrivateRoute>`

## Key Custom Hooks
```ts
useDebounce<T>(value: T, delay: number): T           // search input debounce
useAuth()                                             // user, login, logout, isAuthenticated
useTasks(boardId: string)                             // tasks, addTask, updateTask, deleteTask, moveTask
useLocalStorage<T>(key: string, initial: T)           // typed generic hook
```

## Design System
See `.agents/skills/devboard-ui/SKILL.md` for full token system, color palette, and component patterns.

## Coding Conventions
- All files TypeScript strict mode — no `any`, no implicit returns
- Components: named exports only, no default exports except pages
- File naming: PascalCase for components, camelCase for hooks/utils
- Imports: path aliases via `@/` pointing to `src/`
- No inline styles — Tailwind only on the frontend
- Backend controllers never contain business logic — that goes in a service layer if added later
- All async route handlers wrapped in error middleware — no try/catch in controllers

## Environment Variables
```
# client/.env
VITE_API_URL=<server_api_base>/api

# server/.env
PORT=5000
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=<client_origin>
```

## GitHub Actions Pipeline
```yaml
on: push to main
jobs:
  lint      → ESLint (client + server)
  build     → tsc --noEmit + vite build
  deploy    → Vercel CLI (client), Render deploy hook (server)
```
