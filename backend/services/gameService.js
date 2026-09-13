import { randomUUID as uuidv4 } from 'crypto';
import { query, isDbConnected } from '../database/database.js';
import { getRoom, sanitizeRoom } from './roomService.js';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

/**
 * Check if the board has a winner
 */
export const checkWinner = (board) => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: combo };
    }
  }
  return null;
};

/**
 * Check if the board is a draw (all 9 cells filled with no winner)
 */
export const checkDraw = (board) => {
  return board.every(cell => cell !== null);
};

/**
 * Start a new 5-round match for a room
 */
export const startMatch = async (roomCode) => {
  const room = await getRoom(roomCode);
  if (!room || room.players.length < 2) {
    return { success: false, error: 'Cannot start match. Need 2 players.' };
  }

  const matchId = uuidv4();
  room.status = 'playing';
  room.rematchVotes = new Set();

  room.match = {
    id: matchId,
    currentRound: 1,
    maxRounds: 5,
    scores: { X: 0, O: 0 },
    board: Array(9).fill(null),
    currentTurn: 'X', // Player 1 starts round 1
    startingPlayer: 'X',
    status: 'in_progress', // 'in_progress', 'round_ended', 'match_ended'
    roundWinner: null,
    winningLine: null,
    matchWinner: null,
    roundHistory: [],
    turnStartedAt: Date.now(),
    turnTimeLimit: 120, // Mandatory 2 minutes (120 seconds) per turn
  };

  // Persist to PostgreSQL
  try {
    if (isDbConnected()) {
      await query(`UPDATE rooms SET status = $1 WHERE id = $2`, ['playing', room.id]);
      await query(
        `INSERT INTO matches (id, room_id, player1_score, player2_score, current_round, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [matchId, room.id, 0, 0, 1, 'active', new Date(), new Date()]
      );
    }
  } catch (err) {
    console.error(`[gameService] DB error on startMatch:`, err.message);
  }

  return {
    success: true,
    room: sanitizeRoom(room),
  };
};

/**
 * Authoritative Server Move Processing
 */
export const makeMove = async (roomCode, playerId, cellIndex) => {
  const room = await getRoom(roomCode);
  if (!room || !room.match) {
    return { success: false, error: 'Game is not active in this room.' };
  }

  const match = room.match;
  const player = room.players.find(p => p.id === playerId);

  if (!player) {
    return { success: false, error: 'Player does not belong to this room.' };
  }

  if (match.status !== 'in_progress') {
    return { success: false, error: 'Current round has already ended.' };
  }

  if (match.currentTurn !== player.symbol) {
    return { success: false, error: 'It is not your turn.' };
  }

  const index = parseInt(cellIndex, 10);
  if (isNaN(index) || index < 0 || index > 8) {
    return { success: false, error: 'Invalid cell index.' };
  }

  if (match.board[index] !== null) {
    return { success: false, error: 'Cell is already occupied.' };
  }

  // 1. Place the symbol
  match.board[index] = player.symbol;

  // 2. Check for round outcome
  const winResult = checkWinner(match.board);
  const isDraw = !winResult && checkDraw(match.board);

  let roundEnded = false;
  let matchEnded = false;

  if (winResult) {
    roundEnded = true;
    match.roundWinner = winResult.winner;
    match.winningLine = winResult.winningLine;
    match.scores[winResult.winner] += 1;
    match.status = 'round_ended';
  } else if (isDraw) {
    roundEnded = true;
    match.roundWinner = 'draw';
    match.winningLine = null;
    match.status = 'round_ended';
  } else {
    // Switch turn
    match.currentTurn = match.currentTurn === 'X' ? 'O' : 'X';
    match.turnStartedAt = Date.now();
  }

  // 3. If round ended, record round history & check match completion
  if (roundEnded) {
    const roundRecord = {
      roundNumber: match.currentRound,
      winner: match.roundWinner,
      board: [...match.board],
      scores: { ...match.scores }
    };
    match.roundHistory.push(roundRecord);

    // Persist round to DB
    try {
      if (isDbConnected()) {
        const roundId = uuidv4();
        await query(
          `INSERT INTO rounds (id, match_id, round_number, winner, board_state, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [roundId, match.id, match.currentRound, match.roundWinner, JSON.stringify(match.board), new Date()]
        );
        await query(
          `UPDATE matches SET player1_score = $1, player2_score = $2, current_round = $3, updated_at = $4 WHERE id = $5`,
          [match.scores.X, match.scores.O, match.currentRound, new Date(), match.id]
        );
      }
    } catch (err) {
      console.error(`[gameService] DB error on roundEnd:`, err.message);
    }

    // Check if 5 rounds completed
    if (match.currentRound >= match.maxRounds) {
      matchEnded = true;
      match.status = 'match_ended';
      room.status = 'finished';

      if (match.scores.X > match.scores.O) {
        match.matchWinner = 'X';
      } else if (match.scores.O > match.scores.X) {
        match.matchWinner = 'O';
      } else {
        match.matchWinner = 'draw';
      }

      try {
        if (isDbConnected()) {
          await query(`UPDATE matches SET status = 'completed', updated_at = $1 WHERE id = $2`, [new Date(), match.id]);
          await query(`UPDATE rooms SET status = 'finished' WHERE id = $1`, [room.id]);
        }
      } catch (err) {
        console.error(`[gameService] DB error on matchEnd:`, err.message);
      }
    }
  }

  return {
    success: true,
    roundEnded,
    matchEnded,
    room: sanitizeRoom(room)
  };
};

/**
 * Transition to next round in 5-round match
 */
export const nextRound = async (roomCode) => {
  const room = await getRoom(roomCode);
  if (!room || !room.match) {
    return { success: false, error: 'No active match found.' };
  }

  const match = room.match;
  if (match.status !== 'round_ended') {
    return { success: false, error: 'Current round has not ended yet.' };
  }

  if (match.currentRound >= match.maxRounds) {
    return { success: false, error: 'All 5 rounds have been completed.' };
  }

  match.currentRound += 1;
  match.board = Array(9).fill(null);
  match.roundWinner = null;
  match.winningLine = null;
  match.status = 'in_progress';

  // Alternate starting symbol each round
  match.startingPlayer = match.startingPlayer === 'X' ? 'O' : 'X';
  match.currentTurn = match.startingPlayer;
  match.turnStartedAt = Date.now();

  try {
    if (isDbConnected()) {
      await query(
        `UPDATE matches SET current_round = $1, updated_at = $2 WHERE id = $3`,
        [match.currentRound, new Date(), match.id]
      );
    }
  } catch (err) {
    console.error(`[gameService] DB error on nextRound:`, err.message);
  }

  return {
    success: true,
    room: sanitizeRoom(room)
  };
};

/**
 * Handle Turn Timeout (Mandatory 2-Minute limit per turn in multiplayer)
 */
export const handleTimeout = async (roomCode, playerId) => {
  const room = await getRoom(roomCode);
  if (!room || !room.match) {
    return { success: false, error: 'No active game found.' };
  }

  const timedOutPlayer = room.players.find(p => p.id === playerId);
  if (!timedOutPlayer) {
    return { success: false, error: 'Player not in room.' };
  }

  const opponent = room.players.find(p => p.id !== playerId);
  const match = room.match;

  match.status = 'match_ended';
  match.matchWinner = opponent ? opponent.symbol : (timedOutPlayer.symbol === 'X' ? 'O' : 'X');
  match.timeout = true;
  match.timedOutPlayerId = playerId;
  room.status = 'finished';

  try {
    if (isDbConnected()) {
      await query(`UPDATE matches SET status = 'timeout', updated_at = $1 WHERE id = $2`, [new Date(), match.id]);
      await query(`UPDATE rooms SET status = 'finished' WHERE id = $1`, [room.id]);
    }
  } catch (err) {
    console.error(`[gameService] DB error on timeout:`, err.message);
  }

  return {
    success: true,
    timedOutPlayer,
    opponent,
    room: sanitizeRoom(room)
  };
};

/**
 * Handle Give Up / Forfeit
 */
export const giveUpMatch = async (roomCode, playerId) => {
  const room = await getRoom(roomCode);
  if (!room || !room.match) {
    return { success: false, error: 'No active game found.' };
  }

  const forfeitingPlayer = room.players.find(p => p.id === playerId);
  if (!forfeitingPlayer) {
    return { success: false, error: 'Player not in room.' };
  }

  const opponent = room.players.find(p => p.id !== playerId);
  const match = room.match;

  match.status = 'match_ended';
  match.matchWinner = opponent ? opponent.symbol : (forfeitingPlayer.symbol === 'X' ? 'O' : 'X');
  room.status = 'finished';

  try {
    if (isDbConnected()) {
      await query(`UPDATE matches SET status = 'forfeited', updated_at = $1 WHERE id = $2`, [new Date(), match.id]);
      await query(`UPDATE rooms SET status = 'finished' WHERE id = $1`, [room.id]);
    }
  } catch (err) {
    console.error(`[gameService] DB error on giveUp:`, err.message);
  }

  return {
    success: true,
    forfeitingPlayer,
    opponent,
    room: sanitizeRoom(room)
  };
};

/**
 * Rematch Agreement System (both players must agree)
 */
export const requestRematch = async (roomCode, playerId) => {
  const room = await getRoom(roomCode);
  if (!room) return { success: false, error: 'Room not found.' };

  const player = room.players.find(p => p.id === playerId);
  if (!player) return { success: false, error: 'Player not in room.' };

  if (!room.rematchVotes) {
    room.rematchVotes = new Set();
  }

  room.rematchVotes.add(playerId);

  const bothAgreed = room.players.length === 2 && room.players.every(p => room.rematchVotes.has(p.id));

  if (bothAgreed) {
    // Reset match and start fresh 5-round game
    return await startMatch(roomCode);
  }

  return {
    success: true,
    bothAgreed: false,
    votedPlayer: player,
    room: sanitizeRoom(room)
  };
};
