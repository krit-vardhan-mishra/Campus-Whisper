const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Import models
const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');

const MONGODB_URI = process.env.MONGODB_URI;

const usersData = [
  { alias: 'TempUser', passkey: 'securePass123!', handle: '@tempuser', status: 'online', frequency: 'Main Campus', avatar: 'https://i.pravatar.cc/150?u=TempUser' },
  { alias: 'Alice', passkey: 'password123', handle: '@alice', status: 'online', frequency: 'Engineering Hall', avatar: 'https://i.pravatar.cc/150?u=Alice' },
  { alias: 'Bob', passkey: 'password123', handle: '@bob', status: 'away', frequency: 'The Dorms', avatar: 'https://i.pravatar.cc/150?u=Bob' },
  { alias: 'Charlie', passkey: 'password123', handle: '@charlie', status: 'offline', frequency: 'Arts District', avatar: 'https://i.pravatar.cc/150?u=Charlie' }
];

const roomsData = [
  { name: 'CS Nerd', description: 'For all things computer science', category: 'tech' },
  { name: 'Sport Enthusiastic', description: 'Discussing all sports', category: 'social' },
  { name: 'Cinemaan', description: 'Movie buffs unite', category: 'social' },
  { name: 'Photogenic', description: 'Photography tips and sharing', category: 'social' },
  { name: 'Natural', description: 'Nature lovers and hikers', category: 'social' }
];

const conversations = {
  'CS Nerd': [
    { user: 'TempUser', content: "Has anyone tried the new React compiler?" },
    { user: 'Alice', content: "Yes! It's super fast, effectively removes the need for useMemo." },
    { user: 'Bob', content: "I'm still skeptical. Does it handle complex dependency arrays correctly?" },
    { user: 'TempUser', content: "From what I've seen, it's pretty solid. Just requires a build step." },
    { user: 'Alice', content: "Exactly. The optimization gains are worth the setup." }
  ],
  'Sport Enthusiastic': [
    { user: 'Bob', content: "Did you see the game last night?" },
    { user: 'Charlie', content: "Yeah, that last-minute goal was insane!" },
    { user: 'TempUser', content: "I missed it! Who won?" },
    { user: 'Bob', content: "Real Madrid, strictly on vibes as usual." },
    { user: 'TempUser', content: "Typical. I need to catch the highlights." }
  ],
  'Cinemaan': [
    { user: 'Charlie', content: "The cinematography in Dune was amazing." },
    { user: 'TempUser', content: "Agreed. Denis Villeneuve is a master of scale." },
    { user: 'Alice', content: "I felt the pacing was a bit slow in the middle though." },
    { user: 'Charlie', content: "That's fair, but it builds the atmosphere perfectly." }
  ],
  'Photogenic': [
    { user: 'Alice', content: "Best settings for night photography?" },
    { user: 'TempUser', content: "Low ISO if you have a tripod, otherwise crank it up and embrace the grain." },
    { user: 'Charlie', content: "And open that aperture as wide as it goes!" }
  ],
  'Natural': [
    { user: 'TempUser', content: "The hiking trails are beautiful this time of year." },
    { user: 'Bob', content: "Saw a deer on my morning run." },
    { user: 'Alice', content: "Anyone know a good camping spot nearby?" },
    { user: 'TempUser', content: "Try the state park north of the campus, it's quiet on weekdays." }
  ]
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create Users
    const createdUsers = {};
    for (const userData of usersData) {
      let user = await User.findOne({ alias: userData.alias });
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${user.alias}`);
      } else {
        console.log(`ℹ️ User ${user.alias} already exists`);
        user.passkey = userData.passkey; // Update passkey to known value
        await user.save();
      }
      createdUsers[userData.alias] = user;
    }

    const mainUser = createdUsers['TempUser'];

    // 2. Create Rooms and Conversations
    let userDetailsMarkdown = `# User Details: ${mainUser.alias}\n\n`;
    userDetailsMarkdown += `- **Alias:** ${mainUser.alias}\n`;
    userDetailsMarkdown += `- **Passkey:** ${usersData[0].passkey}\n`;
    userDetailsMarkdown += `- **Handle:** ${mainUser.handle}\n`;
    userDetailsMarkdown += `- **Generated At:** ${new Date().toISOString()}\n\n`;
    userDetailsMarkdown += `## Joined Rooms & Conversations\n\n`;

    for (const roomData of roomsData) {
      let room = await Room.findOne({ name: roomData.name });
      if (!room) {
        room = new Room({
          ...roomData,
          createdBy: mainUser._id,
          members: Object.values(createdUsers).map(u => u._id), // Add all users to all rooms
          admins: [mainUser._id]
        });
        await room.save();
        console.log(`✅ Created room: ${room.name}`);
      } else {
        console.log(`ℹ️ Room ${room.name} already exists`);
        // Ensure all users are members
        const allUserIds = Object.values(createdUsers).map(u => u._id);
        let changed = false;
        allUserIds.forEach(uid => {
          if (!room.members.includes(uid)) {
            room.members.push(uid);
            changed = true;
          }
        });
        if (changed) await room.save();
      }

      // Add Messages
      const roomMsgs = conversations[room.name];
      if (roomMsgs) {
        userDetailsMarkdown += `### Room: ${room.name}\n`;
        // Check if messages already exist to avoid spamming duplicates on re-run (simple check)
        const count = await Message.countDocuments({ room: room._id });
        if (count < roomMsgs.length) {
          for (const msgData of roomMsgs) {
            const author = createdUsers[msgData.user];
            const msg = new Message({
              room: room._id,
              userId: author._id,
              userName: author.alias,
              userAvatar: author.avatar,
              content: msgData.content,
              type: 'text'
            });
            await msg.save();
          }
          console.log(`✅ Added messages to ${room.name}`);
        } else {
          console.log(`ℹ️ Messages likely already exist for ${room.name}, skipping insertion.`);
        }

        // Add to Markdown Transcript
        roomMsgs.forEach(msg => {
          userDetailsMarkdown += `- **${msg.user}:** ${msg.content}\n`;
        });
        userDetailsMarkdown += `\n`;
      }
    }

    // 3. Update all users' joinedRooms
    for (const user of Object.values(createdUsers)) {
      // Just find all rooms from DB where user is a member? 
      // Or just re-sync with the ones we know.
      // Let's being simple and robust:
      const userInDb = await User.findById(user._id);
      // Find all rooms where members include user._id
      const rooms = await Room.find({ members: user._id });
      userInDb.joinedRooms = rooms.map(r => r._id);
      await userInDb.save();
    }
    console.log(`✅ Synced joinedRooms for all users`);

    // 4. Save Credentials to File (legacy)
    const credentialsContent = `
Alias: ${mainUser.alias}
Passkey: ${usersData[0].passkey}
Generated At: ${new Date().toISOString()}
    `.trim();
    fs.writeFileSync(path.join(__dirname, 'temp_credentials.txt'), credentialsContent);
    console.log('✅ Credentials saved to temp_credentials.txt');

    // 5. Save Report to Markdown
    fs.writeFileSync(path.join(__dirname, 'user_details.md'), userDetailsMarkdown);
    console.log('✅ User details saved to user_details.md');

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();

