const rateLimit = require('express-rate-limit');

// API Auth Rate Limiter (Brute-force protection for login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

// General API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 200 API requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down.'
  }
});

// In-Memory Socket Rate Limiter (Token Bucket / Sliding Window)
const socketRateLimits = new Map(); // socketId -> array of timestamps

function socketRateLimiter(socket, maxMessages = 10, windowMs = 3000) {
  const now = Date.now();
  const timestamps = socketRateLimits.get(socket.id) || [];

  // Remove timestamps outside window
  const validTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  if (validTimestamps.length >= maxMessages) {
    socketRateLimits.set(socket.id, validTimestamps);
    return false; // Rate limit exceeded
  }

  validTimestamps.push(now);
  socketRateLimits.set(socket.id, validTimestamps);
  return true; // Allowed
}

function cleanSocketRateLimit(socketId) {
  socketRateLimits.delete(socketId);
}

module.exports = {
  authLimiter,
  apiLimiter,
  socketRateLimiter,
  cleanSocketRateLimit
};
