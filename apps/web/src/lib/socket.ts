import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  public connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Capture token
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('kairos_auth_token');
    }

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'], // Fallback to polling if WS is blocked
      auth: {
        token: this.token,
      },
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server
        this.socket?.connect();
      }
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
    });

    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
