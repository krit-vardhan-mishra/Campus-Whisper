require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');

const MONGODB_URI = process.env.MONGODB_URI;

// Brand new unhinged conversations — fresh roast, campus frustration, savage energy
const conversationsByCategory = {
  tech: [
    { user: 'TempUser', content: 'Bhai college ka WiFi itna slow hai ki 4G dinosaur bhi has raha hoga' },
    { user: 'Alice', content: 'Mera code compile hone se pehle meri shaadi ho jaayegi' },
    { user: 'Bob', content: 'Error: Cannot find module \'chai\' ... bro chai toh canteen mein bhi nahi milti' },
    { user: 'Charlie', content: 'Prof bolta hai "simple hai" ... simple matlab 3 ghante Stack Overflow' },
    { user: 'TempUser', content: 'npm install karte karte mera laptop pregnant ho gaya node_modules se' },
    { user: 'Alice', content: 'TypeScript use kar raha hoon taaki future mein bhi mujhe gaali na pade' },
    { user: 'Bob', content: 'JavaScript single thread hai lekin meri zindagi multi-threaded depression' },
    { user: 'Charlie', content: 'Docker install karne mein 2 din lage... ab container mein hi jee raha hoon' },
    { user: 'TempUser', content: 'Git commit -m "pls work" ... 47 baar try kiya, ab toh ro raha hoon' },
    { user: 'Alice', content: 'Cyber security course padha rahe hain aur password 12345678 rakha hai 💀' },
    { user: 'Bob', content: 'AI se assignment karwa raha hoon... ab ChatGPT meri maa ban gaya' },
    { user: 'Charlie', content: 'VS Code crash ho gaya... ab mera pura semester crash ho gaya' },
  ],

  social: [
    { user: 'TempUser', content: 'Canteen mein paneer 120 rs... woh paneer nahi, regret hai bhai' },
    { user: 'Alice', content: 'Freshers party mein sirf Instagram reels banane waale log aaye the' },
    { user: 'Bob', content: 'Crush ko DM kiya "hey" ... 3 din se seen zone mein hu' },
    { user: 'Charlie', content: 'Hostel warden bolta hai "lights off" ... mera life off hai bhai' },
    { user: 'TempUser', content: 'Group project = 1 banda kaam, 4 bande reels banate hain' },
    { user: 'Alice', content: 'Mess food dekh ke lagta hai yeh veg hai ya punishment' },
    { user: 'Bob', content: 'Bhai ladkiyaan bolti hain "bhai" ... main bhi bol deta hoon "bhai" ab' },
    { user: 'Charlie', content: 'Placement season shuru... mera confidence season khatam' },
    { user: 'TempUser', content: 'Cigarette break pe seniors bolte hain "bhai treat de" ... bhai tu treat de' },
    { user: 'Alice', content: 'Campus romance = 2 din baat, 3 din ghost, 1 din block' },
    { user: 'Bob', content: 'Fest mein stall lagaaya tha... sirf free chai ke liye log aaye' },
  ],

  confessions: [
    { user: 'Anonymous', content: 'Main prof ko WhatsApp group mein hi gaali de deta hoon... galti se personal chat mein bhej diya tha' },
    { user: 'Anonymous', content: 'Exam hall mein cheat karte hue pakda gaya... TA ne bola "next time better luck" 😭' },
    { user: 'Anonymous', content: 'Mera crush mujhe bhai bolta hai... main usko didi bol deta hoon revenge ke liye' },
    { user: 'Anonymous', content: 'Assignment copy kiya aur professor ne dono ko same marks diye... ab guilt nahi, pride hai' },
    { user: 'Anonymous', content: 'Hostel mein raat 3 baje biryani kha raha tha... roommate bola "bhai smell mat karwa"' },
    { user: 'Anonymous', content: 'Placement prep nahi kar raha... bas LinkedIn pe motivational reels dekh raha hoon' },
    { user: 'Anonymous', content: 'Canteen aunty se extra samosa maanga... unhone bola "beta pet kharab ho jaayega" ... aunty mera future dekh rahi thi' },
    { user: 'Anonymous', content: 'Meri attendance 73% hai... 75% ke liye dua maang raha hoon' },
    { user: 'Anonymous', content: 'Back exam dene ja raha hoon... wahi shirt pehen ke jo fail hua tha pehle' },
    { user: 'Anonymous', content: 'Crush ke saath photo liya... ab uska face crop karke story daal raha hoon' },
    { user: 'Anonymous', content: 'Library mein book nahi padh raha... AC ke neeche sone jaata hoon' },
  ],

  gaming: [
    { user: 'TempUser', content: 'Valorant mein teammate afk... main 1v5 khel raha hoon aur phir bhi blame mujhpe' },
    { user: 'Bob', content: 'BGMI drop karte hi third party maar deta hai... zindagi jaisi feeling' },
    { user: 'Charlie', content: 'Free fire khel raha tha... 10 saal ka baccha bola "noob uninstall kar"' },
    { user: 'Alice', content: 'Genshin Impact pe 5000+ hours... ab regret nahi, pride hai' },
    { user: 'TempUser', content: 'Minecraft server banaya... pehla din hi creeper ne sab barbaad kar diya' },
    { user: 'Bob', content: 'COD mobile mein sniping kar raha tha... phone garam hoke shutdown ho gaya' },
    { user: 'Charlie', content: 'Among us mein impostor tha... sabko convince kiya main innocent hu... phir bhi mara gaya' },
    { user: 'TempUser', content: 'GTA V online mein random log mujhe maar rahe hain... yeh game nahi trauma hai' },
    { user: 'Alice', content: 'Chess.com pe 800 rating... ab toh quit karne ka mood hai' },
    { user: 'Bob', content: 'Ludo king mein snake eyes aa rahe hain... lagta hai meri ex online hai' },
  ],

  academic: [
    { user: 'TempUser', content: 'Prof bolta hai "attendance compulsory" ... main bolta hoon "degree compulsory nahi lag rahi"' },
    { user: 'Alice', content: 'Back paper dene ja raha hoon... wahi pen leke jo fail hua tha' },
    { user: 'Bob', content: 'CGPA 6.8... placement ke time 7 chahiye tha... life ne troll kar diya' },
    { user: 'Charlie', content: 'Lab record likhne mein 2 din lage... TA ne bola "sign nahi hai" aur reject kar diya' },
    { user: 'TempUser', content: 'Viva mein bola "I don\'t know" ... prof ne bola "good, honest answer" aur 0 number diye' },
    { user: 'Alice', content: 'Midterm mein MCQ tha... sab guess kiye... 12/30 aaye... talent hai bhai' },
    { user: 'Bob', content: 'Project submission last date extend hui... fir bhi kal raat 3 baje submit kiya' },
    { user: 'Charlie', content: 'Syllabus dekh ke lagta hai semester nahi jail hai' },
  ],

  clubs: [
    { user: 'TempUser', content: 'Dance club join kiya... ab tak sirf stretching hi seekha' },
    { user: 'Alice', content: 'Music club mein guitar bajaya... sab bole "bhai yeh toh torture hai"' },
    { user: 'Bob', content: 'Drama club mein role mila... villain ka... life imitating art' },
    { user: 'Charlie', content: 'Photography club trip pe gaya... battery khatam, memory card bhool gaya' },
    { user: 'TempUser', content: 'Coding club hackathon plan kar raha... idea sirf "Uber for autos"' },
    { user: 'Alice', content: 'Debate club mein bola "AI better than humans" ... sabne troll kiya' },
    { user: 'Bob', content: 'Eco club tree plant karne gaya... baarish mein bheeg ke wapas aaya' },
  ],

  study: [
    { user: 'TempUser', content: 'Pomodoro kar raha tha... 25 min study, 2 ghante YouTube shorts' },
    { user: 'Alice', content: 'Notes banane baitha... ab tak sirf title likha hai' },
    { user: 'Bob', content: 'Group study = group bakchodi + zero study' },
    { user: 'Charlie', content: 'Exam se pehle 3 chapter... ab sirf 3 page padh paaya' },
    { user: 'TempUser', content: 'Library mein AC ke neeche sone ka plan tha... security ne utha diya' },
    { user: 'Alice', content: 'Flashcards banaye... ab unko flashcards ki tarah use kar raha hoon' },
  ],

  marketplace: [
    { user: 'TempUser', content: 'Second hand hoodie bech raha hoon... 300 rs... bohot pyar se pehna hai' },
    { user: 'Alice', content: 'Selling old textbooks... pages missing, notes bhi galat, phir bhi 200 rs' },
    { user: 'Bob', content: 'Cycle bech raha hoon... brake nahi hai, bell bhi nahi, lekin chal jaati hai' },
    { user: 'Charlie', content: 'Roommate chahiye... rent 4k, but main raat bhar game khelta hoon' },
    { user: 'TempUser', content: 'Earphones 200 rs... left side dead hai, right side mast' },
  ],

  events: [
    { user: 'TempUser', content: 'Tech fest mein stall lagaaya... sirf free stickers ke liye log aaye' },
    { user: 'Alice', content: 'Cultural night mein dance performance... stage pe gir gaya tha' },
    { user: 'Bob', content: 'Hackathon mein 36 ghante code kiya... phir server crash ho gaya' },
    { user: 'Charlie', content: 'Freshers party mein entry fee 300... andar sirf thumbs up mila' },
  ],

  careers: [
    { user: 'TempUser', content: 'Resume bheja... reply aaya "we have received 847 applications"' },
    { user: 'Alice', content: 'Internship interview mein nervous tha... bola "I love debugging" ... fir reject' },
    { user: 'Bob', content: 'LinkedIn pe 500 connections... sab ghosting kar rahe hain' },
    { user: 'Charlie', content: 'Placement training mein bola "be confident" ... confidence khatam ho gaya' },
  ],
};

