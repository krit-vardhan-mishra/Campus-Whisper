# Campus Whisper

Campus Whisper is a real-time, privacy-first campus chat platform (anonymous handles, rooms, and realtime messaging).

This repository contains both the frontend and backend projects as separate folders so you can run them locally or combine them into a single monorepo if desired.

Contents
- `frontend_campus_whisper/` — React + Vite frontend (TypeScript).
- `backend_campus_whisper/` — Node.js + Express + Socket.IO backend.

Quick links
- Frontend README: [frontend_campus_whisper/README.md](frontend_campus_whisper/README.md)
- Backend README: [backend_campus_whisper/README.md](backend_campus_whisper/README.md)
 - Project overview: [OVERVIEW.md](OVERVIEW.md)

Tech stack
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT

Quick start (developer)
1. Install dependencies for backend and frontend separately:

```bash
cd backend_campus_whisper
npm install

cd ../frontend_campus_whisper
npm install
```

2. Run backend (default port 5002):

```bash
cd backend_campus_whisper
npm run dev
```

3. Run frontend (Vite, default port 5173):

```bash
cd frontend_campus_whisper
npm run dev
```

Environment variables
- Backend expects a `.env` file. See `backend_campus_whisper/README.md` for required variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`).
- Frontend may use `.env.local` for local API keys. See `frontend_campus_whisper/README.md`.

Security note (important)
- While scanning the workspace a few secrets were found in local files. If any of these were pushed to a public remote, rotate them immediately:
  - `backend_campus_whisper/.env` (contains `MONGODB_URI` and `JWT_SECRET`)
  - `frontend_campus_whisper/.env.local` (contains `MONGODB_URI` and API key placeholder)
  - `backend_campus_whisper/temp_credentials.txt`

Immediate recommended actions
- Rotate exposed credentials (MongoDB user password and any API keys, and replace the `JWT_SECRET`).
- Remove the secret-containing files from remote history (use `git filter-repo` or BFG) and push a cleaned branch.
- Add `*.env*` and `temp_credentials.txt` to `.gitignore`.
- Use environment variable management on CI and secrets vaults for production (GitHub Secrets, Azure Key Vault, etc.).

Monorepo options
- Quick import (no history): copy both folders into a new repo and commit.
- Preserve history (recommended when history matters): use `git subtree` or `git filter-repo` to merge repositories into subfolders while keeping each repo's history.
- Keep separate but referenced: use `git submodule` (more complex for contributors).

Contributing
- See each subproject's README for local development and contribution guidelines.

License
- (Add your project license here)

Questions or next steps
- I can: remove secrets from history, create a monorepo (simple copy or preserving history), or help rotate and reconfigure secrets—tell me which you'd like.
