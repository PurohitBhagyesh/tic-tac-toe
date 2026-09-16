import { v4 as uuidv4 } from 'uuid';

const roomStore = new Map();

export function generateRoomCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (roomStore.has(code));
  return code;
}

export async function createRoom(hostName = 'Player 1') {
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
    id: uuidv4(),
    roomCode,
    status: 'waiting',
    currentRound: 1,
    maxRounds: 5,
    turnPlayerId: hostId,
    players: [hostPlayer],
    board: Array(9).fill(''),
    winningLine: null,
    matchEnded: false,
    winner: null,
    rematchVotes: new Set(),
  };

  roomStore.set(roomCode, room);

  return {
    success: true,
    roomCode,
    room,
    player: hostPlayer,
  };
}

export async function joinRoom(roomCode, playerName = 'Player 2') {
  const room = roomStore.get(roomCode);
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  if (room.players.length >= 2) {
    return { success: false, error: 'Room is full' };
  }

  const guestId = uuidv4();
  const guestPlayer = {
    id: guestId,
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
    roomCode,
    room,
    player: guestPlayer,
  };
}

export async function getRoom(roomCode) {
  const room = roomStore.get(roomCode);
  if (!room) return null;
  return room;
}

export async function setPlayerReady(roomCode, playerId, isReady = true) {
  const room = roomStore.get(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { success: false, error: 'Player not found' };

  player.isReady = isReady;

  const allReady = room.players.length === 2 && room.players.every((p) => p.isReady);
  if (allReady) {
    room.status = 'ready';
  }

  return { success: true, room };
}

export async function leaveRoom(roomCode, playerId) {
  const room = roomStore.get(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  room.players = room.players.filter((p) => p.id !== playerId);
  if (room.players.length === 0) {
    roomStore.delete(roomCode);
  } else {
    room.status = 'waiting';
    room.players[0].isHost = true;
  }

  return { success: true, room };
}

export { roomStore };
