require('dotenv').config();
const dns = require('dns');
// Force Google DNS to bypass local network DNS issues with MongoDB SRV lookup
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const os = require('os');
const ExternalKeepAlive = require('../keep-alive');
// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const setupSocket = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Campus Whisper Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ---------- Serve frontend build in production ----------
const frontendDist = path.join(__dirname, 'public');
app.use(express.static(frontendDist));

// SPA fallback: any non-API route serves index.html
app.get(/^\/(?!api\/).*/, (req, res) => {
  const indexPath = path.join(frontendDist, 'index.html');
  // Only serve the fallback if the build exists
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Frontend build not found. Run npm run build first.' });
    }
  });
});

// Socket.IO setup
setupSocket(io);

// Helper: get all LAN IPv4 addresses for this machine
function getLanAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ name, address: iface.address });
      }
    }
  }
  return addresses;
}

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5002;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Create a .env file (see .env.example).');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('✅ MongoDB connected');
    // Listen on 0.0.0.0 so the backend is reachable from other devices on the network
    server.listen(PORT, '0.0.0.0', () => {
      const lanAddresses = getLanAddresses();
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║          🚀  Campus Whisper Backend Running             ║');
      console.log('╠══════════════════════════════════════════════════════════╣');
      console.log(`║  Local:     http://localhost:${PORT}                     ║`);
      if (lanAddresses.length > 0) {
        lanAddresses.forEach(({ name, address }) => {
          const url = `http://${address}:${PORT}`;
          console.log(`║  Network:   ${url.padEnd(42)} ║`);
        });
        console.log('╠══════════════════════════════════════════════════════════╣');
        console.log('║  📱 OTHER DEVICES: Open the Network URL in the browser  ║');
        console.log('║     to access the frontend. Both REST API and           ║');
        console.log('║     Socket.IO (typing, instant messaging) will work.    ║');
      }
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log('');
      
      // Start the keep-alive service to prevent Render sleep
      const keepAlive = new ExternalKeepAlive('https://campus-whisper.onrender.com/api/health');
      keepAlive.start();
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
