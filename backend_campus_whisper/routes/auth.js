const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, alias: user.alias },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { alias, passkey, frequency } = req.body;

    if (!alias || !passkey) {
      return res.status(400).json({ error: 'Alias and passkey are required' });
    }

    const existing = await User.findOne({ alias });
    if (existing) {
      return res.status(409).json({ error: 'Alias already taken' });
    }

    const user = await User.create({
      alias,
      passkey,
      handle: `@${alias.toLowerCase().replace(/\s+/g, '_')}`,
      frequency: frequency || 'Main Campus'
    });

    // Populate joinedRooms (empty for new users, but keeps response consistent)
    const populatedUser = await User.findById(user._id).populate('joinedRooms');

    const token = signToken(user);
    res.status(201).json({ token, user: populatedUser });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { alias, passkey } = req.body;

    if (!alias || !passkey) {
      return res.status(400).json({ error: 'Alias and passkey are required' });
    }

    const user = await User.findOne({ alias });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await user.comparePasskey(passkey);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set online
    user.status = 'online';
    await user.save();

    // Re-fetch with populated joinedRooms so frontend has full room data
    const populatedUser = await User.findById(user._id).populate('joinedRooms');

    const token = signToken(user);
    res.json({ token, user: populatedUser });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('joinedRooms');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await user.comparePasskey(currentPassword);
    if (!match) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.passkey = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/auth/account
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { status: 'offline' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
