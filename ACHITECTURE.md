## 1. System Overview

The application follows a standard **Client-Server-Database** model using the MERN stack. Real-time updates are handled by a dedicated WebSocket layer via Socket.IO.

---

## 2. Database Schemas (MongoDB)

To ensure data integrity, we define three primary collections.

### 2.1 User Schema

Stores the anonymous identity credentials.

```javascript
{
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Hashed with Bcrypt
  avatarColor: { type: String, default: "#007bff" },
  createdAt: { type: Date, default: Date.now }
}

```

### 2.2 Room Schema

Stores information about the interest-based "Servers."

```javascript
{
  name: { type: String, unique: true, required: true },
  description: { type: String },
  category: { type: String, enum: ['Academic', 'Social', 'Tech', 'Random'] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}

```

### 2.3 Message Schema

Stores the persistent chat history.

```javascript
{
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}

```

---

## 3. API Endpoints (REST)

### Auth Routes (`/api/auth`)

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/register` | Create a new anonymous account |
| `POST` | `/login` | Authenticate and return JWT |
| `GET` | `/check-username` | Verify if a username is available |

### Room Routes (`/api/rooms`)

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Fetch all available rooms |
| `POST` | `/create` | Create a new room (Auth required) |
| `GET` | `/:roomId/messages` | Fetch chat history for a specific room |

---

## 4. Real-Time Events (Socket.IO)

Communication is event-driven. The server acts as a relay between users in the same "room."

### Client to Server (Emitters)

* **`join_room`**: Triggered when a user clicks a room card. (Payload: `roomId`, `username`)
* **`send_message`**: Triggered when a user hits enter. (Payload: `roomId`, `message`, `senderId`)
* **`typing`**: (Optional) Triggered on keystrokes to show activity.

### Server to Client (Listeners)

* **`receive_message`**: Broadcasts the message to everyone in the room.
* **`user_joined`**: Notifies the chat that a new anonymous user has arrived.
* **`room_list_update`**: Notifies the dashboard when a new room is created globally.

---

## 5. Deployment & Environment

* **Environment Variables (`.env`):**
* `PORT`: Usually 5000 for backend.
* `MONGO_URI`: The connection string (e.g., `.../campus-v1`).
* `JWT_SECRET`: A secret key for signing tokens.


* **CORS:** Configuration must allow the React frontend (port 3000) to communicate with the Node backend.

---
