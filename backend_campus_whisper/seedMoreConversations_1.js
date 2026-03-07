require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');

const MONGODB_URI = process.env.MONGODB_URI;

// Extended conversations for all room categories
const conversationsByCategory = {
  tech: [
    { user: 'Alice', content: 'Has anyone tried the new React 19 compiler? The performance gains are insane!' },
    { user: 'Bob', content: 'Yeah! The automatic memoization is a game changer. No more useMemo everywhere.' },
    { user: 'Charlie', content: 'I\'m still on React 18. Is it worth upgrading mid-project?' },
    { user: 'Alice', content: 'Definitely. The migration guide is solid. Took me about 2 hours for a medium project.' },
    { user: 'TempUser', content: 'Anyone using Bun instead of Node.js? The speed difference is wild 🚀' },
    { user: 'Bob', content: 'Bun is great for dev, but I\'d still use Node for production until the ecosystem catches up.' },
    { user: 'Charlie', content: 'What about Deno? Kevin from our batch swears by it.' },
    { user: 'Alice', content: 'Deno 2.0 with npm compatibility is actually really good now.' },
    { user: 'TempUser', content: 'Just deployed my first Rust API. The compile times are brutal but the runtime is 🔥' },
    { user: 'Bob', content: 'Rust for backend? That\'s bold. What framework did you use?' },
    { user: 'TempUser', content: 'Actix-web. It handles 10x more requests than my Express server on the same hardware.' },
    { user: 'Charlie', content: 'Speaking of performance, has anyone benchmarked SQLite vs PostgreSQL for small projects?' },
    { user: 'Alice', content: 'SQLite is surprisingly fast for read-heavy workloads. Turso makes it even better with edge deployment.' },
    { user: 'Bob', content: 'Hot take: most college projects don\'t need a database at all. JSON files are fine 😂' },
    { user: 'Charlie', content: 'Lmao that\'s how half the hackathon projects work anyway' },
    { user: 'TempUser', content: 'Anyone going to the Web3 workshop tomorrow? Free pizza apparently.' },
    { user: 'Alice', content: 'Web3 is dead, but free pizza is forever. I\'m in.' },
    { user: 'Bob', content: 'The AI/ML workshop was way better last week. Prof. Sharma actually showed practical stuff.' },
    { user: 'Charlie', content: 'True! I built a sentiment analyzer in like 30 minutes using that HuggingFace tutorial.' },
    { user: 'TempUser', content: 'Just found out our college WiFi blocks SSH. Had to use a VPN to push to GitHub from the lab 💀' },
    { user: 'Alice', content: 'Pro tip: use port 443 for SSH. They won\'t block HTTPS port.' },
    { user: 'Bob', content: 'Or just use GitHub Desktop. Works through their firewall.' },
    { user: 'Charlie', content: 'The real hack is using the CS department\'s network. No restrictions there 😏' },
  ],
  social: [
    { user: 'Alice', content: 'Who else is going to the freshers\' party this weekend?' },
    { user: 'Bob', content: 'I heard the DJ is from Mumbai. Should be lit 🔥' },
    { user: 'Charlie', content: 'Last year\'s party was mid honestly. Hoping this one is better.' },
    { user: 'TempUser', content: 'The dress code is "formal casual" whatever that means 😂' },
    { user: 'Alice', content: 'Just wear jeans and a nice shirt. Nobody actually dresses formal.' },
    { user: 'Bob', content: 'Remember when Rahul showed up in a full suit last year? Legend.' },
    { user: 'Charlie', content: 'He won best dressed though so who\'s laughing now' },
    { user: 'TempUser', content: 'Is the food included or do we have to pay extra?' },
    { user: 'Alice', content: 'Included! Rs 200 covers everything - food, games, and the photo booth.' },
    { user: 'Bob', content: 'The photo booth was the best part last time. Those props were hilarious.' },
    { user: 'Charlie', content: 'Anyone want to carpool from Hostel 3? I have space for 3 more.' },
    { user: 'TempUser', content: 'Count me in! What time are you leaving?' },
    { user: 'Alice', content: 'We\'re planning to reach by 6. The good food goes fast.' },
    { user: 'Bob', content: 'Facts. By 8 PM last year they were serving plain bread and butter 💀' },
    { user: 'Charlie', content: 'The cultural committee really needs a bigger budget' },
    { user: 'TempUser', content: 'Or maybe just don\'t invite 500 people when you budget for 200 🤷' },
  ],
  confessions: [
    { user: 'Anonymous', content: 'I\'ve been using ChatGPT for all my assignments and nobody has noticed yet...' },
    { user: 'Anonymous', content: 'Confession: I have a crush on someone in my study group but I\'m too scared to say anything.' },
    { user: 'Anonymous', content: 'I once told my professor I had a family emergency to skip a test. There was no emergency.' },
    { user: 'Anonymous', content: 'I\'ve been pretending to understand quantum physics for 3 semesters. I\'m in too deep now.' },
    { user: 'Anonymous', content: 'The canteen aunty gives me extra food because I always say please and thank you. Life hack.' },
    { user: 'Anonymous', content: 'I\'ve never actually read any of the required textbooks. Toppr and YouTube University all the way.' },
    { user: 'Anonymous', content: 'I accidentally called my professor "mom" in front of the entire class. It\'s been 2 years and I still think about it at 3 AM.' },
    { user: 'Anonymous', content: 'I submitted my friend\'s code for the lab exam. We both got the same marks. The TA didn\'t notice.' },
    { user: 'Anonymous', content: 'I pretend to take notes on my laptop but I\'m actually on Reddit the entire lecture.' },
    { user: 'Anonymous', content: 'The wifi password for the faculty room is "faculty123". You\'re welcome.' },
    { user: 'Anonymous', content: 'I\'ve been eating in my room for months because I\'m too anxious to sit in the mess alone.' },
    { user: 'Anonymous', content: 'I once slept through an entire exam. Like literally never woke up. Lost 30% of my grade.' },
    { user: 'Anonymous', content: 'My "gym transformation" photos are just different lighting and angles. Still haven\'t lost a kg.' },
    { user: 'Anonymous', content: 'I study for 30 minutes and then spend 2 hours on Instagram. Rinse and repeat.' },
    { user: 'Anonymous', content: 'Someone please tell the guy in Room 302 that we can all hear his guitar practice at midnight.' },
    { user: 'Anonymous', content: 'I started a rumor that the library is haunted so fewer people come and I can always get a good seat.' },
  ],
  gaming: [
    { user: 'Bob', content: 'Anyone up for Valorant tonight? Need 2 more for a 5-stack.' },
    { user: 'Charlie', content: 'I\'m in! What rank are we playing at?' },
    { user: 'TempUser', content: 'Gold 3. Don\'t flame me if I whiff I just got back from a break 😅' },
    { user: 'Bob', content: 'No flame zone. We\'re here for vibes, not Radiant clips.' },
    { user: 'Alice', content: 'I\'ll join as Sage. Someone needs to babysit you all.' },
    { user: 'Charlie', content: 'Oof 💀 that\'s a personal attack.' },
    { user: 'TempUser', content: 'lol she\'s not wrong though. Last game I rushed A site alone and died instantly.' },
    { user: 'Bob', content: 'Classic TempUser moment. At least buy a Phantom before rushing please.' },
    { user: 'Alice', content: 'Has anyone tried the new BGMI update? The Erangel revamp looks sick.' },
    { user: 'Charlie', content: 'Yeah! The new Pochinki redesign is actually good for once.' },
    { user: 'TempUser', content: 'I can\'t play BGMI anymore. My phone reaches supervillain temperatures every game.' },
    { user: 'Bob', content: 'Get a cooling fan pad from that guy in B-block. Rs 300 and it actually works.' },
    { user: 'Alice', content: 'The gaming club is hosting a FIFA tournament next week. ₹500 entry, winner gets a controller.' },
    { user: 'Charlie', content: 'Finally a tournament I can actually win! FIFA is my thing 🎮' },
    { user: 'TempUser', content: 'Famous last words 😂' },
    { user: 'Bob', content: 'Bro Charlie plays with manual shooting off. He\'s doomed.' },
    { user: 'Alice', content: 'Anyone else play Stardew Valley? Need tips for my winery.' },
    { user: 'Charlie', content: 'A person of culture! Ancient Fruit wine is the meta. Trust the process.' },
    { user: 'TempUser', content: 'I have 400 hours in Stardew and still haven\'t caught the Legend fish.' },
    { user: 'Bob', content: 'Skill issue tbh' },
  ],
  study: [
    { user: 'Alice', content: 'Does anyone have notes for the Operating Systems mid-sem?' },
    { user: 'Bob', content: 'I have handwritten notes for chapters 1-5. Can share photos if you want.' },
    { user: 'Charlie', content: 'The Galvin textbook is free on the library portal btw. Just search "OS concepts".' },
    { user: 'TempUser', content: 'Wait, we have a library portal? 💀' },
    { user: 'Alice', content: 'Lol yes. libportal.college.edu. Your student ID is the login.' },
    { user: 'Bob', content: 'Pro tip: Gate Smashers on YouTube explains OS better than our professor.' },
    { user: 'Charlie', content: 'The Neso Academy playlist is goated for DBMS too.' },
    { user: 'TempUser', content: 'Anyone want to form a study group for the DSA exam? I\'m struggling with graphs.' },
    { user: 'Alice', content: 'Yes! Let\'s meet in the library study room. Tomorrow 4 PM?' },
    { user: 'Bob', content: 'I can explain Dijkstra\'s and BFS/DFS. Those tripped me up last semester too.' },
    { user: 'Charlie', content: 'LeetCode problem of the day helped me so much. Started with easies and now I can do mediums.' },
    { user: 'TempUser', content: 'The jump from easy to medium on LeetCode is like going from tutorial to dark souls 😭' },
    { user: 'Alice', content: 'Has anyone taken the AWS certification? Is it worth the ₹12k?' },
    { user: 'Bob', content: 'Wait till Amazon sponsors it during campus tech week. It\'s free then.' },
    { user: 'Charlie', content: 'The Cloud Computing elective covers most of the Cloud Practitioner topics anyway.' },
    { user: 'TempUser', content: 'Anyone have the previous year papers for Discrete Math?' },
    { user: 'Alice', content: 'Check the Telegram group "CSE Archives". They have papers from 2019 onwards.' },
    { user: 'Bob', content: 'That group is a goldmine. Saved my CGPA last semester.' },
  ],
  academic: [
    { user: 'Alice', content: 'Is Prof. Kumar strict about attendance in the AI elective?' },
    { user: 'Bob', content: 'Very strict. 75% minimum or you get debarred. No exceptions.' },
    { user: 'Charlie', content: 'I got away with 72% last sem but had to write an apology letter 😬' },
    { user: 'TempUser', content: 'An apology letter?? For attendance? This isn\'t school lol' },
    { user: 'Alice', content: 'Welcome to our college. The attendance policy is from the stone age.' },
    { user: 'Bob', content: 'Has anyone filled the elective preference form yet? Deadline is tomorrow!' },
    { user: 'Charlie', content: 'I chose ML, Cloud Computing, and IoT. What are you guys picking?' },
    { user: 'TempUser', content: 'Whatever has the easiest grading. Which one is it?' },
    { user: 'Alice', content: 'Blockchain with Prof. Mehta. She literally gives everyone A.' },
    { user: 'Bob', content: 'That class is boring though. Two hours of reading slides.' },
    { user: 'Charlie', content: 'A is an A. I\'ll sleep through it happily.' },
    { user: 'TempUser', content: 'The academic calendar shows we have a holiday next Wednesday. Can anyone confirm?' },
    { user: 'Alice', content: 'Confirmed! It\'s for the university foundation day.' },
    { user: 'Bob', content: 'Perfect timing. Right before the lab submission deadline.' },
    { user: 'Charlie', content: 'Don\'t forget to fill the course feedback forms. They actually read them this year.' },
    { user: 'TempUser', content: 'I wrote an essay about the microphone issues in Hall 3. Hope they fix it.' },
  ],
  clubs: [
    { user: 'Alice', content: 'Robotics Club meeting tomorrow at 5 PM in Lab 204. Bringing the new Arduino kits!' },
    { user: 'Bob', content: 'Awesome! Are we finally building that line-following bot?' },
    { user: 'Charlie', content: 'I ordered the IR sensors from Amazon. They should arrive by tomorrow.' },
    { user: 'TempUser', content: 'Can freshers join? I\'ve always wanted to learn robotics.' },
    { user: 'Alice', content: 'Absolutely! We welcome all skill levels. We\'ll teach you from scratch.' },
    { user: 'Bob', content: 'The coding club hackathon registrations are open. Team of 4, 24 hours, free food.' },
    { user: 'Charlie', content: 'Anyone need a team? I do frontend and a bit of ML.' },
    { user: 'TempUser', content: 'I\'m in! I can handle the backend. Let\'s dominate.' },
    { user: 'Alice', content: 'Debate Society is doing inter-college prep. Topic: "AI will replace programmers".' },
    { user: 'Bob', content: 'That topic is spicy 🌶️ I want to argue FOR it just to see reactions.' },
    { user: 'Charlie', content: 'The drama club skit for cultural week was hilarious. Props to the writers!' },
    { user: 'TempUser', content: 'The photography club is doing a campus photo walk this Saturday. 7 AM at the main gate.' },
    { user: 'Alice', content: '7 AM on a Saturday? You\'re brave assuming I\'ll be awake.' },
    { user: 'Bob', content: 'The golden hour shots from last time were stunning. I\'ll be there!' },
  ],
  memes: [
    { user: 'Bob', content: 'When the prof says "this won\'t come in the exam" and it\'s the first question 💀' },
    { user: 'Alice', content: 'POV: You open your laptop in class and forgot to close all 47 Chrome tabs' },
    { user: 'Charlie', content: 'The mess food today looked like it was rendering in 144p' },
    { user: 'TempUser', content: 'My roommate sets 15 alarms and still misses the 8 AM lecture' },
    { user: 'Bob', content: 'WiFi in the hostel vs WiFi in the admin building. Two different universes.' },
    { user: 'Alice', content: '"Group project" means one person does everything while others "provide moral support"' },
    { user: 'Charlie', content: 'That one guy who asks doubts 2 minutes before the lecture ends. WHY.' },
    { user: 'TempUser', content: 'The library during exam week is basically a refugee camp with WiFi' },
    { user: 'Bob', content: 'Average study plan: "I\'ll start tomorrow" (repeated daily for 3 weeks)' },
    { user: 'Alice', content: 'When someone asks "Did you study?" and you panic-lie "Yeah a little bit"' },
    { user: 'Charlie', content: 'The difference between syllabus and what actually comes in the exam is astronomical' },
    { user: 'TempUser', content: 'Campus food tier list: S tier - canteen maggi, F tier - everything else' },
    { user: 'Bob', content: 'When the attendance machine doesn\'t register your fingerprint for the 5th time 😤' },
    { user: 'Alice', content: 'Submitting assignments at 11:59 PM should be an Olympic sport' },
    { user: 'Charlie', content: 'The hostel washing machine works on vibes. Sometimes it washes, sometimes it just holds your clothes hostage.' },
    { user: 'TempUser', content: '"Can you share your screen?" Speedrun to close Discord and WhatsApp Web.' },
    { user: 'Bob', content: 'Prof: "Any questions?" The silent 2 seconds that feel like 2 hours.' },
    { user: 'Alice', content: 'When the canteen runs out of cold coffee at 2 PM. The betrayal.' },
  ],
  sports: [
    { user: 'TempUser', content: 'Cricket match at 4 PM today! Ground 2. Need 3 more players.' },
    { user: 'Bob', content: 'I\'m in! Batting or bowling needed?' },
    { user: 'Charlie', content: 'Both honestly. We have 8 players and two of them "only field".' },
    { user: 'Alice', content: 'I\'ll come watch and keep score! 📋' },
    { user: 'TempUser', content: 'Deal! Last time nobody kept score and we argued for 20 minutes about who won.' },
    { user: 'Bob', content: 'The football inter-hostel tournament bracket is out. We play Hostel 5 first round.' },
    { user: 'Charlie', content: 'Hostel 5 has that guy who played district level. We\'re cooked.' },
    { user: 'Alice', content: 'Practice sessions are happening every evening 6-7 PM. Please actually show up this time.' },
    { user: 'TempUser', content: 'The gym is finally getting new dumbbells! The old ones were literally held together by hope.' },
    { user: 'Bob', content: 'About time. I\'ve been going to the off-campus gym because ours was so bad.' },
    { user: 'Charlie', content: 'Anyone want to go for a morning jog? 6 AM at the track?' },
    { user: 'Alice', content: 'LOL 6 AM. I appreciate the energy but no.' },
    { user: 'TempUser', content: 'Badminton courts are free after 8 PM. Anyone down for doubles?' },
    { user: 'Bob', content: 'Always! I\'ll bring the shuttlecocks. The sports room ones are ancient.' },
    { user: 'Charlie', content: 'Fun fact: our college\'s table tennis team is actually ranked top 5 in the state.' },
    { user: 'Alice', content: 'Seriously? That\'s cool! Where do they practice?' },
  ],
  music: [
    { user: 'Alice', content: 'Just discovered this indie artist called Prateek Kuhad. His songs are so good! 🎵' },
    { user: 'Bob', content: 'Cold/Mess is a masterpiece. Also check out The Local Train if you love Hindi indie.' },
    { user: 'Charlie', content: 'Bro The Local Train\'s Aaoge Tum Kabhi literally makes me emotional every time.' },
    { user: 'TempUser', content: 'Anyone listen to Lo-fi while studying? Drop your favorite playlist!' },
    { user: 'Alice', content: 'ChilledCow on YouTube is the classic. Also try "Jazz Vibes" on Spotify.' },
    { user: 'Bob', content: 'I made a collaborative Spotify playlist for our campus. Link in the room description!' },
    { user: 'Charlie', content: 'Added some classic rock. Can\'t have a playlist without Pink Floyd.' },
    { user: 'TempUser', content: 'The campus band is performing at the cultural fest! They\'re actually really good.' },
    { user: 'Alice', content: 'Their cover of "Tum Ho" was incredible at the last open mic.' },
    { user: 'Bob', content: 'Anyone want to jam this weekend? I play guitar, need a vocalist and drummer.' },
    { user: 'Charlie', content: 'I can do vocals! Let\'s book the music room for Saturday afternoon.' },
    { user: 'TempUser', content: 'I\'ve been learning ukulele for 2 weeks. Can I come hang out and listen at least?' },
    { user: 'Alice', content: 'Of course! Music room is open to everyone.' },
    { user: 'Bob', content: 'Fun fact: the music room has a keyboard that nobody uses. It\'s actually really nice.' },
    { user: 'Charlie', content: 'AP Dhillon\'s new album dropped. Thoughts?' },
    { user: 'TempUser', content: 'Mid. His old stuff was way better. Brown Munde era was peak.' },
  ],
  'mental-health': [
    { user: 'Anonymous', content: 'Feeling really overwhelmed with assignments and personal stuff. Needed somewhere to vent.' },
    { user: 'Anonymous', content: 'You\'re not alone. This semester has been brutal for everyone. 💜' },
    { user: 'Anonymous', content: 'The college counseling center is actually helpful. Free sessions for students.' },
    { user: 'Anonymous', content: 'I booked a session last week. No judgment, completely confidential. Highly recommend.' },
    { user: 'Anonymous', content: 'For anyone struggling with sleep: the 4-7-8 breathing technique actually works.' },
    { user: 'Anonymous', content: 'Some days are harder than others. Remember it\'s okay to take a break.' },
    { user: 'Anonymous', content: 'Started journaling recently and it\'s made such a difference in managing anxiety.' },
    { user: 'Anonymous', content: 'The peer support group meets every Wednesday in Block C. No pressure to share, you can just listen.' },
    { user: 'Anonymous', content: 'If you\'re feeling isolated, know that reaching out like this takes courage. You matter.' },
    { user: 'Anonymous', content: 'I found that limiting social media to 30 min/day helped my mental health so much.' },
    { user: 'Anonymous', content: 'The campus yoga sessions at 7 AM are surprisingly calming. Give it a try!' },
    { user: 'Anonymous', content: 'It\'s okay to not be okay. But it\'s not okay to suffer in silence. Talk to someone. 🤗' },
  ],
  marketplace: [
    { user: 'Alice', content: 'Selling my Data Structures textbook (Cormen). Good condition. ₹350.' },
    { user: 'Bob', content: 'I\'ll take it! Can we meet at the canteen tomorrow?' },
    { user: 'Charlie', content: 'Does anyone have a second-hand scientific calculator? Need it for the exam.' },
    { user: 'TempUser', content: 'I have a Casio FX-991EX. Barely used. ₹800 (original was ₹1500).' },
    { user: 'Alice', content: 'Looking for a laptop stand. Anyone upgrading and selling their old one?' },
    { user: 'Bob', content: 'Check the notice board near the canteen. Someone posted about selling desk accessories.' },
    { user: 'Charlie', content: 'Selling PS5 controller (barely used). ₹3500. DM if interested.' },
    { user: 'TempUser', content: 'Anyone selling a cycle? Prefer geared, budget ₹3000-5000.' },
    { user: 'Alice', content: 'The guy in Room 405, Hostel 2 was selling a Firefox. I think it\'s around ₹4000.' },
    { user: 'Bob', content: 'Pro tip: check OLX but filter by our pin code. Lots of graduating seniors sell stuff cheap.' },
    { user: 'Charlie', content: 'Free items: 3 lab coats (L size), 2 drawing boards. Collect from B-Block entrance.' },
    { user: 'TempUser', content: 'You\'re a legend! I needed a drawing board for the graphics lab.' },
  ],
  events: [
    { user: 'Alice', content: 'Hackathon registration closes tomorrow! Teams of 2-4. Theme: Sustainable Tech 🌱' },
    { user: 'Bob', content: 'I already registered with my team. What are you guys building?' },
    { user: 'Charlie', content: 'We\'re thinking of a carbon footprint tracker. Simple but impactful.' },
    { user: 'TempUser', content: 'The cultural fest lineup is AMAZING this year. Stand-up, music, dance battles!' },
    { user: 'Alice', content: 'Who\'s doing stand-up? If it\'s that alumni Ananya, I\'m definitely going.' },
    { user: 'Bob', content: 'TEDx campus is happening next month. Speaker applications are open!' },
    { user: 'Charlie', content: 'I submitted a talk on "Imposter Syndrome in Tech". Hope I get selected.' },
    { user: 'TempUser', content: 'National coding competition on HackerRank this weekend. Prize pool is ₹50k!' },
    { user: 'Alice', content: 'The quiz club is organizing a Marvel vs DC trivia night. Losers buy chai for winners.' },
    { user: 'Bob', content: 'Marvel obviously wins. DC fans are delusional (fight me).' },
    { user: 'Charlie', content: 'Workshop alert: Google Developer Student Club is hosting a Flutter bootcamp. Free!' },
    { user: 'TempUser', content: 'Last GDSC event was packed. Register early or you won\'t get a seat.' },
    { user: 'Alice', content: 'Photography exhibition in the art gallery this weekend. Some really talented photographers in our batch.' },
    { user: 'Bob', content: 'The alumni meetup is scheduled for March 15. Good networking opportunity!' },
  ],
  careers: [
    { user: 'Alice', content: 'Google internship applications are open! Deadline is March 30.' },
    { user: 'Bob', content: 'The coding challenge part is doable if you\'ve practiced LeetCode mediums.' },
    { user: 'Charlie', content: 'Has anyone interviewed at Microsoft? What\'s the process like?' },
    { user: 'TempUser', content: 'MS interview: 2 coding rounds, 1 system design, 1 behavioral. Prepare for all.' },
    { user: 'Alice', content: 'The placement cell shared a list of companies visiting this semester. It\'s pinned in the department group.' },
    { user: 'Bob', content: 'Infosys, TCS, Wipro for mass recruiting. Amazon and Google for top performers.' },
    { user: 'Charlie', content: 'Don\'t sleep on startups. The pay is competitive and the work is way more interesting.' },
    { user: 'TempUser', content: 'Resume tip: quantify your achievements. "Led a team of 4" > "worked in a team".' },
    { user: 'Alice', content: 'The TPO office is doing free resume reviews this week. Slot booking on the portal.' },
    { user: 'Bob', content: 'Anyone else anxious about placements? Feel like I haven\'t prepared enough.' },
    { user: 'Charlie', content: 'Same boat. But let\'s study together instead of panicking alone. Library at 6?' },
    { user: 'TempUser', content: 'LinkedIn optimization matters more than people think. Update your headline and skills!' },
    { user: 'Alice', content: 'The Stripe internship is remote and pays really well. Check their careers page.' },
    { user: 'Bob', content: 'Pro tip: reach out to alumni on LinkedIn. Most are happy to refer if you ask nicely.' },
    { user: 'Charlie', content: 'Our senior Priya got into Amazon with 10 LPA. She shared her prep strategy in the placement channel.' },
    { user: 'TempUser', content: 'Mock interviews are so underrated. Practice with friends even if it feels awkward.' },
  ],
};

