import { getRoom } from './roomService.js';

const WINNING_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWinningPattern(board) {
  for (const pattern of WINNING_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winnerSymbol: board[a], pattern };
    }
  }
  return null;
}

export async function startMatch(roomCode) {
  const roomRes = await getRoom(roomCode);
  if (!roomRes.success) return roomRes;

  const room = roomRes.room;
  if (room.players.length < 2) {
    return { success: false, error: 'At least two players required to start match' };
  }

  const hostPlayer = room.players.find((p) => p.isHost) || room.players[0];

  room.status = 'playing';
  room.match = {
    currentRound: 1,
    maxRounds: 5,
    scores: { X: 0, O: 0 },
    turnPlayerId: hostPlayer.id,
    starterPlayerId: hostPlayer.id,
    board: Array(9).fill(''),
    roundEnded: false,
    matchEnded: false,
    winner: null,
    rematchRequests: new Set(),
  };

  room.players.forEach((p) => (p.score = 0));

  return { success: true, room };
}

export async function makeMove(roomCode, playerId, cellIndex) {
  const roomRes = await getRoom(roomCode);
  if (!roomRes.success) return roomRes;

  const room = roomRes.room;
  if (!room.match) {
    return { success: false, error: 'Match has not started yet' };
  }

  const { match, players } = room;

  if (match.matchEnded || match.roundEnded) {
    return { success: false, error: 'Round or match is already finished' };
  }

  if (cellIndex < 0 || cellIndex > 8) {
    return { success: false, error: 'Invalid cell index' };
  }

  if (match.turnPlayerId !== playerId) {
    return { success: false, error: 'Not your turn' };
  }

  if (match.board[cellIndex] !== '') {
    return { success: false, error: 'Cell is already occupied' };
  }

  const currentPlayer = players.find((p) => p.id === playerId);
  if (!currentPlayer) {
    return { success: false, error: 'Player not found in room' };
  }

  match.board[cellIndex] = currentPlayer.symbol;

  const winResult = checkWinningPattern(match.board);
  if (winResult) {
    match.roundEnded = true;
    match.scores[currentPlayer.symbol] = (match.scores[currentPlayer.symbol] || 0) + 1;
    currentPlayer.score = match.scores[currentPlayer.symbol];

    if (match.currentRound >= match.maxRounds) {
      match.matchEnded = true;
      const winnerSymbol = match.scores.X > match.scores.O ? 'X' : match.scores.O > match.scores.X ? 'O' : null;
      match.winner = players.find((p) => p.symbol === winnerSymbol) || null;
    }

    return {
      success: true,
      roundEnded: true,
      isDraw: false,
      winPattern: winResult.pattern,
      room,
    };
  }

  const isFull = match.board.every((cell) => cell !== '');
  if (isFull) {
    match.roundEnded = true;

    if (match.currentRound >= match.maxRounds) {
      match.matchEnded = true;
      const winnerSymbol = match.scores.X > match.scores.O ? 'X' : match.scores.O > match.scores.X ? 'O' : null;
      match.winner = players.find((p) => p.symbol === winnerSymbol) || null;
    }

    return {
      success: true,
      roundEnded: true,
      isDraw: true,
      room,
    };
  }

  const otherPlayer = players.find((p) => p.id !== playerId);
  match.turnPlayerId = otherPlayer ? otherPlayer.id : playerId;

  return {
    success: true,
    roundEnded: false,
    isDraw: false,
    room,
  };
}

export async function nextRound(roomCode) {
  const roomRes = await getRoom(roomCode);
  if (!roomRes.success) return roomRes;

  const room = roomRes.room;
  if (!room.match) {
    return { success: false, error: 'No active match found' };
  }

  const { match, players } = room;
  match.currentRound += 1;
  match.board = Array(9).fill('');
  match.roundEnded = false;

  const prevStarter = players.find((p) => p.id === match.starterPlayerId);
  const nextStarter = players.find((p) => p.id !== match.starterPlayerId) || prevStarter;

  match.starterPlayerId = nextStarter.id;
  match.turnPlayerId = nextStarter.id;

  return { success: true, room };
}

export async function giveUp(roomCode, playerId) {
  const roomRes = await getRoom(roomCode);
  if (!roomRes.success) return roomRes;

  const room = roomRes.room;
  if (!room.match) {
    return { success: false, error: 'No active match found' };
  }

  const forfeitPlayer = room.players.find((p) => p.id === playerId);
  const winnerPlayer = room.players.find((p) => p.id !== playerId);

  room.match.matchEnded = true;
  room.match.roundEnded = true;
  room.match.winner = winnerPlayer || null;

  return { success: true, room };
}

export async function requestRematch(roomCode, playerId) {
  const roomRes = await getRoom(roomCode);
  if (!roomRes.success) return roomRes;

  const room = roomRes.room;
  if (!room.match) {
    return { success: false, error: 'No match state to rematch' };
  }

  if (!room.match.rematchRequests) {
    room.match.rematchRequests = new Set();
  }

  room.match.rematchRequests.add(playerId);

  if (room.match.rematchRequests.size >= 2 || room.players.length === 1) {
    const hostPlayer = room.players.find((p) => p.isHost) || room.players[0];

    room.match.currentRound = 1;
    room.match.scores = { X: 0, O: 0 };
    room.match.board = Array(9).fill('');
    room.match.roundEnded = false;
    room.match.matchEnded = false;
    room.match.winner = null;
    room.match.starterPlayerId = hostPlayer.id;
    room.match.turnPlayerId = hostPlayer.id;
    room.match.rematchRequests.clear();

    room.players.forEach((p) => (p.score = 0));
  }

  return { success: true, room };
}
