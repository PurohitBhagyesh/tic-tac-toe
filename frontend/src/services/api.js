// Helper to get sanitized API URL
const getApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_URL;
  if (!url || typeof url !== 'string' || url.trim() === '') {
    // In production with reverse proxy / multi-service rewrites, use relative path
    if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '';
    }
    return 'http://localhost:5000';
  }

  url = url.trim();

  // If user accidentally put database URL (postgresql://) in frontend VITE_API_URL
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    console.error('⚠️ [Config Error] VITE_API_URL was set to a PostgreSQL database URL instead of your backend URL (https://tic-tac-toe-xcsr.onrender.com).');
    return 'https://tic-tac-toe-xcsr.onrender.com';
  }

  // Remove trailing slashes
  return url.replace(/\/+$/, '');
};

const BASE_URL = getApiBaseUrl();

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

export const api = {
  /**
   * Create a new 6-digit room
   */
  async createRoom(playerName) {
    const url = `${getApiBaseUrl()}/api/rooms`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName }),
    });
    return handleResponse(response);
  },

  /**
   * Get room info by code
   */
  async getRoom(roomCode) {
    const url = `${getApiBaseUrl()}/api/rooms/${roomCode}`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  /**
   * Join an existing room
   */
  async joinRoom(roomCode, playerName, playerId = null) {
    const url = `${getApiBaseUrl()}/api/rooms/${roomCode}/join`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, playerId }),
    });
    return handleResponse(response);
  },

  /**
   * Update ready state
   */
  async updateReady(roomCode, playerId, ready) {
    const url = `${getApiBaseUrl()}/api/rooms/${roomCode}/ready`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, ready }),
    });
    return handleResponse(response);
  },

  /**
   * Request rematch
   */
  async requestRematch(roomCode, playerId) {
    const url = `${getApiBaseUrl()}/api/rooms/${roomCode}/rematch`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    return handleResponse(response);
  },

  /**
   * Leave room
   */
  async leaveRoom(roomCode, playerId) {
    const url = `${getApiBaseUrl()}/api/rooms/${roomCode}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    return handleResponse(response);
  },
};
