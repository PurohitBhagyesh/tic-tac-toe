/**
 * Tic-Tac-Toe Core Game Logic & Minimax AI Engine
 */

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

/**
 * Evaluates the current board state and determines if there is a winner or draw.
 * @param {Array<string>} board - 9-element array representing the board
 * @returns {Object} { winner: 'X'|'O'|'draw'|null, line: Array<number>|null }
 */
export const checkWinner = (board) => {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combination };
    }
  }

  const isDraw = board.every((cell) => cell !== '' && cell !== null);
  if (isDraw) {
    return { winner: 'draw', line: null };
  }

  return { winner: null, line: null };
};

/**
 * Returns array of available empty cell indices on the board.
 * @param {Array<string>} board
 * @returns {Array<number>}
 */
export const getAvailableMoves = (board) => {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i] || board[i] === '') {
      moves.push(i);
    }
  }
  return moves;
};

/**
 * Recursive Minimax implementation with depth evaluation.
 * Calculates optimal scores for all possible game tree branches.
 */
const minimax = (board, depth, isMaximizing, aiSymbol, humanSymbol) => {
  const { winner } = checkWinner(board);

  if (winner === aiSymbol) return 10 - depth;
  if (winner === humanSymbol) return depth - 10;
  if (winner === 'draw') return 0;

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of availableMoves) {
      board[move] = aiSymbol;
      const score = minimax(board, depth + 1, false, aiSymbol, humanSymbol);
      board[move] = '';
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of availableMoves) {
      board[move] = humanSymbol;
      const score = minimax(board, depth + 1, true, aiSymbol, humanSymbol);
      board[move] = '';
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
};

/**
 * Determines the best move for AI based on the selected difficulty setting.
 * @param {Array<string>} board - Current 3x3 board array
 * @param {string} aiSymbol - 'X' or 'O'
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {number} Index of the selected cell (0-8)
 */
export const getBestAIMove = (board, aiSymbol, difficulty = 'hard') => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return -1;

  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';

  // Easy Mode: Random Move
  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // Medium Mode: Heuristic approach (50% smart, 50% random or blocking)
  if (difficulty === 'medium') {
    // 1. Check if AI can win in next move
    for (const move of availableMoves) {
      board[move] = aiSymbol;
      if (checkWinner(board).winner === aiSymbol) {
        board[move] = '';
        return move;
      }
      board[move] = '';
    }

    // 2. Check if Human can win and block
    for (const move of availableMoves) {
      board[move] = humanSymbol;
      if (checkWinner(board).winner === humanSymbol) {
        board[move] = '';
        return move;
      }
      board[move] = '';
    }

    // 3. Center preference if open
    if (board[4] === '') return 4;

    // 4. Otherwise 50% minimax / 50% random
    if (Math.random() > 0.5) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      return availableMoves[randomIndex];
    }
  }

  // Hard Mode: Unbeatable Minimax Strategy
  if (availableMoves.length === 9) {
    const strategicStarts = [4, 0, 2, 6, 8];
    return strategicStarts[Math.floor(Math.random() * strategicStarts.length)];
  }

  let bestScore = -Infinity;
  let bestMove = availableMoves[0];

  for (const move of availableMoves) {
    board[move] = aiSymbol;
    const score = minimax(board, 0, false, aiSymbol, humanSymbol);
    board[move] = '';

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};
