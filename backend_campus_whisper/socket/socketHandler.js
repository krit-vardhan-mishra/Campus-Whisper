const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Track online users per room: { roomId: Set<userId> }
const roomUsers = new Map();

module.exports = function setupSocket(io) {
  // Authenticate socket connections via token
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
    console.log(`⚡ Socket connected: ${socket.userAlias} (${socket.id})`);

    // Set user online
    await User.findByIdAndUpdate(socket.userId, { status: 'online' });

    // JOIN ROOM
    socket.on('join_room', async (roomId) => {
      try {
        socket.join(roomId);

        // Track user in room
        if (!roomUsers.has(roomId)) {
          roomUsers.set(roomId, new Set());
        }
        roomUsers.get(roomId).add(socket.userId);

        // Update online count
        const onlineCount = roomUsers.get(roomId).size;
        await Room.findByIdAndUpdate(roomId, { onlineCount });

        // Notify room
        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          userName: socket.userAlias,
          onlineCount
        });

        console.log(`${socket.userAlias} joined room ${roomId} (${onlineCount} online)`);
      } catch (err) {
        console.error('join_room error:', err.message);
      }
    });

    // LEAVE ROOM
    socket.on('leave_room', async (roomId) => {
      try {
        socket.leave(roomId);

        if (roomUsers.has(roomId)) {
          roomUsers.get(roomId).delete(socket.userId);
          const onlineCount = roomUsers.get(roomId).size;
          await Room.findByIdAndUpdate(roomId, { onlineCount });

          socket.to(roomId).emit('user_left', {
            userId: socket.userId,
            userName: socket.userAlias,
            onlineCount
          });
        }
      } catch (err) {
        console.error('leave_room error:', err.message);
      }
    });

    // SEND MESSAGE — matches frontend's socketService.emit('send_message', { content, roomId })
    socket.on('send_message', async (data) => {
      try {
        const { content, roomId, type, metadata } = data;
        if (!content || !roomId) return;

        const user = await User.findById(socket.userId);
        if (!user) return;

        const message = await Message.create({
          room: roomId,
          userId: socket.userId,
          userName: user.alias,
          userAvatar: user.avatar || '',
          content,
          type: type || 'text',
          metadata: metadata || null
        });

        // Update room timestamp
        await Room.findByIdAndUpdate(roomId, { updatedAt: new Date() });

        const payload = {
          id: message._id,
          userId: socket.userId,
          userName: user.alias,
          userAvatar: user.avatar || '',
          content,
          timestamp: message.createdAt,
          type: type || 'text',
          metadata: metadata || null
        };

        // Broadcast to everyone in room (including sender as receive_message)
        io.to(roomId).emit('receive_message', payload);

        console.log(`💬 ${user.alias} in ${roomId}: ${content.substring(0, 50)}`);
      } catch (err) {
        console.error('send_message error:', err.message);
      }
    });

    // TYPING INDICATOR
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

    // DISCONNECT
    socket.on('disconnect', async () => {
      console.log(`🔌 Socket disconnected: ${socket.userAlias}`);

      // Set user offline
      await User.findByIdAndUpdate(socket.userId, { status: 'offline' });

      // Remove from all rooms they were tracking
      for (const [roomId, users] of roomUsers.entries()) {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          const onlineCount = users.size;
          await Room.findByIdAndUpdate(roomId, { onlineCount });

          io.to(roomId).emit('user_left', {
            userId: socket.userId,
            userName: socket.userAlias,
            onlineCount
          });
        }
      }
    });
  });
};