// Generic savage messages for any room
const genericConversations = [
  { user: 'TempUser', content: 'Bhai yeh campus nahi asylum hai' },
  { user: 'Alice', content: 'Attendance 75% chahiye... meri life 0% chal rahi hai' },
  { user: 'Bob', content: 'Mess khana kha ke lagta hai main sacrifice ho raha hoon' },
  { user: 'Charlie', content: 'Exam se pehle dua maang raha hoon... miracle chahiye' },
  { user: 'TempUser', content: 'Hostel warden bolta hai "rules follow karo" ... rules ne mujhe follow kar liya' },
];

async function seedConversations() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!\n');

    const users = await User.find({}).lean();
    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      process.exit(1);
    }

    const userMap = {};
    users.forEach(u => {
      userMap[u.alias] = u;
    });

    const defaultUser = users[0];

    const rooms = await Room.find({}).lean();
    console.log(`Found ${rooms.length} rooms.\n`);

    let totalMessagesAdded = 0;
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 10); // Start from 10 days ago for fresh feel

    for (const room of rooms) {
      const category = room.category || 'social';
      const categoryConvos = conversationsByCategory[category] || [];

      const allConvos = [...categoryConvos, ...genericConversations.slice(0, 5)];

      if (allConvos.length === 0) continue;
      console.log(`  Seeding ${allConvos.length} savage messages to "${room.name}" (${category})...`);

      const messageDocs = [];
      for (let i = 0; i < allConvos.length; i++) {
        const convo = allConvos[i];

        let sender = userMap[convo.user] || Object.values(userMap)[i % users.length] || defaultUser;

        const msgDate = new Date(baseDate.getTime());
        msgDate.setHours(msgDate.getHours() + (i * 5) + Math.floor(Math.random() * 4));
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
        await Room.findByIdAndUpdate(room._id, { updatedAt: new Date() });
      }
    }

    console.log(`\nDone! Added ${totalMessagesAdded} fresh unhinged messages.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedConversations();