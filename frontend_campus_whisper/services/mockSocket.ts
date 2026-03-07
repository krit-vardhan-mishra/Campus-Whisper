
// This service simulates a WebSocket client connecting to a backend.
// In a production environment, this would use the native WebSocket API or Socket.io-client.

type Listener = (data: any) => void;

class MockSocketService {
  private listeners: Record<string, Listener[]> = {};
  private isConnected: boolean = false;

  connect() {
    if (this.isConnected) return;
    this.isConnected = true;
    console.log('[WebSocket] Connected to secure channel');
    
    // Simulate keep-alive / ping
    setInterval(() => {
      // Keep connection alive logic
    }, 30000);
  }

  disconnect() {
    this.isConnected = false;
    console.log('[WebSocket] Disconnected');
  }

  on(event: string, callback: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, payload: any) {
    console.log(`[WebSocket] Emitting ${event}:`, payload);
    
    // Simulate server response latency and behavior
    if (event === 'send_message') {
      // In a real backend (MongoDB), this would save to DB then broadcast
      setTimeout(() => {
        // Simulate a random "reply" or reaction from another user occasionally
        if (Math.random() > 0.7) {
            this.trigger('receive_message', {
                id: Date.now() + 1,
                user: 'Neon_Badger',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                initials: 'NB',
                avatarColor: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20',
                content: "I totally agree with that!",
                isMe: false
            });
        }
      }, 2000);
    }
  }

  // Internal helper to trigger events as if they came from the server
  private trigger(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

export const socketService = new MockSocketService();
