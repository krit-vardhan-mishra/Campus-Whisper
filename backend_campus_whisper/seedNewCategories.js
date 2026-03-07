require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');

const MONGODB_URI = process.env.MONGODB_URI;

const newRoomsData = [
  // --- Existing categories that had no rooms ---
  { name: 'Secret Confessions', description: 'Share your anonymous confessions — no judgment, only whispers.', category: 'confessions', image: 'https://images.pexels.com/photos/267961/pexels-photo-267961.jpeg', tags: ['confessions', 'anonymous', 'secrets'] },
  { name: 'Exam Confessions', description: 'The funniest and most relatable exam-day disasters.', category: 'confessions', image: 'https://images.pexels.com/photos/261909/pexels-photo-261909.jpeg', tags: ['confessions', 'exams'] },
  { name: 'Valorant Addicts', description: 'Strategies, clutches, and late-night gaming sessions.', category: 'gaming', image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg', tags: ['gaming', 'valorant', 'fps'] },
  { name: 'Chess Club', description: 'Openings, endgames, and friendly matches.', category: 'gaming', image: 'https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg', tags: ['gaming', 'chess', 'strategy'] },
  { name: 'Finals Study Group', description: 'Collaborative study sessions for upcoming finals.', category: 'study', image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg', tags: ['study', 'finals', 'exams'] },
  { name: 'DSA Grind', description: 'Daily coding problems and interview prep together.', category: 'study', image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg', tags: ['study', 'dsa', 'coding'] },
  { name: 'Academic Help Desk', description: 'Ask doubts freely — no question is too basic here.', category: 'academic', image: 'https://images.pexels.com/photos/5553050/pexels-photo-5553050.jpeg', tags: ['academic', 'help', 'doubts'] },
  { name: 'Robotics Club', description: 'Building bots, breaking things, and having fun.', category: 'clubs', image: 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg', tags: ['clubs', 'robotics', 'engineering'] },
  { name: 'Debate Society', description: 'Sharpen your arguments and win with words.', category: 'clubs', image: 'https://images.pexels.com/photos/8761542/pexels-photo-8761542.jpeg', tags: ['clubs', 'debate', 'speaking'] },

  // --- New categories ---
  { name: 'Meme Central', description: 'The dankest campus memes — post, laugh, repeat.', category: 'memes', image: 'https://images.pexels.com/photos/3761509/pexels-photo-3761509.jpeg', tags: ['memes', 'funny', 'humor'] },
  { name: 'Prof Memes', description: 'When profs become accidental comedians.', category: 'memes', image: 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg', tags: ['memes', 'professors', 'relatable'] },
  { name: 'Campus Cricket', description: 'Match updates, teams, and weekend cricket sessions.', category: 'sports', image: 'https://images.pexels.com/photos/3628912/pexels-photo-3628912.jpeg', tags: ['sports', 'cricket'] },
  { name: 'Football Fanatics', description: 'Campus league, fantasy football, everything footy.', category: 'sports', image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg', tags: ['sports', 'football'] },
  { name: 'Gym & Fitness', description: 'Workout tips, gym buddies, and fitness challenges.', category: 'sports', image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg', tags: ['sports', 'fitness', 'gym'] },
  { name: 'Music Lounge', description: 'Share tracks, discover artists, jam together.', category: 'music', image: 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg', tags: ['music', 'songs', 'artists'] },
  { name: 'Campus Bands', description: 'Looking for bandmates or promoting gigs.', category: 'music', image: 'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg', tags: ['music', 'bands', 'live'] },
  { name: 'Safe Space', description: 'Talk about stress, anxiety, or anything — we listen.', category: 'mental-health', image: 'https://images.pexels.com/photos/3760607/pexels-photo-3760607.jpeg', tags: ['mental-health', 'support', 'wellness'] },
  { name: 'Stress Busters', description: 'Share what helps you unwind during tough times.', category: 'mental-health', image: 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg', tags: ['mental-health', 'relaxation', 'self-care'] },
  { name: 'Book Exchange', description: 'Buy, sell, or exchange textbooks and novels.', category: 'marketplace', image: 'https://images.pexels.com/photos/1370298/pexels-photo-1370298.jpeg', tags: ['marketplace', 'books', 'exchange'] },
  { name: 'Gadget Deals', description: 'Second-hand laptops, phones, and accessories.', category: 'marketplace', image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg', tags: ['marketplace', 'gadgets', 'deals'] },
  { name: 'Fest Season', description: 'Upcoming college fests, hackathons, and cultural events.', category: 'events', image: 'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg', tags: ['events', 'fest', 'hackathon'] },
  { name: 'Workshop Alerts', description: 'Free workshops, webinars, and certification opportunities.', category: 'events', image: 'https://images.pexels.com/photos/7096/people-woman-coffee-meeting.jpg', tags: ['events', 'workshop', 'learning'] },
  { name: 'Placement Prep', description: 'Interview tips, resume reviews, and placement stories.', category: 'careers', image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg', tags: ['careers', 'placements', 'interviews'] },
  { name: 'Internship Hunt', description: 'Share openings, referrals, and application tips.', category: 'careers', image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg', tags: ['careers', 'internships', 'jobs'] },
];

const newConversations = {
  'Secret Confessions': [
    { user: 'Alice', content: 'I once submitted the wrong assignment and still got an A. Guilt is real.' },
    { user: 'Bob', content: 'I pretend to understand the lecture and Google everything later.' },
    { user: 'Charlie', content: 'I have eaten mess food and actually liked it once. Don\'t judge me.' },
    { user: 'TempUser', content: 'I skipped an exam thinking it was optional... it wasn\'t.' },
  ],
  'Exam Confessions': [
    { user: 'Bob', content: 'Wrote the perfect answer... on the wrong question.' },
    { user: 'Alice', content: 'I studied the entire syllabus except the one topic that came for 30 marks.' },
    { user: 'TempUser', content: 'My pen ran out of ink mid-exam. Used a borrowed pencil. Got 2 marks less for "readability".' },
  ],
  'Valorant Addicts': [
    { user: 'TempUser', content: 'Clutched a 1v4 with Jett last night, hands were literally shaking.' },
    { user: 'Bob', content: 'Nice! I\'m stuck in Gold forever though.' },
    { user: 'Charlie', content: 'Anyone up for a 5-stack tonight? Need a Sentinel main.' },
    { user: 'Alice', content: 'I just started playing, any tips for beginners?' },
    { user: 'TempUser', content: 'Crosshair placement is everything. Keep it at head level always.' },
  ],
  'Chess Club': [
    { user: 'Charlie', content: 'Anyone else obsessed with the Queen\'s Gambit opening?' },
    { user: 'Alice', content: 'I prefer the Sicilian Defense. Aggressive from move one.' },
    { user: 'TempUser', content: 'Let\'s organize a campus chess tournament this month!' },
  ],
  'Finals Study Group': [
    { user: 'Alice', content: 'Who has notes for Operating Systems? My notes are a disaster.' },
    { user: 'TempUser', content: 'I have good ones. Will share the drive link tonight.' },
    { user: 'Bob', content: 'Can we do a group study session in the library tomorrow?' },
    { user: 'Charlie', content: 'Count me in. 5 PM works?' },
  ],
  'DSA Grind': [
    { user: 'TempUser', content: 'Solved my first hard problem on LeetCode today!' },
    { user: 'Alice', content: 'Which one? I\'m stuck on dynamic programming problems.' },
    { user: 'TempUser', content: 'It was "Longest Increasing Subsequence". DP is all about finding the subproblem.' },
    { user: 'Bob', content: 'I recommend Striver\'s sheet — it builds concepts step by step.' },
  ],
  'Academic Help Desk': [
    { user: 'Charlie', content: 'Can someone explain Dijkstra\'s algorithm simply?' },
    { user: 'TempUser', content: 'Think of it like finding the shortest route on Google Maps — it always picks the cheapest next step.' },
    { user: 'Alice', content: 'That analogy is actually perfect! Greedy approach at each node.' },
  ],
  'Robotics Club': [
    { user: 'Bob', content: 'Our line follower bot finally works! Took 3 weeks of debugging.' },
    { user: 'TempUser', content: 'Nice! We\'re building a drone for the inter-college competition.' },
    { user: 'Alice', content: 'Anyone know a good source for cheap servo motors?' },
  ],
  'Debate Society': [
    { user: 'Charlie', content: 'This week\'s topic: "Should college attendance be mandatory?" — I say absolutely not.' },
    { user: 'Alice', content: 'Counter: without mandatory attendance, most students won\'t show up at all.' },
    { user: 'TempUser', content: 'Make the classes engaging and students will come voluntarily.' },
    { user: 'Bob', content: 'Facts. Nobody skips a good teacher\'s class.' },
  ],
  'Meme Central': [
    { user: 'TempUser', content: 'When the prof says "this won\'t come in the exam" and it\'s 50% of the paper 💀' },
    { user: 'Bob', content: 'My WiFi during online exams: "Connection lost at crucial moment" every single time.' },
    { user: 'Alice', content: 'College brochure: Modern labs with latest equipment. Reality: Windows XP and hope.' },
    { user: 'Charlie', content: 'LMAO too real. The lab PCs take 10 minutes to boot.' },
  ],
  'Prof Memes': [
    { user: 'Alice', content: 'Prof: "Any questions?" *moves to next slide in 0.3 seconds*' },
    { user: 'TempUser', content: '"I\'ll let you go 5 minutes early" — the biggest lie in academia.' },
    { user: 'Bob', content: 'When the prof uses their own book as the textbook and tests from stuff not in it.' },
  ],
  'Campus Cricket': [
    { user: 'Bob', content: 'Inter-department cricket starts next week. CSE vs Mech — who\'s winning?' },
    { user: 'TempUser', content: 'CSE boys are all-rounders... in coding, not cricket 😂' },
    { user: 'Charlie', content: 'Don\'t underestimate us! We have a secret weapon this year.' },
  ],
  'Football Fanatics': [
    { user: 'Charlie', content: 'Sunday evening match on the main ground. 6v6, bring your own water.' },
    { user: 'Alice', content: 'I\'ll be there! Need more people for defense though.' },
    { user: 'TempUser', content: 'I can play keeper. Just don\'t blame me if we concede 10.' },
  ],
  'Gym & Fitness': [
    { user: 'Bob', content: 'Campus gym finally got new dumbbells! No more fighting over the 10kg ones.' },
    { user: 'Alice', content: 'Anyone want to start a morning workout group? 6 AM daily.' },
    { user: 'TempUser', content: '6 AM? That\'s when I\'m in my deepest REM sleep. How about 7?' },
    { user: 'Charlie', content: 'I\'m in for 7. Need to get in shape before fest season.' },
  ],
  'Music Lounge': [
    { user: 'Alice', content: 'Just discovered this indie artist called Prateek Kuhad — absolute vibe.' },
    { user: 'TempUser', content: 'Cold/Mess is a masterpiece. Also check out The Local Train.' },
    { user: 'Charlie', content: 'Anyone here into lo-fi? Need study playlist recommendations.' },
    { user: 'Bob', content: 'I\'ll share my 500+ track lo-fi playlist. It got me through finals.' },
  ],
  'Campus Bands': [
    { user: 'TempUser', content: 'Looking for a drummer for our band. We play alternative rock.' },
    { user: 'Charlie', content: 'I play drums! When\'s the audition?' },
    { user: 'TempUser', content: 'This Saturday, music room, 4 PM. Bring sticks!' },
  ],
  'Safe Space': [
    { user: 'Alice', content: 'Had a rough week. Assignments piling up and feeling overwhelmed.' },
    { user: 'TempUser', content: 'Been there. Take it one task at a time. You\'re doing better than you think.' },
    { user: 'Bob', content: 'The counseling center on campus is actually really helpful. No shame in going.' },
    { user: 'Charlie', content: 'Remember: your worth isn\'t defined by your GPA. Take breaks when needed.' },
  ],
  'Stress Busters': [
    { user: 'TempUser', content: 'Night walk around campus with earphones in — instant therapy.' },
    { user: 'Alice', content: 'I journal before bed. Gets all the anxious thoughts out of my head.' },
    { user: 'Bob', content: 'Gaming for an hour after studying helps me reset completely.' },
    { user: 'Charlie', content: 'Cooking maggi at 2 AM in the hostel kitchen is my stress buster 🍜' },
  ],
  'Book Exchange': [
    { user: 'Bob', content: 'Selling "Introduction to Algorithms" (CLRS) — barely used, ₹400.' },
    { user: 'Alice', content: 'I need "Digital Electronics" by Morris Mano. Anyone selling?' },
    { user: 'TempUser', content: 'I have it! DM me. Also have Signals & Systems if anyone needs.' },
  ],
  'Gadget Deals': [
    { user: 'TempUser', content: 'Selling my old Logitech mouse — works perfectly, ₹500 only.' },
    { user: 'Charlie', content: 'Anyone selling a second-hand mechanical keyboard?' },
    { user: 'Bob', content: 'I have a Redgear one, Cherry MX Blue switches. ₹1500, 6 months old.' },
  ],
  'Fest Season': [
    { user: 'Alice', content: 'TechFest registrations open next Monday! Hackathon has ₹50K prize pool.' },
    { user: 'TempUser', content: 'I\'m forming a team of 4 for the hackathon. Need a UI/UX person.' },
    { user: 'Charlie', content: 'Cultural night lineup looks amazing this year — Nucleya is performing!' },
    { user: 'Bob', content: 'Already got my front-row wristband. This is going to be epic.' },
  ],
  'Workshop Alerts': [
    { user: 'TempUser', content: 'Free AWS Cloud workshop this Friday — certificates included.' },
    { user: 'Alice', content: 'Google Developer Student Club is hosting a Flutter bootcamp next week.' },
    { user: 'Bob', content: 'Is the cybersecurity workshop by InfoSec club still happening?' },
    { user: 'Charlie', content: 'Yes! Saturday 3 PM in Lab 5. Bring your laptop.' },
  ],
  'Placement Prep': [
    { user: 'Alice', content: 'TCS NQT pattern changed this year. More focus on coding now.' },
    { user: 'TempUser', content: 'For Infosys, practice pseudo code questions. They\'re tricky but doable.' },
    { user: 'Bob', content: 'Anyone cleared Amazon OA? What topics should I focus on?' },
    { user: 'Charlie', content: 'Graphs, DP, and sliding window — those three cover 80% of Amazon questions.' },
  ],
  'Internship Hunt': [
    { user: 'TempUser', content: 'Microsoft internship applications close this Friday — apply ASAP!' },
    { user: 'Alice', content: 'I got a referral for Google STEP. Happy to share tips.' },
    { user: 'Bob', content: 'Any good internships for non-CS branches? Mech here.' },
    { user: 'TempUser', content: 'Check out Tata Motors and Bosch — they have solid mech internship programs.' },
  ],
};

async function seedNewData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get existing users to use as room creators and message authors
    const users = {};
    for (const alias of ['TempUser', 'Alice', 'Bob', 'Charlie']) {
      const user = await User.findOne({ alias });
      if (user) {
        users[alias] = user;
      }
    }

    if (Object.keys(users).length === 0) {
      console.error('❌ No seed users found. Run the original seedData.js first.');
      process.exit(1);
    }

    const creator = users['TempUser'] || Object.values(users)[0];
    const allUserIds = Object.values(users).map(u => u._id);
    let roomsCreated = 0;
    let messagesCreated = 0;

    for (const roomData of newRoomsData) {
      // Skip if room already exists
      const existing = await Room.findOne({ name: roomData.name });
      if (existing) {
        console.log(`ℹ️  Room "${roomData.name}" already exists — skipping.`);
        continue;
      }

      const room = await Room.create({
        name: roomData.name,
        description: roomData.description,
        category: roomData.category,
        image: roomData.image || '',
        tags: roomData.tags || [],
        isPrivate: false,
        createdBy: creator._id,
        admins: [creator._id],
        members: allUserIds,
        onlineCount: 0,
      });
      roomsCreated++;
      console.log(`✅ Created room: ${room.name} [${room.category}]`);

      // Add conversations
      const convo = newConversations[roomData.name];
      if (convo) {
        for (const msg of convo) {
          const author = users[msg.user];
          if (!author) continue;
          await Message.create({
            room: room._id,
            userId: author._id,
            userName: author.alias,
            userAvatar: author.avatar || '',
            content: msg.content,
            type: 'text',
          });
          messagesCreated++;
        }
        console.log(`   💬 Added ${convo.length} messages to "${roomData.name}"`);
      }
    }

    console.log(`\n🎉 Seeding complete!`);
    console.log(`   Rooms created:    ${roomsCreated}`);
    console.log(`   Messages created: ${messagesCreated}`);

    await mongoose.disconnect();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedNewData();
