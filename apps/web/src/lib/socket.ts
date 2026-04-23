import { io, Socket } from 'socket.io-client';
import { getPublicApiUrl } from './api';

const SOCKET_URL = getPublicApiUrl().replace(/\/api\/?$/i, '');

export const getSocket = (token?: string | null): Socket => {
  return io(SOCKET_URL, {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
  });
};
