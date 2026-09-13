export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

/**
 * Check if a board has a winner
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
 * Check if the board is full with no winner
 */
export const checkDraw = (board) => {
  const isFull = board.every(cell => cell !== null);
  const win = checkWinner(board);
  return isFull && !win;
};

/**
 * Get all available cell indices (0..8)
 */
export const getAvailableMoves = (board) => {
  const moves = [];
  board.forEach((cell, index) => {
    if (cell === null) moves.push(index);
  });
  return moves;
};

/**
 * Reset empty 3x3 board
 */
export const resetBoard = () => Array(9).fill(null);

/* -------------------------------------------------------------
   SINGLEPLAYER AI IMPLEMENTATIONS (Easy, Medium, Hard Minimax)
------------------------------------------------------------- */

/**
 * 1. Easy AI: Picks a random empty cell
 */
export const getEasyMove = (board) => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
};

/**
 * 2. Medium AI:
 * - Tries to win immediately
 * - Blocks opponent if opponent is about to win
 * - Takes center or corners if open
 * - Otherwise random
 */
export const getMediumMove = (board, aiSymbol = 'O', humanSymbol = 'X') => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  // 1. Check if AI can win in this turn
  for (const move of availableMoves) {
    const tempBoard = [...board];
    tempBoard[move] = aiSymbol;
    if (checkWinner(tempBoard)) {
      return move;
    }
  }

  // 2. Check if Human can win next turn and block them
  for (const move of availableMoves) {
    const tempBoard = [...board];
    tempBoard[move] = humanSymbol;
    if (checkWinner(tempBoard)) {
      return move;
    }
  }

  // 3. Take center if free (70% probability for realistic medium feel)
  if (board[4] === null && Math.random() > 0.3) {
    return 4;
  }

  // 4. Take corners if free
  const corners = [0, 2, 6, 8].filter(idx => board[idx] === null);
  if (corners.length > 0 && Math.random() > 0.4) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Fallback random
  return getEasyMove(board);
};

/**
 * 3. Hard AI (Minimax Algorithm) - Unbeatable optimal play
 */
export const getHardMove = (board, aiSymbol = 'O', humanSymbol = 'X') => {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  // Minimax recursive evaluator
  const minimax = (currentBoard, depth, isMaximizing) => {
    const winResult = checkWinner(currentBoard);
    if (winResult) {
      if (winResult.winner === aiSymbol) return 10 - depth;
      if (winResult.winner === humanSymbol) return depth - 10;
    }
    if (checkDraw(currentBoard)) return 0;

    const moves = getAvailableMoves(currentBoard);

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const move of moves) {
        currentBoard[move] = aiSymbol;
        const score = minimax(currentBoard, depth + 1, false);
        currentBoard[move] = null;
        bestScore = Math.max(score, bestScore);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const move of moves) {
        currentBoard[move] = humanSymbol;
        const score = minimax(currentBoard, depth + 1, true);
        currentBoard[move] = null;
        bestScore = Math.min(score, bestScore);
      }
      return bestScore;
    }
  };

  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    board[move] = aiSymbol;
    const score = minimax(board, 0, false);
    board[move] = null;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
};

/**
 * Unified AI move dispatcher
 */
export const getAIMove = (board, difficulty = 'medium', aiSymbol = 'O', humanSymbol = 'X') => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return getEasyMove(board);
    case 'hard':
      return getHardMove(board, aiSymbol, humanSymbol);
    case 'medium':
    default:
      return getMediumMove(board, aiSymbol, humanSymbol);
  }
};
