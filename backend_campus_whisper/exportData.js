require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');

async function exportData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully.\n');

    // Fetch all users (passkey is stripped by toJSON)
    console.log('Fetching users...');
    const users = await User.find({}).populate('joinedRooms').lean();
    console.log(`  Found ${users.length} users.`);

    // Fetch all rooms
    console.log('Fetching rooms...');
    const rooms = await Room.find({}).populate('createdBy', 'alias handle avatar').populate('members', 'alias handle avatar').populate('admins', 'alias handle avatar').lean();
    console.log(`  Found ${rooms.length} rooms.`);

    // Fetch all messages
    console.log('Fetching messages...');
    const messages = await Message.find({}).populate('room', 'name category').populate('userId', 'alias handle avatar').lean();
    console.log(`  Found ${messages.length} messages.\n`);

    // Strip passkeys from user data (lean() bypasses toJSON, so do it manually)
    const sanitizedUsers = users.map(user => {
      const { passkey, ...rest } = user;
      return rest;
    });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      project: 'CampusWhisper',
      summary: {
        totalUsers: sanitizedUsers.length,
        totalRooms: rooms.length,
        totalMessages: messages.length,
      },
      users: sanitizedUsers,
      rooms: rooms,
      messages: messages,
    };

    const outputPath = path.join(__dirname, 'campus_whisper_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportPayload, null, 2), 'utf-8');

    console.log(`Data exported successfully to: ${outputPath}`);
    console.log(`  Users:    ${sanitizedUsers.length}`);
    console.log(`  Rooms:    ${rooms.length}`);
    console.log(`  Messages: ${messages.length}`);

    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Export failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

exportData();
