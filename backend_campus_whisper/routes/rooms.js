const express = require('express');
const Room = require('../models/Room');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/rooms — list all rooms (public) with pagination
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = {};
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const [rooms, total] = await Promise.all([
      Room.find(filter)
        .select('-members')  // Exclude heavy members array from list
        .populate('createdBy', 'alias avatar')
        .populate('admins', 'alias avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Room.countDocuments(filter)
    ]);

    // Add memberCount without sending full array
    const roomIds = rooms.map(r => r._id);
    const memberCounts = await Room.aggregate([
      { $match: { _id: { $in: roomIds } } },
      { $project: { memberCount: { $size: '$members' } } }
    ]);
    const countMap = {};
    memberCounts.forEach(r => { countMap[r._id.toString()] = r.memberCount; });

    const enrichedRooms = rooms.map(r => ({
      ...r,
      id: r._id,
      memberCount: countMap[r._id.toString()] || 0,
      lastActive: r.updatedAt,
    }));

    res.json({
      rooms: enrichedRooms,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
      }
    });
  } catch (err) {
    console.error('List rooms error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/rooms/:id — single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('createdBy', 'alias avatar')
      .populate('admins', 'alias avatar')
      .populate('members', 'alias avatar status');

    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rooms — create room (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, tags, isPrivate, image } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const room = await Room.create({
      name,
      description: description || '',
      category: category || 'social',
      tags: tags || [],
      isPrivate: isPrivate || false,
      image: image || '',
      createdBy: req.user.id,
      admins: [req.user.id],
      members: [req.user.id]
    });

    // Add room to user's joinedRooms
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { joinedRooms: room._id }
    });

    const populated = await Room.findById(room._id)
      .populate('createdBy', 'alias avatar')
      .populate('admins', 'alias avatar');

    res.status(201).json(populated);
  } catch (err) {
    console.error('Create room error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rooms/:id/join — join a room
router.post('/:id/join', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Add user to members if not already
    if (!room.members.includes(req.user.id)) {
      room.members.push(req.user.id);
      await room.save();
    }

    // Add room to user's joinedRooms
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { joinedRooms: room._id }
    });

    res.json({ message: 'Joined room', room });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rooms/:id/leave — leave a room
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const userId = req.user.id;
    const isAdmin = room.admins.some(a => a.toString() === userId);

    // If user is an admin, check there's at least one other admin remaining
    if (isAdmin) {
      const otherAdmins = room.admins.filter(a => a.toString() !== userId);
      if (otherAdmins.length === 0) {
        return res.status(400).json({ 
          error: 'You are the last admin. Promote another member to admin before leaving.',
          code: 'LAST_ADMIN'
        });
      }
      // Remove from admins
      room.admins = otherAdmins;
    }

    room.members = room.members.filter(m => m.toString() !== userId);
    await room.save();

    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, {
      $pull: { joinedRooms: room._id }
    });

    res.json({ message: 'Left room' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/rooms/:id — update room (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const isAdmin = room.admins.some(a => a.toString() === req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only room admins can edit it' });
    }

    const { name, description, category, tags, image, isPrivate } = req.body;
    if (name !== undefined) room.name = name;
    if (description !== undefined) room.description = description;
    if (category !== undefined) room.category = category;
    if (tags !== undefined) room.tags = tags;
    if (image !== undefined) room.image = image;
    if (isPrivate !== undefined) room.isPrivate = isPrivate;

    await room.save();

    const populated = await Room.findById(room._id)
      .populate('createdBy', 'alias avatar')
      .populate('members', 'alias avatar status');

    res.json(populated);
  } catch (err) {
    console.error('Update room error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rooms/:id/add-admin — promote a member to admin
router.post('/:id/add-admin', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const isAdmin = room.admins.some(a => a.toString() === req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can promote members' });
    }

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    // Check target is a member
    if (!room.members.some(m => m.toString() === userId)) {
      return res.status(400).json({ error: 'User is not a member of this room' });
    }

    // Already admin?
    if (room.admins.some(a => a.toString() === userId)) {
      return res.status(400).json({ error: 'User is already an admin' });
    }

    room.admins.push(userId);
    await room.save();

    const populated = await Room.findById(room._id)
      .populate('createdBy', 'alias avatar')
      .populate('admins', 'alias avatar')
      .populate('members', 'alias avatar status');

    res.json(populated);
  } catch (err) {
    console.error('Add admin error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rooms/:id/remove-admin — demote an admin to regular member
router.post('/:id/remove-admin', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const isAdmin = room.admins.some(a => a.toString() === req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can demote admins' });
    }

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    // Can't demote the last admin
    if (room.admins.length <= 1) {
      return res.status(400).json({ error: 'Cannot remove the last admin. Promote someone else first.' });
    }

    room.admins = room.admins.filter(a => a.toString() !== userId);
    await room.save();

    const populated = await Room.findById(room._id)
      .populate('createdBy', 'alias avatar')
      .populate('admins', 'alias avatar')
      .populate('members', 'alias avatar status');

    res.json(populated);
  } catch (err) {
    console.error('Remove admin error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/rooms/:id — delete room (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const isAdmin = room.admins.some(a => a.toString() === req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only room admins can delete it' });
    }

    // Remove room from all members' joinedRooms
    const User = require('../models/User');
    await User.updateMany(
      { joinedRooms: room._id },
      { $pull: { joinedRooms: room._id } }
    );

    // Delete all messages in room
    const Message = require('../models/Message');
    await Message.deleteMany({ room: room._id });

    await Room.findByIdAndDelete(room._id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
