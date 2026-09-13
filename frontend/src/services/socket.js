import { io } from 'socket.io-client';

const getSocketUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (!url || typeof url !== 'string' || url.trim() === '') {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      if (hostname.endsWith('github.io') || hostname.endsWith('vercel.app')) {
        return 'https://tic-tac-toe-xcsr.onrender.com';
      }
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        return window.location.origin;
      }
    }
    return 'http://localhost:5000';
  }

  url = url.trim();

  // If user accidentally put database URL (postgresql://) in frontend VITE_API_URL
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    console.error('⚠️ [Config Error] VITE_API_URL was set to a PostgreSQL database URL instead of your backend URL (https://tic-tac-toe-xcsr.onrender.com).');
    return 'https://tic-tac-toe-xcsr.onrender.com';
  }

  return url.replace(/\/+$/, '');
};

const SOCKET_URL = getSocketUrl();

let socket = null;

export const connectSocket = () => {
  if (!socket || !socket.connected) {
    const targetUrl = getSocketUrl();
    socket = io(targetUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO connected:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket.IO connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return connectSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Socket.IO Action Emitters
 */
export const socketService = {
  joinRoom(roomCode, playerId) {
    const s = getSocket();
    s.emit('room:join', { roomCode, playerId });
  },

  sendReady(roomCode, playerId, ready) {
    const s = getSocket();
    s.emit('room:ready', { roomCode, playerId, ready });
  },

  sendMove(roomCode, playerId, cellIndex) {
    const s = getSocket();
    s.emit('game:move', { roomCode, playerId, cellIndex });
  },

  sendHostStart(roomCode, playerId) {
    const s = getSocket();
    s.emit('game:hostStart', { roomCode, playerId });
  },

  sendNextRound(roomCode) {
    const s = getSocket();
    s.emit('game:nextRound', { roomCode });
  },

  sendGiveUp(roomCode, playerId) {
    const s = getSocket();
    s.emit('game:giveUp', { roomCode, playerId });
  },

  sendTimeout(roomCode, playerId) {
    const s = getSocket();
    s.emit('game:timeout', { roomCode, playerId });
  },

  sendRematch(roomCode, playerId) {
    const s = getSocket();
    s.emit('game:rematch', { roomCode, playerId });
  },

  leaveRoom(roomCode, playerId) {
    const s = getSocket();
    s.emit('room:leave', { roomCode, playerId });
  },

  /**
   * Event Listeners
   */
  onPlayerJoined(callback) {
    const s = getSocket();
    s.on('room:playerJoined', callback);
    return () => s.off('room:playerJoined', callback);
  },

  onReadyUpdate(callback) {
    const s = getSocket();
    s.on('room:readyUpdate', callback);
    return () => s.off('room:readyUpdate', callback);
  },

  onGameStart(callback) {
    const s = getSocket();
    s.on('game:start', callback);
    return () => s.off('game:start', callback);
  },

  onGameUpdate(callback) {
    const s = getSocket();
    s.on('game:update', callback);
    return () => s.off('game:update', callback);
  },

  onRoundEnd(callback) {
    const s = getSocket();
    s.on('game:roundEnd', callback);
    return () => s.off('game:roundEnd', callback);
  },

  onMatchEnd(callback) {
    const s = getSocket();
    s.on('game:matchEnd', callback);
    return () => s.off('game:matchEnd', callback);
  },

  onRematchUpdate(callback) {
    const s = getSocket();
    s.on('game:rematchUpdate', callback);
    return () => s.off('game:rematchUpdate', callback);
  },

  onPlayerLeft(callback) {
    const s = getSocket();
    s.on('room:playerLeft', callback);
    return () => s.off('room:playerLeft', callback);
  },

  onPlayerDisconnected(callback) {
    const s = getSocket();
    s.on('room:playerDisconnected', callback);
    return () => s.off('room:playerDisconnected', callback);
  },

  onError(callback) {
    const s = getSocket();
    s.on('game:error', callback);
    return () => s.off('game:error', callback);
  },
};
