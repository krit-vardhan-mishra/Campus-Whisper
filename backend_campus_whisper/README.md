# Campus Whisper — Backend

Real-time anonymous campus discussion platform. This is the backend API and WebSocket server for the **Campus Whisper** frontend.

Live demo: https://campus-whisper.onrender.com

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Real-time:** Socket.IO
- **Auth:** JWT + bcryptjs

## Quick Start

```bash
cd backend_campus_whisper
npm install
npm run dev          # starts with --watch (auto-restart)
# or
npm start            # production
```

Server runs on **http://localhost:5002** by default.

## Environment Variables

Create a `.env` file (already included):

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5002`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |

## Project Structure

```
backend_campus_whisper/
├── server.js              # Entry point — Express + Socket.IO + MongoDB
├── .env                   # Environment variables
├── package.json
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js            # User schema (alias, passkey, status, frequency)
│   ├── Room.js            # Room schema (name, category, tags, members)
│   └── Message.js         # Message schema (content, type, metadata)
├── routes/
│   ├── auth.js            # Auth endpoints (register, login, me, password, logout)
│   ├── rooms.js           # Room CRUD + join/leave
│   └── messages.js        # Message history + send via REST
└── socket/
    └── socketHandler.js   # Socket.IO events (real-time messaging, typing)
```

## REST API

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account with alias + passkey |
| POST | `/api/auth/login` | No | Login, returns JWT token |
| GET | `/api/auth/me` | Yes | Get current user profile |
| PUT | `/api/auth/password` | Yes | Update password |
| POST | `/api/auth/logout` | Yes | Set user status to offline |
| DELETE | `/api/auth/account` | Yes | Delete account permanently |

**Register / Login body:**
```json
{
  "alias": "Silent-Fox-42",
  "passkey": "mysecret",
  "frequency": "Engineering Hall"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": "...",
    "alias": "Silent-Fox-42",
    "handle": "@silent-fox-42",
    "status": "online",
    "frequency": "Engineering Hall"
  }
}
```

### Rooms

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/rooms` | No | List all rooms (supports `?category=` and `?search=`) |
| GET | `/api/rooms/:id` | No | Get single room with populated members |
| POST | `/api/rooms` | Yes | Create a new room |
| POST | `/api/rooms/:id/join` | Yes | Join a room |
| POST | `/api/rooms/:id/leave` | Yes | Leave a room |
| DELETE | `/api/rooms/:id` | Yes | Delete room (owner only) |

**Create room body:**
```json
{
  "name": "Hackathon Prep",
  "description": "Plan your next hack!",
  "category": "tech",
  "tags": ["hackathon", "coding"],
  "isPrivate": false
}
```

**Categories:** `tech`, `social`, `confessions`, `gaming`, `study`, `academic`, `clubs`

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages/:roomId` | Yes | Get message history (supports `?limit=` and `?before=`) |
| POST | `/api/messages/:roomId` | Yes | Send message via REST |

**Send message body:**
```json
{
  "content": "Hello everyone!",
  "type": "text"
}
```

**Message types:** `text`, `code`, `system`, `image`

## Socket.IO Events

Connect with auth token:
```js
const socket = io('http://localhost:5002', {
  auth: { token: 'your-jwt-token' }
});
```

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `roomId` (string) | Join a room for real-time messages |
| `leave_room` | `roomId` (string) | Leave a room |
| `send_message` | `{ content, roomId, type?, metadata? }` | Send a message to a room |
| `typing` | `{ roomId }` | Broadcast typing indicator |
| `stop_typing` | `{ roomId }` | Stop typing indicator |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message` | `{ id, userId, userName, userAvatar, content, timestamp, type, metadata }` | New message in room |
| `user_joined` | `{ userId, userName, onlineCount }` | User joined the room |
| `user_left` | `{ userId, userName, onlineCount }` | User left the room |
| `user_typing` | `{ userId, userName }` | Someone is typing |
| `user_stop_typing` | `{ userId, userName }` | Someone stopped typing |

## Auth Header

All authenticated endpoints require:
```
Authorization: Bearer <jwt-token>
```

## Data Models

### User
- `alias` — unique anonymous username (e.g. "Silent-Fox-42")
- `passkey` — hashed password
- `handle` — auto-generated handle (@silent-fox-42)
- `avatar` — profile image URL
- `status` — online / offline / away
- `frequency` — campus zone (Main Campus, Engineering Hall, Arts District, The Dorms)
- `joinedRooms` — array of Room references

### Room
- `name` — room display name
- `description` — room description
- `category` — tech / social / confessions / gaming / study / academic / clubs
- `tags` — array of tag strings
- `isPrivate` — boolean
- `image` — room cover image URL
- `createdBy` — User reference
- `members` — array of User references
- `onlineCount` — currently online users

### Message
- `room` — Room reference
- `userId` — sender User reference
- `userName` — sender display name
- `userAvatar` — sender avatar URL
- `content` — message content (text/HTML/markdown)
- `type` — text / code / system / image
- `metadata` — optional extra data (language for code, URL for images, etc.)

License
- This project is released under the MIT License. See [../LICENSE](../LICENSE) for details.
