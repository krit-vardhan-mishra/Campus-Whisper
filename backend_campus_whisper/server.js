require('dotenv').config();
const dns = require('dns');

try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore
}

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const os = require('os');
const ExternalKeepAlive = require('../keep-alive');

// Import Scalability Modules
const { isConnected, pubClient, subClient } = require('./config/redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const { initQueue, getStats: getQueueStats } = require('./queue/messageQueue');
const { startWorker } = require('./workers/messageWorker');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const setupSocket = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS & Transport settings
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  maxHttpBufferSize: 1e6
});

// Configure Redis Adapter for Horizontal WebSocket Clustering if Redis is connected
if (isConnected && pubClient && subClient) {
  try {
    io.adapter(createAdapter(pubClient, subClient));
    console.log('🌐 Socket.IO Redis Adapter initialized (Multi-node Horizontal Scaling enabled)');
  } catch (e) {
    console.log('⚠️ Running Socket.IO in single-node mode');
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Apply Rate Limiters
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

// Health check & Real-Time Performance Telemetry Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Campus Whisper Scalable Engine',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    redisConnected: isConnected,
    queueStats: getQueueStats()
  });
});

app.get('/api/metrics', (req, res) => {
  res.json({
    system: {
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      cpuCores: os.cpus().length,
      loadAverage: os.loadavg()
    },
    performance: {
      socketConnections: io.sockets.sockets.size,
      queueStats: getQueueStats()
    }
  });
});

// Serve frontend build in production
const frontendDist = path.join(__dirname, 'public');
app.use(express.static(frontendDist));

// SPA fallback
app.get(/^\/(?!api\/).*/, (req, res) => {
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Frontend build not found. Run npm run build first.' });
    }
  });
});

// Setup WebSockets
setupSocket(io);

// Initialize Queue & Background Workers
initQueue();
startWorker();

const PORT = process.env.PORT || 5002;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in backend_campus_whisper/.env file.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 50
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully (Pool size: 50)');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Campus Whisper Scalable Backend running on http://localhost:${PORT}`);
      
      const keepAlive = new ExternalKeepAlive('https://campus-whisper.onrender.com/api/health');
      keepAlive.start();
    });
  })
  .catch((err) => {
    console.error('\n❌ MongoDB Connection Failed:', err.message);
    console.error('--------------------------------------------------');
    console.error('💡 Common causes and fixes:');
    console.error(' 1. IP Whitelist: If using MongoDB Atlas, make sure your current IP address (or 0.0.0.0/0) is whitelisted under Network Access in MongoDB Atlas dashboard.');
    console.error(' 2. Local MongoDB: Alternatively, update MONGODB_URI in backend_campus_whisper/.env to a local instance (e.g. mongodb://127.0.0.1:27017/campus_whisper)');
    console.error(' 3. Cluster Paused: Check if your free tier Atlas cluster is active or paused.\n');
    process.exit(1);
  });
