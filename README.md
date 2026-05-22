# ONEMSU (One MSU Platform)

ONEMSU is an all-in-one digital campus platform for students, organizations, and communities connected to the Mindanao State University (MSU) system. The project combines social networking, communication, student utility tools, and an AI assistant into a single web application.

If you want the short version: **it is like a campus-focused mix of Facebook + Messenger + student bulletin board + basic planner + AI helper, tailored for MSU users.**

---

## 1) What this project is all about (literal full explanation)

This project exists to solve a common student problem: most campus life information is scattered. Students usually switch between many places (Messenger groups, Facebook pages, departmental posts, ad-hoc spreadsheets, and word-of-mouth) just to:

- know what’s happening,
- talk to classmates,
- ask for help,
- post lost-and-found items,
- track activities, and
- get quick information support.

ONEMSU centralizes those needs in one web app and attempts to make campus digital life simpler.

### Core idea

Create a **single student hub** where users can:

1. **Connect** with peers and campus communities.
2. **Communicate in real-time** through messaging.
3. **Share updates/content** through feeds and campus-focused sections.
4. **Use utility features** like scheduling and lost/found posts.
5. **Get AI assistance** through JARVIS for quick guidance and productivity.

### Intended users

- MSU students (primary)
- Student leaders / org members
- Campus community participants

### Product personality

From the current server prompt configuration, the built-in assistant (JARVIS) is designed to be helpful, efficient, and student-oriented.

---

## 2) High-level system architecture

ONEMSU is a **full-stack TypeScript application** with:

- **Frontend SPA** (React + Vite)
- **Backend API server** (Express)
- **Realtime layer** (WebSocket via `ws`)
- **Local relational storage** (SQLite via `better-sqlite3`)
- **Optional AI integration** (Google Gemini via `@google/genai`)

At runtime, a single Node process (`server.ts`) handles:

- HTTP API behavior,
- static/Vite app serving,
- WebSocket connections, and
- database initialization and access.

---

## 3) Feature map (what users can do)

The codebase includes route-level views for:

- `/home` – main landing/home context
- `/explorer` – discovery/explorer section
- `/about` – about information
- `/privacy` – privacy policy view
- `/terms` – terms of service view
- `/dashboard` – user dashboard
- `/messenger` – chat/messaging interface
- `/live` – live area
- `/reels` – short-form/reel-like area
- `/newsfeed` – social feed
- `/profile` – user profile
- `/timeline` – timeline view
- `/confession` – anonymous-style confessions section
- `/feedbacks` – feedback posting area
- `/lostfound` – lost and found board
- `/scheduler` – scheduling/planner view

Beyond routes, the data schema indicates support for:

- Users and profiles
- Messages and deleted message tracking
- Reactions on messages and posts
- Read receipts and presence/last-seen
- Groups and group memberships
- Freedom/confession posts with reactions/shares/reports
- Lost/found post lifecycle (open/claimed)
- Personal schedules/events
- Notifications and user preferences

---

## 4) Repository structure (what each important file/folder means)

```txt
.
├── src/
│   ├── App.tsx           # Main frontend application UI (feature-heavy component)
│   ├── main.tsx          # React/Vite browser entry point
│   ├── router.tsx        # Route declarations
│   ├── websocket.ts      # Frontend websocket handling utilities
│   └── ...               # CSS and additional frontend files
├── entities/             # TypeScript entity/interface definitions
├── public/               # Static assets for serving
├── dist/                 # Built frontend output (generated)
├── server.ts             # Backend server + websocket + DB bootstrapping + AI integration
├── package.json          # Scripts, dependencies, project metadata
├── onemsu.db             # SQLite database file (runtime/local data)
├── railway.json          # Railway deployment hints/config
└── nixpacks.toml         # Nixpacks build/deploy config
```

> Note: `node_modules/` is dependency output and should not be treated as source documentation.

---

## 5) Technology stack and why each is used

