/**
 * Backend Room Management Service
 * Handles 6-digit room generation, player session management, and lobby state synchronization.
 */

const crypto = require('crypto');

class RoomService {
  constructor() {
    // In-memory room cache for active connections
    this.rooms = new Map();
  }

  /**
   * Generates a unique 6-digit room code.
   * @returns {string}
   */
  generateRoomCode() {
    let code;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.rooms.has(code));
    return code;
  }

  /**
   * Creates a new game room with host player.
   * @param {string} hostName
   * @param {string} socketId
   * @returns {Object} Created room object
   */
  createRoom(hostName, socketId) {
    const roomCode = this.generateRoomCode();
    const hostPlayer = {
      id: crypto.randomUUID(),
      name: hostName || 'Player 1',
      symbol: 'X',
      isHost: true,
      ready: false,
      score: 0,
      socketId
    };

    const room = {
      code: roomCode,
      status: 'waiting', // waiting, ready, playing, finished
      currentRound: 1,
      maxRounds: 5,
      board: Array(9).fill(''),
      turn: 'X',
      players: [hostPlayer],
      rematchVotes: new Set(),
      createdAt: Date.now()
    };

    this.rooms.set(roomCode, room);
    return { room, player: hostPlayer };
  }

  /**
   * Retrieves a room by its 6-digit code.
   * @param {string} code
   * @returns {Object|null}
   */
  getRoom(code) {
    return this.rooms.get(code) || null;
  }

  /**
   * Joins an existing room as Guest (Player 2).
   * @param {string} code
   * @param {string} guestName
   * @param {string} socketId
   * @returns {Object}
   */
  joinRoom(code, guestName, socketId) {
    const room = this.rooms.get(code);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.length >= 2) {
      throw new Error('Room is full');
    }

    const guestPlayer = {
      id: crypto.randomUUID(),
      name: guestName || 'Player 2',
      symbol: 'O',
      isHost: false,
      ready: false,
      score: 0,
      socketId
    };

    room.players.push(guestPlayer);
    room.status = 'ready';

    return { room, player: guestPlayer };
  }

  /**
   * Updates player ready state.
   * @param {string} code
   * @param {string} playerId
   * @param {boolean} ready
   * @returns {Object}
   */
  setPlayerReady(code, playerId, ready) {
    const room = this.rooms.get(code);
    if (!room) throw new Error('Room not found');

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.ready = ready;
    }

    return room;
  }

  /**
   * Resets room state for next round or rematch.
   * @param {string} code
   * @returns {Object}
   */
  resetBoard(code) {
    const room = this.rooms.get(code);
    if (!room) throw new Error('Room not found');

    room.board = Array(9).fill('');
    room.turn = room.currentRound % 2 === 1 ? 'X' : 'O';
    return room;
  }

  /**
   * Handles player disconnection / leaving room.
   * @param {string} code
   * @param {string} playerId
   */
  removePlayer(code, playerId) {
    const room = this.rooms.get(code);
    if (!room) return null;

    room.players = room.players.filter(p => p.id !== playerId);
    if (room.players.length === 0) {
      this.rooms.delete(code);
      return null;
    }

    if (room.players.length > 0) {
      room.players[0].isHost = true;
      room.status = 'waiting';
    }

    return room;
  }
}

module.exports = new RoomService();
