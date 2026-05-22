# ONEMSU

ONEMSU is a full-stack campus platform for Mindanao State University students. It combines social features (newsfeed, messaging, confessions, lost & found, feedback), scheduling tools, and an integrated JARVIS AI assistant in a single app.

## What ONEMSU Is (Plain-English Overview)

ONEMSU is designed as a **student super-app** for one university community. Instead of splitting student life across many disconnected tools, it puts day-to-day campus needs into one place:

- A social space (newsfeed, reels, profile, timeline)
- A communication layer (messenger + live presence)
- Student utility spaces (lost & found, feedbacks, confessions)
- A productivity area (scheduler/dashboard)
- An AI helper (JARVIS) that can answer questions or assist with content

Think of it as a campus-focused mix of:

- social network +
- messaging app +
- student services portal +
- lightweight academic organizer.

The primary audience is **Mindanao State University students**, but the architecture is generic enough that a similar setup could be adapted for other campuses.

## How the App Works End-to-End

At runtime, ONEMSU behaves like one integrated application even though it has multiple parts:

1. **Browser client (React SPA)** renders all pages and interactions.
2. **Express server** serves APIs and handles backend logic.
3. **WebSocket server** pushes real-time updates (e.g., chat/presence-style events).
4. **SQLite database** stores structured app data locally on the server.
5. **Gemini integration (optional)** powers JARVIS AI features when API keys are configured.

Because Vite middleware is mounted in development, frontend and backend can be run together from the same command (`npm run dev`).

## Core Student Use Cases

Typical workflows this app appears to support:

- **Stay updated** through feed-like and media-centric surfaces (`/newsfeed`, `/reels`, `/timeline`).
- **Connect with peers** through direct communication (`/messenger`) and live-style spaces (`/live`).
- **Report/share campus concerns** in dedicated channels (`/feedbacks`, `/confession`, `/lostfound`).
- **Track personal tasks/schedules** in planner-oriented routes (`/scheduler`, `/dashboard`).
- **Ask JARVIS for help** when AI keys are present (Q&A, assistance-style interactions).

In short: the app aims to reduce friction in student life by combining social interaction, coordination, and basic campus service workflows.

## What’s Included

- **Frontend**: React + TypeScript + Vite single-page app.
- **Backend**: Express server with API routes and WebSocket support.
- **Database**: SQLite (`better-sqlite3`) with auto table bootstrap.
- **Realtime**: `ws` WebSocket server for live messaging/presence updates.
- **AI Integration**: Google Gemini-backed JARVIS assistant (when API key is set).

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- WebSocket (`ws`)
- SQLite (`better-sqlite3`)
- TailwindCSS toolchain
- Lucide icons / Motion animations

## Application Areas / Views

The app routes include:

- `/home`
- `/explorer`
- `/about`
- `/privacy`
- `/terms`
- `/dashboard`
- `/messenger`
- `/live`
- `/reels`
- `/newsfeed`
- `/profile`
- `/timeline`
- `/confession`
- `/feedbacks`
- `/lostfound`
- `/scheduler`

## Project Structure

```txt
.
├── src/                # React frontend
│   ├── App.tsx         # Main UI/feature composition
│   ├── main.tsx        # Frontend entry
│   ├── router.tsx      # Route map
│   └── websocket.ts    # Frontend WS client logic
├── entities/           # Shared TypeScript entity interfaces
├── public/             # Static files served publicly
├── dist/               # Build output (generated)
├── server.ts           # Express + WebSocket + DB + API server
├── onemsu.db           # SQLite database file
└── package.json        # Scripts and dependencies
```

## Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- npm 10+

## Environment Variables

Create a `.env` file (or set shell env vars) before running in development:

```bash
# AI key (any one of these can be used)
GEMINI_API_KEY=your_key_here
# or
GOOGLE_GEMINI_API_KEY=your_key_here
# or
GOOGLE_API_KEY=your_key_here
# or
VITE_GEMINI_API_KEY=your_key_here

# Optional
PORT=3000
NODE_ENV=development
```

> If no Gemini key is provided, the server still runs, but JARVIS AI features are disabled.

## Install

```bash
npm install
```

## Run (Development)

```bash
npm run dev
```

This runs `tsx server.ts`, which starts:

- Express HTTP server
- Vite middleware (in non-production)
- WebSocket server
- SQLite DB initialization

Default URL: `http://localhost:3000` (or `PORT` if provided).

## Build (Production Assets)

```bash
npm run build
```

## Preview Built Frontend

```bash
npm run preview
```

## Start Command

```bash
npm start
```

(`start` is currently the same as `dev`: `tsx server.ts`.)

## Other Scripts

```bash
npm run lint    # TypeScript check (no emit)
npm run clean   # remove dist/
```

## Database Notes

- SQLite database file: `onemsu.db`
- WAL journaling is enabled for write reliability/performance.
- Tables are created automatically on server boot if missing.
- If DB file is invalid/corrupted (`SQLITE_NOTADB`), app falls back to in-memory DB mode.

## Deployment Notes

The repository includes:

- `railway.json`
- `nixpacks.toml`

These suggest deployment support for Railway/Nixpacks-style platforms.

## Troubleshooting

### Port already in use

Change the port:

```bash
PORT=4000 npm run dev
```

### AI responses not working

- Verify a valid Gemini API key is set.
- Restart server after changing env vars.

### Clean local build artifacts

```bash
npm run clean
```

## License

No explicit license file is currently included in this repository. Add one if you intend public/open-source distribution.