- **React 19**: builds interactive component-based UI.
- **TypeScript**: typed JavaScript for safer refactoring and clearer contracts.
- **Vite**: fast dev/build tooling for frontend.
- **Express**: backend HTTP framework.
- **ws**: lightweight WebSocket server/client support for real-time communication.
- **better-sqlite3**: synchronous, fast SQLite access for local DB persistence.
- **@google/genai**: Gemini API integration powering JARVIS assistant behavior.
- **Tailwind tooling + CSS**: styling pipeline.

---

## 6) Runtime behavior (what happens when you run it)

When you execute `npm run dev` or `npm start`, script resolution currently runs:

```bash
tsx server.ts
```

Server startup flow (simplified):

1. Loads environment variables (`dotenv.config()`).
2. Reads Gemini-related API key candidates (several supported names).
3. Creates AI client/model if key exists.
4. Opens/initializes SQLite DB (`onemsu.db`).
5. Applies DB pragmas (WAL mode, sync mode) and ensures schema tables exist.
6. Starts Express + WebSocket services.
7. In non-production, uses Vite middleware; in production, serves built assets from `dist/`.
8. Attempts listening on `PORT` (default 3000), then fallback ports (`PORT+1`, `PORT+2`) if needed.

---

## 7) Environment variables (complete practical guide)

You can configure AI using any one of these keys (first available value wins):

- `GEMINI_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `VITE_GEMINI_API_KEY`

Additional useful vars:

- `PORT` – preferred server port (default 3000).
- `NODE_ENV` – environment mode (`development` / `production`).

Example `.env`:

```bash
GEMINI_API_KEY=your_real_key_here
PORT=3000
NODE_ENV=development
```

If no Gemini key is present, the app can still run, but AI functionality is limited/disabled.

---

## 8) Database details (what is stored)

Primary DB engine: SQLite (`onemsu.db`).

Observed table groups include:

- Identity: `users`
- Messaging: `messages`, `deleted_messages`, `message_reactions`, `read_receipts`, `presence`
- Community: `groups`, `group_members`
- Social posts: `freedom_posts`, `freedom_post_reactions`, `freedom_post_shares`
- Utility: `lost_found_posts`, `schedules`
- Notifications/settings: `notifications`, `user_preferences`
- Feedback: `feedbacks`

Reliability/performance-related behavior:

- `journal_mode = WAL`
- `synchronous = NORMAL`

Fallback behavior:

- If the local DB is invalid/corrupted (`SQLITE_NOTADB`), server falls back to in-memory DB initialization to avoid immediate crash.

---

## 9) Installation and local development

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm 10+

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

### Open app

- Usually: `http://localhost:3000`
- If 3000 busy, server may auto-try 3001/3002

---

## 10) Build, preview, and utility scripts

### Build frontend assets

```bash
npm run build
```

### Preview built frontend

```bash
npm run preview
```

### Start server (same current behavior as dev)

```bash
npm start
```

### Type check

```bash
npm run lint
```

### Remove generated build output

```bash
npm run clean
```

---

## 11) Deployment notes

The repository includes deployment-related files for common hosted workflows:

- `railway.json`
- `nixpacks.toml`

General production expectation:

1. Install dependencies.
2. Build frontend (`npm run build`).
3. Start server process (`npm start`).
4. Provide environment variables in host settings.

---

## 12) Troubleshooting

### A) Port conflict

Run with explicit port:

```bash
PORT=4000 npm run dev
```

### B) AI/JARVIS not responding

- Confirm at least one valid Gemini env var is set.
- Restart the process after changing env.
- Check key validity/quota on provider side.

### C) TypeScript lint/type-check errors

If `npm run lint` fails, inspect reported file/line numbers. Some current failures may be unrelated to README/docs edits.

### D) Clean and rebuild

```bash
npm run clean
npm run build
```

---

## 13) Current project status notes

- The project is feature-rich and includes many student-community modules in one codebase.
- The frontend main file (`src/App.tsx`) is large and central to multiple features.
- There are currently known TypeScript issues in app code reported by `tsc --noEmit` (not introduced by this README update).

---

## 14) License

No explicit license file is currently included in the repository root. If this project will be distributed publicly, add a license (e.g., MIT/Apache-2.0/etc.) as appropriate.
