const { isConnected, REDIS_URL } = require('../config/redis');
const Message = require('../models/Message');
const Room = require('../models/Room');

let Worker = null;
let messageWorker = null;

try {
  const bullmq = require('bullmq');
  Worker = bullmq.Worker;
} catch (e) {
  // Worker library load fallback
}

function startWorker() {
  if (isConnected && Worker) {
    try {
      messageWorker = new Worker(
        'chat-messages',
        async (job) => {
          const { roomId, userId, userName, userAvatar, content, type, metadata, timestamp } = job.data;
          
          // Bulk or single document insert
          await Message.create({
            room: roomId,
            userId,
            userName,
            userAvatar: userAvatar || '',
            content,
            type: type || 'text',
            metadata: metadata || null,
            createdAt: timestamp || new Date()
          });

          await Room.findByIdAndUpdate(roomId, { updatedAt: new Date() });
        },
        {
          connection: { url: REDIS_URL },
          concurrency: 10 // Handle 10 concurrent worker tasks
        }
      );

      messageWorker.on('completed', (job) => {
        // Job completed
      });

      messageWorker.on('failed', (job, err) => {
        console.error(`❌ Job ${job.id} failed:`, err.message);
      });

      console.log('👷 Background Message Worker Service started (10 worker concurrency)');
    } catch (err) {
      console.log('⚠️ Could not start BullMQ worker. Using in-memory batch write worker.');
    }
  }
}

module.exports = { startWorker };
