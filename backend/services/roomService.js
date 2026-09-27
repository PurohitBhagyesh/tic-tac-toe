import { v4 as uuidv4 } from 'uuid';

const rooms = new Map();

function generateRoomCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(code));
  return code;
}

export async function createRoom(hostName) {
  const roomCode = generateRoomCode();
  const hostId = uuidv4();

  const hostPlayer = {
    id: hostId,
    name: hostName || 'Player 1',
    symbol: 'X',
    isHost: true,
    isReady: false,
    score: 0,
    socketId: null,
  };

  const room = {
    code: roomCode,
    status: 'waiting',
    players: [hostPlayer],
    match: null,
    createdAt: new Date().toISOString(),
  };

  rooms.set(roomCode, room);

  return {
    success: true,
    roomCode,
    player: hostPlayer,
    room,
  };
}

export async function getRoom(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }
  return { success: true, room };
}

export async function joinRoom(roomCode, playerName) {
  const room = rooms.get(roomCode);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  if (room.players.length >= 2) {
    return { success: false, error: 'Room is full' };
  }

  const guestPlayer = {
    id: uuidv4(),
    name: playerName || 'Player 2',
    symbol: 'O',
    isHost: false,
    isReady: false,
    score: 0,
    socketId: null,
  };

  room.players.push(guestPlayer);
  room.status = 'ready';

  return {
    success: true,
    player: guestPlayer,
    room,
  };
}

export async function setPlayerReady(roomCode, playerId, ready = true) {
  const room = rooms.get(roomCode);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return { success: false, error: 'Player not found' };
  }

  player.isReady = ready;
  return { success: true, room };
}

export async function leaveRoom(roomCode, playerId) {
  const room = rooms.get(roomCode);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    rooms.delete(roomCode);
    return { success: true, message: 'Room deleted' };
  }

  if (room.players.length > 0 && !room.players.some((p) => p.isHost)) {
    room.players[0].isHost = true;
  }

  room.status = 'waiting';
  return { success: true, room };
}

export function getAllRooms() {
  return Array.from(rooms.values());
}
