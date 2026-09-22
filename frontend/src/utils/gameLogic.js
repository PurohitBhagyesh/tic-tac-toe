/**
 * Game logic utilities for Tic-Tac-Toe.
 * Contains winner checking, winning pattern matching, and AI minimax implementation.
 */

export const WINNING_COMBINATIONS = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Column 1
  [1, 4, 7], // Column 2
  [2, 5, 8], // Column 3
  [0, 4, 8], // Diagonal 1
  [2, 4, 6], // Diagonal 2
];

/**
 * Check if the board has a winner.
 * @param {Array<string>} board - Array of 9 strings ('X', 'O', or '')
 * @returns {Object|null} Object with winner symbol and winning pattern, or null
 */
export function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], pattern: combo };
    }
  }
  return null;
}

/**
 * Check if the board is full (draw).
 * @param {Array<string>} board
 * @returns {boolean}
 */
export function isBoardFull(board) {
  return board.every((cell) => cell !== '' && cell !== null);
}

/**
 * Returns available move indices.
 * @param {Array<string>} board
 * @returns {Array<number>}
 */
export function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) moves.push(i);
  }
  return moves;
}

/**
 * Easy AI: Picks a random valid cell.
 * @param {Array<string>} board
 * @returns {number} Selected cell index
 */
export function getEasyMove(board) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

/**
 * Medium AI: Checks for immediate win or block, otherwise picks strategic center/corner or random.
 * @param {Array<string>} board
 * @param {string} aiSymbol ('O' or 'X')
 * @returns {number}
 */
export function getMediumMove(board, aiSymbol = 'O') {
  const playerSymbol = aiSymbol === 'O' ? 'X' : 'O';
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  // 1. Check if AI can win in 1 move
  for (const move of available) {
    const tempBoard = [...board];
    tempBoard[move] = aiSymbol;
    if (checkWinner(tempBoard)) return move;
  }

  // 2. Check if AI needs to block player from winning
  for (const move of available) {
    const tempBoard = [...board];
    tempBoard[move] = playerSymbol;
    if (checkWinner(tempBoard)) return move;
  }

  // 3. Take center if open
  if (available.includes(4)) return 4;

  // 4. Take available corner
  const corners = [0, 2, 6, 8].filter((idx) => available.includes(idx));
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Take random remaining
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Hard AI: Unbeatable Minimax Algorithm with alpha-beta pruning and depth evaluation.
 * @param {Array<string>} board
 * @param {string} aiSymbol
 * @returns {number} Optimal cell index
 */
export function getHardMove(board, aiSymbol = 'O') {
  const playerSymbol = aiSymbol === 'O' ? 'X' : 'O';
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const move of available) {
    const tempBoard = [...board];
    tempBoard[move] = aiSymbol;
    const score = minimax(tempBoard, 0, false, aiSymbol, playerSymbol, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(board, depth, isMaximizing, aiSymbol, playerSymbol, alpha, beta) {
  const winInfo = checkWinner(board);
  if (winInfo) {
    return winInfo.winner === aiSymbol ? 10 - depth : depth - 10;
  }
  if (isBoardFull(board)) {
    return 0;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of getAvailableMoves(board)) {
      board[move] = aiSymbol;
      const evaluation = minimax(board, depth + 1, false, aiSymbol, playerSymbol, alpha, beta);
      board[move] = '';
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of getAvailableMoves(board)) {
      board[move] = playerSymbol;
      const evaluation = minimax(board, depth + 1, true, aiSymbol, playerSymbol, alpha, beta);
      board[move] = '';
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Main AI decision engine dispatcher based on difficulty setting.
 * @param {Array<string>} board
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @param {string} aiSymbol
 * @returns {number}
 */
export function getAIMove(board, difficulty = 'medium', aiSymbol = 'O') {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return getEasyMove(board);
    case 'hard':
      return getHardMove(board, aiSymbol);
    case 'medium':
    default:
      return getMediumMove(board, aiSymbol);
  }
}
