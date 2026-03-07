/**
 * keep-alive.js
 * ─────────────
 * Pings the deployed URL every 14 minutes to prevent the free-tier
 * server (e.g. Render) from spinning down due to inactivity.
 *
 * Usage:
 *   DEPLOY_URL=https://your-app.onrender.com node keep-alive.js
 *
 * Or set the URL directly below.
 */

const https = require('https');
const http = require('http');

const DEPLOY_URL = process.env.DEPLOY_URL || 'https://your-app.onrender.com';
const INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

function ping() {
  const url = `${DEPLOY_URL}/api/health`;
  const client = url.startsWith('https') ? https : http;

  client
    .get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        console.log(
          `[${new Date().toISOString()}] Ping ${url} → ${res.statusCode}`
        );
      });
    })
    .on('error', (err) => {
      console.error(
        `[${new Date().toISOString()}] Ping failed: ${err.message}`
      );
    });
}

console.log(`Keep-alive started. Pinging ${DEPLOY_URL} every ${INTERVAL_MS / 60000} min.`);
ping(); // initial ping
setInterval(ping, INTERVAL_MS);
