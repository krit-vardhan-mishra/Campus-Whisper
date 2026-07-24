require('dotenv').config();
const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

const SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:5002';
const CONCURRENT_CLIENTS = parseInt(process.env.CONCURRENT_CLIENTS || '10', 10);
const MESSAGES_PER_CLIENT = parseInt(process.env.MESSAGES_PER_CLIENT || '5', 10);
const TEST_ROOM = '65f000000000000000000001';
const JWT_SECRET = process.env.JWT_SECRET || 'campus_whisper_jwt_secret_2024';

console.log('🧪 Starting Campus Whisper Load Test Engine...');
console.log(`🎯 Server: ${SERVER_URL}`);
console.log(`👥 Concurrent Virtual Clients: ${CONCURRENT_CLIENTS}`);
console.log(`💬 Messages per Client: ${MESSAGES_PER_CLIENT}`);
console.log(`📊 Target Total Messages: ${CONCURRENT_CLIENTS * MESSAGES_PER_CLIENT}`);
console.log('--------------------------------------------------');

let connectedClients = 0;
let ackReceivedCount = 0;
let broadcastReceivedCount = 0;
let errorCount = 0;
const latencies = [];

const startTime = Date.now();

async function runTest() {
  const sockets = [];

  for (let i = 0; i < CONCURRENT_CLIENTS; i++) {
    const token = jwt.sign(
      { id: `65f00000000000000000${(100 + i).toString()}`, alias: `Bot_${i}` },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const socket = io(SERVER_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false
    });

    sockets.push(socket);

    socket.on('connect', () => {
      connectedClients++;
      socket.emit('join_room', TEST_ROOM);

      if (connectedClients === CONCURRENT_CLIENTS) {
        console.log(`✅ All ${CONCURRENT_CLIENTS} virtual clients connected! Commencing message burst...`);
        startBurst(sockets);
      }
    });

    socket.on('receive_message', (msg) => {
      broadcastReceivedCount++;
    });

    socket.on('connect_error', (err) => {
      console.error(`Socket connection error for client ${i}:`, err.message);
      errorCount++;
    });
  }
}

function startBurst(sockets) {
  const burstStart = Date.now();

  sockets.forEach((socket, clientIdx) => {
    let sent = 0;
    const interval = setInterval(() => {
      if (sent >= MESSAGES_PER_CLIENT) {
        clearInterval(interval);
        return;
      }

      const msgStart = Date.now();
      const tempId = `load_${clientIdx}_${sent}`;

      socket.emit(
        'send_message',
        {
          content: `High-concurrency benchmark message #${sent + 1} from Bot_${clientIdx}`,
          roomId: TEST_ROOM,
          clientTempId: tempId
        },
        (ack) => {
          if (ack && ack.status === 'ok') {
            ackReceivedCount++;
            latencies.push(Date.now() - msgStart);
          } else {
            errorCount++;
          }

          if (ackReceivedCount + errorCount >= CONCURRENT_CLIENTS * MESSAGES_PER_CLIENT) {
            printReport(burstStart);
            sockets.forEach(s => s.disconnect());
            process.exit(0);
          }
        }
      );

      sent++;
    }, 100); // Send message every 100ms per client to respect rate limiters
  });
}

function printReport(burstStart) {
  const totalDurationSec = (Date.now() - burstStart) / 1000;
  const avgLatency = latencies.length > 0 ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2) : 0;
  const throughput = (ackReceivedCount / totalDurationSec).toFixed(2);

  console.log('\n==================================================');
  console.log('🚀 LOAD TEST BENCHMARK RESULTS');
  console.log('==================================================');
  console.log(`Total Time:                ${totalDurationSec.toFixed(2)} seconds`);
  console.log(`Successful ACKs:           ${ackReceivedCount}`);
  console.log(`Broadcasts Received:       ${broadcastReceivedCount}`);
  console.log(`Errors / Dropped:          ${errorCount}`);
  console.log(`Average Latency:           ${avgLatency} ms`);
  console.log(`Sustained Throughput:      ${throughput} msg/sec`);
  console.log('==================================================\n');
}

runTest();
