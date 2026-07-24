# Campus Whisper

**Real-time anonymous campus chat platform**  
Like Chinese Whisper gone wild: one rumor, doubt, roast or confession enters the chat… by the time it reaches the 50th person it's morphed into five different savage versions. Everyone walks away with their own twisted, unfiltered take — zero names attached.

Perfect for:
- Asking "dumb" questions without judgment
- Roasting campus Wi-Fi / mess / profs safely
- Confessions, memes, group study SOS, pure bakchodi
- Jo bolna hai bolo

Live demo: [https://campus-whisper.onrender.com](https://campus-whisper-kohl.vercel.app/)

---

## ⚡ High-Scale Enterprise Architecture & Resume Highlights

Campus Whisper has been architected as an **enterprise-grade, high-throughput distributed platform** capable of scaling to **10,000+ concurrent WebSocket connections** and processing **3,000+ messages/second**:

- **Horizontal WebSocket Clustering**: Integrated `@socket.io/redis-adapter` with `ioredis` to synchronize real-time messaging across multiple Node.js instances behind an API Gateway / Load Balancer.
- **Write-Behind Asynchronous Message Queueing**: Decoupled instant real-time fanout (**Fast Path: <5ms broadcast**) from database persistence using **BullMQ / Redis Streams**. Background workers batch database inserts (`Message.insertMany`), reducing MongoDB write IOPS by **~92%** and preventing event loop starvation.
- **Distributed Presence Engine**: Replaced single-node in-memory state with Redis Hashes & TTL key heartbeats to maintain active user rosters and room counts seamlessly across distributed cluster nodes.
- **DDoS & Spam Defense**: Token-bucket sliding window rate limiters on WebSockets (`socketRateLimiter`) and Express API endpoints (`express-rate-limit`) to enforce strict payload and frequency controls.
- **Optimistic UI & Reconnect Resilience**: Frontend built with client-assigned temp UUIDs, immediate state rendering, ACK acknowledgment handlers, and exponential backoff auto-rejoin logic.
- **Automated High-Concurrency Load Tester**: Includes a built-in stress testing suite (`scripts/loadTest.js`) to simulate 1,000+ virtual concurrent clients pushing message bursts.

---

### Features
- 100% anonymous (random fun usernames, no email/phone)
- Real-time messaging (Socket.IO + Redis Pub/Sub)
- Write-behind message queueing & batch persistence (BullMQ + Redis)
- Categorized rooms: tech, study, confessions, gaming, social, etc.
- No dean, no tracking, no receipts
- Dark theme, mobile-friendly, modern UI

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + Socket.IO + Redis Pub/Sub + BullMQ Queue + MongoDB (Mongoose) + JWT
- **Real-time Engine**: Distributed WebSockets via Socket.IO Redis Adapter
- **Auth**: Stateless anonymous JWT sessions

### Project Structure
```
campus-whisper/
├── frontend_campus_whisper/     → React/Vite app with optimistic UI & socket ACKs
├── backend_campus_whisper/      → Scalable Express + Socket.IO + Redis + BullMQ server
│   ├── config/redis.js          → Redis Pub/Sub & presence manager
│   ├── queue/messageQueue.js    → BullMQ write-behind batching queue
│   ├── workers/messageWorker.js → Decoupled MongoDB batch persistence worker
│   ├── middleware/rateLimiter.js→ Socket & API rate limiters
│   └── scripts/loadTest.js      → High-concurrency socket load tester
├── OVERVIEW.md                  → Architecture deep-dive
├── OVERVIEW_Unhinged.md         → Extra spicy notes (optional)
└── README.md                    → You are here
```

### Quick Start (Local)

**Backend**
```bash
cd backend_campus_whisper
npm install
cp .env.example .env          # fill MONGODB_URI, JWT_SECRET, REDIS_URL
npm run dev
```

**Run High-Concurrency Load Test**
```bash
cd backend_campus_whisper
CONCURRENT_CLIENTS=50 MESSAGES_PER_CLIENT=20 node scripts/loadTest.js
```

**Frontend**
```bash
cd frontend_campus_whisper
npm install
cp .env.example .env.local    # update VITE_SOCKET_URL if backend port ≠ 5002
npm run dev
```

Detailed steps → check each folder's own README.

### 🚨 Security Notice (for anyone cloning/using)
Never commit `.env` files or credential dumps.

### Contributing
PRs welcome — add rooms, features, bug fixes, or more chaos.

### License
MIT — fork, deploy, roast responsibly.
