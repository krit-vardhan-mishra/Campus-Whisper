const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const { presenceManager } = require('../config/redis');
const { addMessageJob } = require('../queue/messageQueue');
const { socketRateLimiter, cleanSocketRateLimit } = require('../middleware/rateLimiter');

module.exports = function setupSocket(io) {
  // Authenticate socket connections via JWT token
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userAlias = decoded.alias;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    // Set user online in Redis / Presence Store
    await presenceManager.setUserOnlineStatus(socket.userId, 'online');

    // Track active joined rooms for socket cleanup
    const joinedRooms = new Set();

    // JOIN ROOM
    socket.on('join_room', async (roomId) => {
      try {
        socket.join(roomId);
        joinedRooms.add(roomId);

        // Add user to Redis presence store & get updated count instantly
        const onlineCount = await presenceManager.addRoomUser(roomId, socket.userId);

        // Async background sync to MongoDB room online count
        Room.findByIdAndUpdate(roomId, { onlineCount }).catch(() => {});

        // Broadcast to everyone in room
        io.to(roomId).emit('user_joined', {
          userId: socket.userId,
          userName: socket.userAlias,
          onlineCount
        });
      } catch (err) {
        console.error('join_room error:', err.message);
      }
    });

    // LEAVE ROOM
    socket.on('leave_room', async (roomId) => {
      try {
        socket.leave(roomId);
        joinedRooms.delete(roomId);

        const onlineCount = await presenceManager.removeRoomUser(roomId, socket.userId);
        Room.findByIdAndUpdate(roomId, { onlineCount }).catch(() => {});

        io.to(roomId).emit('user_left', {
          userId: socket.userId,
          userName: socket.userAlias,
          onlineCount
        });
      } catch (err) {
        console.error('leave_room error:', err.message);
      }
    });

    // HIGH-THROUGHPUT SEND MESSAGE
    // Fast Path: Immediate Redis Pub/Sub Fanout
    // Async Path: Write-Behind Queue Persistence
    socket.on('send_message', async (data, ackCallback) => {
      try {
        const { content, roomId, type, metadata, clientTempId } = data;
        if (!content || !roomId) return;

        // 1. Rate Limiter check (Max 10 messages per 3s)
        if (!socketRateLimiter(socket, 10, 3000)) {
          if (typeof ackCallback === 'function') {
            ackCallback({ status: 'error', message: 'Rate limit exceeded. Slow down.' });
          }
          return;
        }

        const timestamp = new Date().toISOString();
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const payload = {
          id: messageId,
          clientTempId: clientTempId || null,
          userId: socket.userId,
          userName: socket.userAlias,
          userAvatar: socket.userAvatar || '',
          content,
          timestamp,
          type: type || 'text',
          metadata: metadata || null,
          status: 'sent'
        };

        // 2. FAST PATH: Instant real-time broadcast to room subscribers (<5ms)
        io.to(roomId).emit('receive_message', payload);

        // Send ACK back to sender immediately
        if (typeof ackCallback === 'function') {
          ackCallback({ status: 'ok', id: messageId, clientTempId });
        }

        // 3. ASYNC PATH: Enqueue message payload to write-behind batch queue for MongoDB insertion
        addMessageJob({
          roomId,
          userId: socket.userId,
          userName: socket.userAlias,
          userAvatar: socket.userAvatar || '',
          content,
          type: type || 'text',
          metadata: metadata || null,
          timestamp
        });

      } catch (err) {
        console.error('send_message error:', err.message);
        if (typeof ackCallback === 'function') {
          ackCallback({ status: 'error', message: 'Message delivery failed' });
        }
      }
    });

    // TYPING INDICATORS (Throttled Fanout)
    socket.on('typing', (data) => {
      const { roomId } = data;
      if (roomId) {
        socket.to(roomId).emit('user_typing', {
          userId: socket.userId,
          userName: socket.userAlias
        });
      }
    });

    socket.on('stop_typing', (data) => {
      const { roomId } = data;
      if (roomId) {
        socket.to(roomId).emit('user_stop_typing', {
          userId: socket.userId,
          userName: socket.userAlias
        });
      }
    });

    // DISCONNECT & PRESENCE CLEANUP
    socket.on('disconnect', async () => {
      cleanSocketRateLimit(socket.id);
      await presenceManager.setUserOnlineStatus(socket.userId, 'offline');

      // Cleanup user presence across joined rooms
      for (const roomId of joinedRooms) {
        const onlineCount = await presenceManager.removeRoomUser(roomId, socket.userId);
        Room.findByIdAndUpdate(roomId, { onlineCount }).catch(() => {});

        io.to(roomId).emit('user_left', {
          userId: socket.userId,
          userName: socket.userAlias,
          onlineCount
        });
      }
    });
  });
};
