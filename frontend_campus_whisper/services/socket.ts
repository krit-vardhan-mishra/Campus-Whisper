import { io, Socket } from 'socket.io-client';

// In production the frontend is served by the backend on the same origin,
// so we connect to the current origin. In development Vite runs on a
// different port, so we point to the backend port (5002).
const SOCKET_URL: string =
  (import.meta as any).env?.VITE_SOCKET_URL ||
  (import.meta.env.PROD
    ? window.location.origin   // same origin
    : `http://${window.location.hostname}:5002`);

class SocketService {
  private socket: Socket | null = null;
  private currentRoomId: string | null = null;

  connect(token: string) {
    // Already connected with same socket — nothing to do
    if (this.socket?.connected) return;

    // If an old disconnected socket exists, clean it up first
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      // Re-join the active room on reconnect so events keep flowing
      if (this.currentRoomId) {
        console.log('[Socket] Rejoining room after reconnect:', this.currentRoomId);
        this.socket?.emit('join_room', this.currentRoomId);
      }
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });
  }

  disconnect() {
    this.currentRoomId = null;
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string) {
    this.currentRoomId = roomId;
    this.socket?.emit('join_room', roomId);
  }

  leaveRoom(roomId: string) {
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
    this.socket?.emit('leave_room', roomId);
  }

  sendMessage(content: string, roomId: string, type?: string) {
    this.socket?.emit('send_message', { content, roomId, type });
  }

  emitTyping(roomId: string) {
    this.socket?.emit('typing', { roomId });
  }

  emitStopTyping(roomId: string) {
    this.socket?.emit('stop_typing', { roomId });
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  get connected() {
    return this.socket?.connected ?? false;
  }

  get socketId() {
    return this.socket?.id ?? null;
  }
}

export const socketService = new SocketService();