// Additional generic conversations that can be applied to any room
const genericConversations = [
  { user: 'Alice', content: 'Hello everyone! Just joined this room. Looks interesting!' },
  { user: 'Bob', content: 'Welcome! We have some great discussions here.' },
  { user: 'Charlie', content: 'The more the merrier! Feel free to share anything.' },
  { user: 'TempUser', content: 'This is one of the most active rooms on campus. Love it!' },
  { user: 'Alice', content: 'Anyone else procrastinating on their assignments right now? 😅' },
  { user: 'Bob', content: 'Always. But at least we\'re procrastinating together.' },
  { user: 'Charlie', content: 'The campus looks so nice in the evening. Just came back from a walk.' },
  { user: 'TempUser', content: 'Wish the weather stays like this. Perfect campus vibes.' },
];

async function seedConversations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    // Get all users to use as message senders
    const users = await User.find({}).lean();
    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      process.exit(1);
    }

    // Create a map of user names to user documents
    const userMap = {};
    users.forEach(u => {
      userMap[u.alias] = u;
    });

    // Get a default user for messages from unknown users
    const defaultUser = users[0];

    // Get all rooms
    const rooms = await Room.find({}).lean();
    console.log(`Found ${rooms.length} rooms.\n`);

    let totalMessagesAdded = 0;
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 7); // Start messages from 7 days ago

    for (const room of rooms) {
      const category = room.category || 'social';
      const categoryConvos = conversationsByCategory[category] || [];
      
      // Combine category-specific and some generic messages
      const allConvos = [...categoryConvos, ...genericConversations.slice(0, 4)];
      
      if (allConvos.length === 0) {
        console.log(`  Skipping room "${room.name}" (no conversations for category "${category}")`);
        continue;
      }

      // Check existing message count
      const existingCount = await Message.countDocuments({ room: room._id });
      
      // Only add if room has fewer than 30 messages
      if (existingCount >= 30) {
        console.log(`  Room "${room.name}" already has ${existingCount} messages. Skipping.`);
        continue;
      }

      console.log(`  Seeding ${allConvos.length} messages to "${room.name}" (category: ${category})...`);
      
      const messageDocs = [];
      for (let i = 0; i < allConvos.length; i++) {
        const convo = allConvos[i];
        
        // Find a matching user or use default
        let sender = userMap[convo.user] || Object.values(userMap)[i % users.length] || defaultUser;
        
        // Calculate timestamp spread across multiple days
        const msgDate = new Date(baseDate.getTime());
        msgDate.setHours(msgDate.getHours() + (i * 4)); // Space messages ~4 hours apart
        msgDate.setMinutes(Math.floor(Math.random() * 60));

        messageDocs.push({
          room: room._id,
          userId: sender._id,
          userName: sender.alias || convo.user,
          userAvatar: sender.avatar || '',
          content: convo.content,
          type: 'text',
          createdAt: msgDate,
          updatedAt: msgDate,
        });
      }

      if (messageDocs.length > 0) {
        await Message.insertMany(messageDocs);
        totalMessagesAdded += messageDocs.length;
        
        // Update room's updatedAt
        await Room.findByIdAndUpdate(room._id, { updatedAt: new Date() });
      }
    }

    console.log(`\n✅ Done! Added ${totalMessagesAdded} messages across all rooms.`);

    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedConversations();
