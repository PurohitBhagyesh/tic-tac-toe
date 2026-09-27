export const WINNING_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWinner(board) {
  for (const pattern of WINNING_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], pattern };
    }
  }
  if (board.every((cell) => cell !== '')) {
    return { winner: 'DRAW', pattern: null };
  }
  return null;
}

export function getAvailableMoves(board) {
  return board
    .map((val, idx) => (val === '' ? idx : null))
    .filter((val) => val !== null);
}

export function getRandomMove(board) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}

export function getMediumMove(board, aiSymbol = 'O', userSymbol = 'X') {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  for (const move of available) {
    const tempBoard = [...board];
    tempBoard[move] = aiSymbol;
    if (checkWinner(tempBoard)?.winner === aiSymbol) {
      return move;
    }
  }

  for (const move of available) {
    const tempBoard = [...board];
    tempBoard[move] = userSymbol;
    if (checkWinner(tempBoard)?.winner === userSymbol) {
      return move;
    }
  }

  if (available.includes(4)) return 4;

  const corners = [0, 2, 6, 8].filter((c) => available.includes(c));
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  return getRandomMove(board);
}

function minimax(board, depth, isMaximizing, aiSymbol, userSymbol) {
  const result = checkWinner(board);
  if (result) {
    if (result.winner === aiSymbol) return 10 - depth;
    if (result.winner === userSymbol) return depth - 10;
    if (result.winner === 'DRAW') return 0;
  }

  const available = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of available) {
      board[move] = aiSymbol;
      const score = minimax(board, depth + 1, false, aiSymbol, userSymbol);
      board[move] = '';
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of available) {
      board[move] = userSymbol;
      const score = minimax(board, depth + 1, true, aiSymbol, userSymbol);
      board[move] = '';
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}

export function getMinimaxMove(board, aiSymbol = 'O', userSymbol = 'X') {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  let bestScore = -Infinity;
  let bestMove = available[0];

  for (const move of available) {
    const boardCopy = [...board];
    boardCopy[move] = aiSymbol;
    const score = minimax(boardCopy, 0, false, aiSymbol, userSymbol);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function getAIMove(board, difficulty = 'hard', aiSymbol = 'O', userSymbol = 'X') {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return getRandomMove(board);
    case 'medium':
      return getMediumMove(board, aiSymbol, userSymbol);
    case 'hard':
    default:
      return getMinimaxMove(board, aiSymbol, userSymbol);
  }
}
