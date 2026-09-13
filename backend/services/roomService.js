import { randomUUID as uuidv4 } from 'crypto';
import { query, isDbConnected } from '../database/database.js';

// In-memory active room cache for ultra-fast, low-latency Socket.IO state
// Synchronized with PostgreSQL database
const activeRooms = new Map();

/**
 * Generate a secure, unique 6-digit room code
 */
export const generateRoomCode = () => {
  let code;
  let attempts = 0;
  do {
    // Generate 6-digit number between 100000 and 999999
    code = Math.floor(100000 + Math.random() * 900000).toString();
    attempts++;
  } while (activeRooms.has(code) && attempts < 100);
  return code;
};

/**
 * Create a new room with Player 1 (Host)
 */
export const createRoom = async (rawPlayerName) => {
  const playerName = (rawPlayerName && rawPlayerName.trim()) ? rawPlayerName.trim().slice(0, 30) : 'Player 1';
  const roomCode = generateRoomCode();
  const roomId = uuidv4();
  const player1Id = uuidv4();

  const player1 = {
    id: player1Id,
    name: playerName,
    symbol: 'X',
    ready: false,
    connected: true,
    socketId: null,
  };

  const room = {
    id: roomId,
    roomCode,
    status: 'waiting', // 'waiting', 'lobby', 'playing', 'finished'
    createdAt: new Date(),
    players: [player1],
    match: null, // Initialized when game starts
    rematchVotes: new Set(),
  };

  activeRooms.set(roomCode, room);

  // Persist to PostgreSQL if connected
  try {
    if (isDbConnected()) {
      await query(
        `INSERT INTO rooms (id, room_code, status, created_at) VALUES ($1, $2, $3, $4)`,
        [roomId, roomCode, 'waiting', room.createdAt]
      );
      await query(
        `INSERT INTO players (id, room_id, name, symbol, ready, connected, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [player1Id, roomId, player1.name, 'X', false, true, new Date()]
      );
    }
  } catch (err) {
    console.error(`[roomService] DB error on createRoom:`, err.message);
  }

  return {
    success: true,
    message: 'Room created successfully',
    roomCode,
    roomId,
    player: player1,
    room: sanitizeRoom(room),
  };
};

/**
 * Get room by 6-digit code
 */
export const getRoom = async (roomCode) => {
  if (!roomCode || roomCode.length !== 6) return null;

  let room = activeRooms.get(roomCode);
  if (room) return room;

  // Check PostgreSQL if not found in memory
  try {
    if (isDbConnected()) {
      const roomRes = await query(`SELECT * FROM rooms WHERE room_code = $1`, [roomCode]);
      if (roomRes.rows.length > 0) {
        const dbRoom = roomRes.rows[0];
        const playersRes = await query(`SELECT * FROM players WHERE room_id = $1 ORDER BY created_at ASC`, [dbRoom.id]);
        
        room = {
          id: dbRoom.id,
          roomCode: dbRoom.room_code,
          status: dbRoom.status,
          createdAt: dbRoom.created_at,
          players: playersRes.rows.map(p => ({
            id: p.id,
            name: p.name,
            symbol: p.symbol,
            ready: p.ready,
            connected: p.connected,
            socketId: null
          })),
          match: null,
          rematchVotes: new Set()
        };
        activeRooms.set(roomCode, room);
        return room;
      }
    }
  } catch (err) {
    console.error(`[roomService] DB error on getRoom:`, err.message);
  }

  return null;
};

/**
 * Join an existing room as Player 2
 */
export const joinRoom = async (roomCode, rawPlayerName, playerId = null) => {
  const room = await getRoom(roomCode);
  if (!room) {
    return { success: false, error: 'Room not found. Please check the 6-digit code.' };
  }

  // Check if player is rejoining
  if (playerId) {
    const existingPlayer = room.players.find(p => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.connected = true;
      return {
        success: true,
        message: 'Reconnected to room',
        roomCode,
        player: existingPlayer,
        room: sanitizeRoom(room)
      };
    }
  }

  if (room.players.length >= 2) {
    return { success: false, error: 'Room is already full.' };
  }

  const playerName = (rawPlayerName && rawPlayerName.trim()) ? rawPlayerName.trim().slice(0, 30) : 'Player 2';
  const player2Id = uuidv4();

  const player2 = {
    id: player2Id,
    name: playerName,
    symbol: 'O',
    ready: false,
    connected: true,
    socketId: null,
  };

  room.players.push(player2);
  room.status = 'lobby'; // Both players are in the room

  // Persist to PostgreSQL
  try {
    if (isDbConnected()) {
      await query(`UPDATE rooms SET status = $1 WHERE id = $2`, ['lobby', room.id]);
      await query(
        `INSERT INTO players (id, room_id, name, symbol, ready, connected, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [player2Id, room.id, player2.name, 'O', false, true, new Date()]
      );
    }
  } catch (err) {
    console.error(`[roomService] DB error on joinRoom:`, err.message);
  }

  return {
    success: true,
    message: 'Joined room successfully',
    roomCode,
    player: player2,
    room: sanitizeRoom(room)
  };
};

/**
 * Toggle ready status for a player
 */
export const setPlayerReady = async (roomCode, playerId, isReady) => {
  const room = await getRoom(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: 'Player not found in room' };

  player.ready = Boolean(isReady);

  // Update DB
  try {
    if (isDbConnected()) {
      await query(`UPDATE players SET ready = $1 WHERE id = $2`, [player.ready, player.id]);
    }
  } catch (err) {
    console.error(`[roomService] DB error on setPlayerReady:`, err.message);
  }

  const allReady = room.players.length === 2 && room.players.every(p => p.ready && p.connected);

  return {
    success: true,
    allReady,
    player,
    room: sanitizeRoom(room)
  };
};

/**
 * Update player connection status & socket ID
 */
export const updatePlayerSocket = async (roomCode, playerId, socketId, isConnected = true) => {
  const room = await getRoom(roomCode);
  if (!room) return null;

  const player = room.players.find(p => p.id === playerId || p.socketId === socketId);
  if (player) {
    player.socketId = socketId;
    player.connected = isConnected;

    try {
      if (isDbConnected()) {
        await query(`UPDATE players SET connected = $1 WHERE id = $2`, [isConnected, player.id]);
      }
    } catch (err) {
      console.error(`[roomService] DB error on updatePlayerSocket:`, err.message);
    }
  }
  return room;
};

/**
 * Handle player leaving room
 */
export const leaveRoom = async (roomCode, playerId) => {
  const room = await getRoom(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  const leavingIndex = room.players.findIndex(p => p.id === playerId);
  if (leavingIndex === -1) return { success: false, error: 'Player not in room' };

  const [leavingPlayer] = room.players.splice(leavingIndex, 1);

  // If room is empty, delete room
  if (room.players.length === 0) {
    activeRooms.delete(roomCode);
    try {
      if (isDbConnected()) {
        await query(`DELETE FROM rooms WHERE id = $1`, [room.id]);
      }
    } catch (err) {
      console.error(`[roomService] DB error on delete room:`, err.message);
    }
    return { success: true, roomEmpty: true, leavingPlayer };
  } else {
    // Room still has remaining player
    room.status = 'waiting';
    // Remaining player reset ready
    room.players.forEach(p => { p.ready = false; });
    room.match = null;
    room.rematchVotes.clear();

    try {
      if (isDbConnected()) {
        await query(`DELETE FROM players WHERE id = $1`, [playerId]);
        await query(`UPDATE rooms SET status = $1 WHERE id = $2`, ['waiting', room.id]);
        await query(`UPDATE players SET ready = false WHERE room_id = $1`, [room.id]);
      }
    } catch (err) {
      console.error(`[roomService] DB error on leaveRoom:`, err.message);
    }

    return {
      success: true,
      roomEmpty: false,
      leavingPlayer,
      room: sanitizeRoom(room)
    };
  }
};

/**
 * Sanitize room data for client consumption (safe serialization)
 */
export const sanitizeRoom = (room) => {
  if (!room) return null;
  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    createdAt: room.createdAt,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      symbol: p.symbol,
      ready: p.ready,
      connected: p.connected,
    })),
    match: room.match ? {
      id: room.match.id,
      currentRound: room.match.currentRound,
      maxRounds: room.match.maxRounds,
      scores: room.match.scores,
      board: room.match.board,
      currentTurn: room.match.currentTurn, // 'X' or 'O'
      status: room.match.status, // 'in_progress', 'round_ended', 'match_ended'
      winner: room.match.winner,
      winningLine: room.match.winningLine,
      roundWinner: room.match.roundWinner,
      matchWinner: room.match.matchWinner,
      roundHistory: room.match.roundHistory,
    } : null,
    rematchVotes: Array.from(room.rematchVotes || []),
  };
};

export { activeRooms };
