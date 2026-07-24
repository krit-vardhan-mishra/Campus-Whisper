const Redis = require('ioredis');

let pubClient = null;
let subClient = null;
let redisClient = null;
let isRedisConnected = false;

const REDIS_URL = process.env.REDIS_URL || process.env.REDIS_TLS_URL || 'redis://127.0.0.1:6379';

function initRedis() {
  try {
    const options = {
      retryStrategy: (times) => {
        if (times > 2) {
          return null; // Stop retrying, use fallback mode
        }
        return 500;
      },
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: false
    };

    redisClient = new Redis(REDIS_URL, options);
    pubClient = new Redis(REDIS_URL, options);
    subClient = pubClient.duplicate();

    // Attach error handlers to all clients to suppress unhandled error event log spam in fallback mode
    const silentErrHandler = () => {
      isRedisConnected = false;
    };

    redisClient.on('error', silentErrHandler);
    pubClient.on('error', silentErrHandler);
    subClient.on('error', silentErrHandler);

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('✅ Redis connected successfully (Presence & Queue layer active)');
    });
  } catch (err) {
    isRedisConnected = false;
  }
}

// Initialize Redis client attempt
initRedis();

// Presence Manager with fallback
const memoryPresence = new Map(); // roomId -> Set of userIds

const presenceManager = {
  async addRoomUser(roomId, userId) {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.sadd(`room:presence:${roomId}`, userId);
        return await redisClient.scard(`room:presence:${roomId}`);
      } catch (err) {
        // Fallback
      }
    }
    if (!memoryPresence.has(roomId)) {
      memoryPresence.set(roomId, new Set());
    }
    memoryPresence.get(roomId).add(userId);
    return memoryPresence.get(roomId).size;
  },

  async removeRoomUser(roomId, userId) {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.srem(`room:presence:${roomId}`, userId);
        return await redisClient.scard(`room:presence:${roomId}`);
      } catch (err) {
        // Fallback
      }
    }
    if (memoryPresence.has(roomId)) {
      memoryPresence.get(roomId).delete(userId);
      return memoryPresence.get(roomId).size;
    }
    return 0;
  },

  async getRoomOnlineCount(roomId) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.scard(`room:presence:${roomId}`);
      } catch (err) {
        // Fallback
      }
    }
    return memoryPresence.has(roomId) ? memoryPresence.get(roomId).size : 0;
  },

  async isUserOnline(userId) {
    if (isRedisConnected && redisClient) {
      try {
        return (await redisClient.get(`user:online:${userId}`)) === 'true';
      } catch (err) {
        // Fallback
      }
    }
    return false;
  },

  async setUserOnlineStatus(userId, status, ttl = 300) {
    if (isRedisConnected && redisClient) {
      try {
        if (status === 'online') {
          await redisClient.set(`user:online:${userId}`, 'true', 'EX', ttl);
        } else {
          await redisClient.del(`user:online:${userId}`);
        }
      } catch (err) {
        // Fallback
      }
    }
  }
};

module.exports = {
  get isConnected() { return isRedisConnected; },
  redisClient,
  pubClient,
  subClient,
  presenceManager,
  REDIS_URL
};
