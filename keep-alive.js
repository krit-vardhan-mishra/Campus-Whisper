/**
 * keep-alive.js
 * ─────────────
 * Pings the deployed URL every 14 minutes to prevent the free-tier
 * server (e.g. Render) from spinning down due to inactivity.
 *
 * Usage:
 *   DEPLOY_URL=https://your-app.onrender.com node keep-alive.js
 */

const PING_URL = `${process.env.DEPLOY_URL || 'https://campus-whisper.onrender.com'}/api/health`.replace(/([^:]\/)\/+/g, "$1");
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

class ExternalKeepAlive {
  constructor(url = PING_URL) {
    this.url = url;
    this.isRunning = false;
    this.intervalId = null;
    this.consecutiveFailures = 0;
    this.maxFailures = 5;
  }

  async ping() {
    try {
      const response = await fetch(this.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'External-KeepAlive-Service/1.0'
        },
        timeout: 30000
      });

      if (response.ok) {
        // Try parsing JSON if possible, else read as text
        let data = null;
        try {
          data = await response.json();
        } catch (e) {
          data = await response.text();
        }

        console.log(`✅ Ping successful at ${new Date().toISOString()}`);
        if (data && data.uptime) {
           console.log(`Server uptime: ${Math.floor(data.uptime)} seconds`);
        }
        this.consecutiveFailures = 0;
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.consecutiveFailures++;
      console.error(`❌ Ping failed (${this.consecutiveFailures}/${this.maxFailures}):`, error.message);
      
      if (this.consecutiveFailures >= this.maxFailures) {
        console.error('🚨 Max consecutive failures reached. Stopping keep-alive service.');
        this.stop();
      }
      return false;
    }
  }

  start() {
    if (this.isRunning) {
      console.log('Keep-alive service is already running');
      return;
    }

    console.log(`🚀 Starting keep-alive service for ${this.url}`);
    console.log(`📅 Ping interval: ${PING_INTERVAL / 60000} minutes`);
    
    this.isRunning = true;
    
    this.ping();
    
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.ping();
      }
    }, PING_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Keep-alive service stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      url: this.url,
      consecutiveFailures: this.consecutiveFailures,
      maxFailures: this.maxFailures
    };
  }
}

if (require.main === module) {
  const keepAlive = new ExternalKeepAlive();
  
  process.on('SIGINT', () => {
    console.log('\n🔄 Gracefully shutting down...');
    keepAlive.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🔄 Received SIGTERM, shutting down...');
    keepAlive.stop();
    process.exit(0);
  });

  keepAlive.start();
}

module.exports = ExternalKeepAlive;
