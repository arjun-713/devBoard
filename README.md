# DevBoard

Developer-focused Kanban workspace for planning, shipping, and tracking engineering work.

[Live Demo](https://dev-board-henna.vercel.app)

![DevBoard](./docs/screenshot.png)

## Tech Stack

| Frontend | Backend | Database | DevOps |
| --- | --- | --- | --- |
| React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, Zustand, dnd-kit | Node.js, Express, TypeScript, JWT, Mongoose | MongoDB (Atlas-ready) | Vercel (client), Railway (server), GitHub Actions |

## Features

- Secure register/login with JWT access and refresh tokens
- Drag-and-drop Kanban board with optimistic task movement
- Board and task CRUD flows with priorities, labels, assignees, and due dates
- Demo mode with seeded boards/tasks for recruiter walkthroughs
- Search and inbox-oriented task views for prioritization
- UI state management via Zustand for modals, toasts, and view preferences

## Architecture

DevBoard intentionally splits state management by responsibility:

- Redux Toolkit stores server-backed domain state (auth user, boards, tasks) and handles API-driven updates.
- Zustand stores ephemeral UI state (modals, toasts, dismissible banners, layout toggles) to keep UI interactions lightweight.

This separation keeps network data predictable and testable in Redux while avoiding boilerplate for purely presentational state.

## 🌐 Troubleshooting: Site Not Loading (India / ISP DNS Issue)

If the live demo isn't loading, your ISP's DNS may be blocking Railway domains.
Apply this **temporary** DNS fix (resets on reboot):

**Linux**
```bash
sudo resolvectl dns $(ip route | grep default | awk '{print $5}') 8.8.8.8 8.8.4.4
```

**macOS**
```bash
sudo networksetup -setdnsservers Wi-Fi 8.8.8.8 8.8.4.4
```

**Windows** (run PowerShell as Administrator)
```powershell
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1 -ExpandProperty Name
Set-DnsClientServerAddress -InterfaceAlias $adapter -ServerAddresses ("8.8.8.8","8.8.4.4")
```

> These commands are temporary — DNS resets to default on reboot.
> To undo immediately: Linux: `sudo resolvectl revert <interface>` | macOS: `sudo networksetup -setdnsservers Wi-Fi empty` | Windows: `Set-DnsClientServerAddress -InterfaceAlias $adapter -ResetServerAddresses`

## Local Setup

### 1) Server

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Server runs on the `PORT` value configured in `server/.env`.

Optional: seed demo account and sample data.

```bash
npm run seed:demo
```

### 2) Client

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Client runs on the host/port configured by `vite` and reads its API base from `VITE_API_URL`.

## Environment Variables

- Server variables are documented in [`server/.env.example`](/home/arjun/DevBoard/server/.env.example)
- Client variables are documented in [`client/.env.example`](/home/arjun/DevBoard/client/.env.example)

## API Overview

All API routes are prefixed with `/api` unless noted.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Health check endpoint used by Railway |
| POST | `/api/auth/register` | Register a new user and return auth tokens |
| POST | `/api/auth/login` | Login with email/password and return auth tokens |
| GET | `/api/auth/demo` | Login as seeded demo user and return auth tokens |
| POST | `/api/auth/refresh` | Exchange refresh token for new access/refresh tokens |
| POST | `/api/auth/logout` | Invalidate the provided refresh token |
| GET | `/api/boards` | List boards for authenticated user |
| POST | `/api/boards` | Create a board |
| PUT | `/api/boards/:id` | Update board name/columns |
| DELETE | `/api/boards/:id` | Delete board |
| GET | `/api/tasks?boardId=<id>` | List tasks for a board |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/move` | Move/reorder task across columns |
| DELETE | `/api/tasks/:id` | Delete task |

## Deployment

- Client: deploy `client/` on Vercel
- Server: deploy `server/` on Railway
- Database: provision MongoDB Atlas and set `MONGO_URI`

## License

MIT
