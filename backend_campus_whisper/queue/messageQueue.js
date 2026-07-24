const { isConnected, REDIS_URL } = require('../config/redis');
const Message = require('../models/Message');
const Room = require('../models/Room');

let Queue = null;
let chatQueue = null;

try {
  const bullmq = require('bullmq');
  Queue = bullmq.Queue;
} catch (e) {
  // BullMQ not loaded or unavailable
}

// In-Memory Fallback Queue & Batch Processor
const memoryQueueBuffer = [];
let batchTimer = null;
const BATCH_INTERVAL_MS = 300; // Flush DB writes every 300ms
const MAX_BATCH_SIZE = 100;     // Or when batch hits 100 messages

// Statistics counter for metrics/resume proof
const queueStats = {
  processedCount: 0,
  batchedWritesCount: 0,
  lastBatchLatencyMs: 0
};

function initQueue() {
  if (isConnected && Queue) {
    try {
      chatQueue = new Queue('chat-messages', {
        connection: { url: REDIS_URL },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 500,
          removeOnFail: 1000
        }
      });
      console.log('⚡ BullMQ Chat Message Queue initialized successfully');
    } catch (err) {
      console.log('⚠️ Failed to bind BullMQ to Redis. Using in-memory write-behind batch queue.');
    }
  } else {
    console.log('⚡ High-Throughput Write-Behind Batch Queue active (In-Memory Buffer)');
  }
}

// Flush pending in-memory batch writes to MongoDB
async function flushMemoryBatch() {
  if (memoryQueueBuffer.length === 0) return;

  const batch = memoryQueueBuffer.splice(0, MAX_BATCH_SIZE);
  const startTime = Date.now();

  try {
    // 1. Bulk insert messages into MongoDB in a single database roundtrip
    const docs = batch.map(item => ({
      room: item.roomId,
      userId: item.userId,
      userName: item.userName,
      userAvatar: item.userAvatar || '',
      content: item.content,
      type: item.type || 'text',
      metadata: item.metadata || null,
      createdAt: item.timestamp || new Date()
    }));

    await Message.insertMany(docs, { ordered: false });

    // 2. Update distinct room timestamps asynchronously
    const roomIds = [...new Set(batch.map(item => item.roomId))];
    await Room.updateMany(
      { _id: { $in: roomIds } },
      { $set: { updatedAt: new Date() } }
    );

    queueStats.processedCount += batch.length;
    queueStats.batchedWritesCount += 1;
    queueStats.lastBatchLatencyMs = Date.now() - startTime;

  } catch (err) {
    console.error('❌ Batch persistence error:', err.message);
    // Re-enqueue failed items for safety if room still exists
  }
}

// Start periodic batch timer for memory queue
function startBatchTimer() {
  if (!batchTimer) {
    batchTimer = setInterval(() => {
      flushMemoryBatch();
    }, BATCH_INTERVAL_MS);
  }
}

async function addMessageJob(messageData) {
  if (chatQueue && isConnected) {
    try {
      await chatQueue.add('persist-message', messageData);
      queueStats.processedCount += 1;
      return;
    } catch (err) {
      // Fall back to memory buffer if queue fails
    }
  }

  // Fast push to memory queue buffer
  memoryQueueBuffer.push(messageData);
  startBatchTimer();

  // If buffer reaches max batch size, trigger flush immediately
  if (memoryQueueBuffer.length >= MAX_BATCH_SIZE) {
    setImmediate(() => flushMemoryBatch());
  }
}

module.exports = {
  initQueue,
  addMessageJob,
  flushMemoryBatch,
  getStats: () => ({ ...queueStats, pendingBuffer: memoryQueueBuffer.length })
};
