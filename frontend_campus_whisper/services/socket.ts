import { io, Socket } from 'socket.io-client';

const SOCKET_URL: string =
  (import.meta as any).env?.VITE_SOCKET_URL ||
  (import.meta.env.PROD
    ? window.location.origin   // same origin
    : `http://${window.location.hostname}:5002`);

export interface SendMessageAck {
  status: 'ok' | 'error';
  id?: string;
  clientTempId?: string;
  message?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private currentRoomId: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

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

  sendMessage(
    content: string,
    roomId: string,
    type?: string,
    clientTempId?: string,
    ackCallback?: (ack: SendMessageAck) => void
  ) {
    if (!this.socket) return;
    this.socket.emit(
      'send_message',
      { content, roomId, type, clientTempId },
      (ack: SendMessageAck) => {
        if (ackCallback) ackCallback(ack);
      }
    );
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
