# Campus Whisper

**Real-time anonymous campus chat platform**  
Like Chinese Whisper gone wild: one rumor, doubt, roast or confession enters the chat… by the time it reaches the 50th person it's morphed into five different savage versions. Everyone walks away with their own twisted, unfiltered take — zero names attached.

Perfect for:
- Asking "dumb" questions without judgment
- Roasting campus Wi-Fi / mess / profs safely
- Confessions, memes, group study SOS, pure bakchodi
- Jo bolna hai bolo

### Features
- 100% anonymous (random fun usernames, no email/phone)
- Real-time messaging (Socket.IO)
- Categorized rooms: tech, study, confessions, gaming, social, etc.
- No dean, no tracking, no receipts
- Dark theme, mobile-friendly, modern UI

Live demo: [https://campus-whisper.onrender.com](https://campus-whisper-kohl.vercel.app/)

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + Socket.IO + MongoDB (Mongoose) + JWT
- **Real-time**: WebSockets via Socket.IO
- **Auth**: Stateless anonymous JWT sessions

### Project Structure
```
campus-whisper/
├── frontend_campus_whisper/     → React/Vite app
├── backend_campus_whisper/      → Express + Socket.IO server
├── OVERVIEW.md                  → Architecture deep-dive
├── OVERVIEW_Unhinged.md         → Extra spicy notes (optional)
└── README.md                    → You are here
```

### Quick Start (Local)

**Backend**
```bash
cd backend_campus_whisper
npm install
cp .env.example .env          # fill MONGODB_URI & JWT_SECRET
npm run dev
```

**Frontend**
```bash
cd frontend_campus_whisper
npm install
cp .env.example .env.local    # update VITE_API_URL if backend port ≠ 5000
npm run dev
```

Detailed steps → check each folder's own README.

### 🚨 Security Notice (for anyone cloning/using)
Never commit `.env` files or credential dumps.  
Previously seen risky files (remove from history if present):
- `backend_campus_whisper/.env` (MONGODB_URI, JWT_SECRET)
- `frontend_campus_whisper/.env.local`
- `backend_campus_whisper/temp_credentials.txt`

**Do this**:
1. Rotate any leaked secrets immediately
2. Clean history (example):
   ```bash
   git filter-repo --invert-paths --path .env --path .env.local --path temp_credentials.txt --force
   git push origin --force --all
   ```
3. Add to `.gitignore`:
   ```
   *.env*
   temp_credentials.txt
   ```
4. Use secure secrets in production (Render dashboard, Vercel env, GitHub Secrets)

No live credentials are leaking on the demo site (no console dumps, no exposed endpoints), but treat old commits as potentially compromised.

### Contributing
PRs welcome — add rooms, features, bug fixes, or more chaos.  
Use conventional commits if you want bonus points 😈

### License
MIT — fork, deploy, roast responsibly.

Questions / want rate-limiting added / monorepo conversion? Open an issue.
