const express = require('express');
const Message = require('../models/Message');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:roomId/preview — get limited preview messages (no auth, for non-members)
router.get('/:roomId/preview', async (req, res) => {
  try {
    const { roomId } = req.params;
    const previewLimit = 15; // Show last 15 messages as preview

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const total = await Message.countDocuments({ room: roomId });

    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .limit(previewLimit)
      .lean();

    messages.reverse();

    const result = messages.map(msg => ({
      ...msg,
      id: msg._id,
      timestamp: msg.createdAt,
      isMe: false
    }));

    res.json({
      messages: result,
      totalMessages: total,
      isPreview: true,
      previewLimit
    });
  } catch (err) {
    console.error('Get preview messages error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/:roomId — get messages for a room (paginated)
router.get('/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 30, before } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 30));

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const filter = { room: roomId };
    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const total = await Message.countDocuments({ room: roomId });
    
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limitNum + 1) // Fetch one extra to check hasMore
      .lean();

    const hasMore = messages.length > limitNum;
    if (hasMore) messages.pop(); // Remove the extra

    // Reverse so oldest first
    messages.reverse();

    // Add isMe flag based on requesting user
    const result = messages.map(msg => ({
      ...msg,
      id: msg._id,
      timestamp: msg.createdAt,
      isMe: msg.userId.toString() === req.user.id
    }));

    res.json({
      messages: result,
      hasMore,
      total,
      oldestTimestamp: messages.length > 0 ? messages[0].createdAt : null
    });
  } catch (err) {
    console.error('Get messages error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/messages/:roomId — send message via REST (alternative to socket)
router.post('/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { content, type, metadata } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    const message = await Message.create({
      room: roomId,
      userId: req.user.id,
      userName: user.alias,
      userAvatar: user.avatar || '',
      content,
      type: type || 'text',
      metadata: metadata || null
    });

    // Update room's updatedAt
    room.updatedAt = new Date();
    await room.save();

    res.status(201).json({
      ...message.toJSON(),
      isMe: true
    });
  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
