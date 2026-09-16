import { roomStore } from './roomService.js';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winnerSymbol: board[a], winningLine: combo };
    }
  }
  return null;
}

function checkDraw(board) {
  const winnerInfo = checkWinner(board);
  if (winnerInfo) return false;
  return board.every((cell) => cell !== '' && cell !== null);
}

export async function startMatch(roomCode) {
  const room = roomStore.get(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  if (room.players.length < 2) {
    return { success: false, error: 'Need 2 players to start' };
  }

  room.status = 'playing';
  room.currentRound = 1;
  room.board = Array(9).fill('');
  room.winningLine = null;
  room.matchEnded = false;
  room.winner = null;
  room.rematchVotes.clear();

  room.players.forEach((p) => {
    p.score = 0;
  });

  const hostPlayer = room.players.find((p) => p.isHost);
  room.turnPlayerId = hostPlayer ? hostPlayer.id : room.players[0].id;

  return {
    success: true,
    room: formatRoomState(room),
  };
}

export async function makeMove(roomCode, playerId, cellIndex) {
  const room = roomStore.get(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  if (room.status !== 'playing') {
    return { success: false, error: 'Game is not in playing state' };
  }

  if (room.turnPlayerId !== playerId) {
    return { success: false, error: 'Not your turn' };
  }

  if (cellIndex < 0 || cellIndex > 8 || room.board[cellIndex] !== '') {
    return { success: false, error: 'Invalid cell index or cell already occupied' };
  }

  const currentPlayer = room.players.find((p) => p.id === playerId);
  if (!currentPlayer) return { success: false, error: 'Player not found' };

  room.board[cellIndex] = currentPlayer.symbol;

  const winResult = checkWinner(room.board);
  const isDraw = checkDraw(room.board);

  let roundEnded = false;
  let roundWinner = null;

  if (winResult) {
    roundEnded = true;
    roundWinner = currentPlayer;
    currentPlayer.score += 1;
    room.winningLine = winResult.winningLine;
  } else if (isDraw) {
    roundEnded = true;
    roundWinner = null;
  }

  if (roundEnded) {
    const p1 = room.players[0];
    const p2 = room.players[1];

    if (room.currentRound >= room.maxRounds || Math.abs(p1.score - p2.score) > (room.maxRounds - room.currentRound)) {
      room.matchEnded = true;
      room.status = 'finished';
      if (p1.score > p2.score) room.winner = p1;
      else if (p2.score > p1.score) room.winner = p2;
      else room.winner = null;
    }
  } else {
    const nextPlayer = room.players.find((p) => p.id !== playerId);
    if (nextPlayer) room.turnPlayerId = nextPlayer.id;
  }

  return {
    success: true,
    roundEnded,
    roundWinner,
    isDraw,
    winningLine: room.winningLine,
    room: formatRoomState(room),
  };
}

export async function nextRound(roomCode) {
  const room = roomStore.get(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  if (room.matchEnded) {
    return { success: false, error: 'Match has ended. Request rematch instead.' };
  }

  room.currentRound += 1;
  room.board = Array(9).fill('');
  room.winningLine = null;

  const starterIndex = (room.currentRound - 1) % 2;
  room.turnPlayerId = room.players[starterIndex].id;

  return {
    success: true,
    room: formatRoomState(room),
  };
}

export async function giveUp(roomCode, playerId) {
  const room = roomStore.get(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  const winner = room.players.find((p) => p.id !== playerId);
  if (winner) {
    winner.score += (room.maxRounds - room.currentRound + 1);
  }

  room.matchEnded = true;
  room.status = 'finished';
  room.winner = winner || null;

  return {
    success: true,
    room: formatRoomState(room),
  };
}

export async function requestRematch(roomCode, playerId) {
  const room = roomStore.get(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  room.rematchVotes.add(playerId);

  const bothVoted = room.players.length === 2 && room.players.every((p) => room.rematchVotes.has(p.id));

  if (bothVoted) {
    return await startMatch(roomCode);
  }

  return {
    success: true,
    waitingForOther: true,
    room: formatRoomState(room),
  };
}

function formatRoomState(room) {
  const scores = {};
  room.players.forEach((p) => {
    scores[p.symbol] = p.score;
  });

  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    board: room.board,
    turnPlayerId: room.turnPlayerId,
    winningLine: room.winningLine,
    players: room.players,
    match: {
      currentRound: room.currentRound,
      maxRounds: room.maxRounds,
      scores,
      matchEnded: room.matchEnded,
      winner: room.winner,
    },
  };
}
