const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    const response = await fetch(`${BASE_URL}/api/rooms`, {
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
    const response = await fetch(`${BASE_URL}/api/rooms/${roomCode}`);
    return handleResponse(response);
  },

  /**
   * Join an existing room
   */
  async joinRoom(roomCode, playerName, playerId = null) {
    const response = await fetch(`${BASE_URL}/api/rooms/${roomCode}/join`, {
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
    const response = await fetch(`${BASE_URL}/api/rooms/${roomCode}/ready`, {
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
    const response = await fetch(`${BASE_URL}/api/rooms/${roomCode}/rematch`, {
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
    const response = await fetch(`${BASE_URL}/api/rooms/${roomCode}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    return handleResponse(response);
  },
};
