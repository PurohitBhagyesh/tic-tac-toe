export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function checkWinner(board) {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return null;
}

export function checkDraw(board) {
  const winnerInfo = checkWinner(board);
  if (winnerInfo) return false;
  return board.every((cell) => cell !== '' && cell !== null && cell !== undefined);
}

export function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (!board[i] || board[i] === '') {
      moves.push(i);
    }
  }
  return moves;
}

export function getAIMove(board, aiSymbol = 'O', difficulty = 'hard') {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;

  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';

  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  if (difficulty === 'medium') {
    for (const move of availableMoves) {
      const boardCopy = [...board];
      boardCopy[move] = aiSymbol;
      if (checkWinner(boardCopy)) return move;
    }

    for (const move of availableMoves) {
      const boardCopy = [...board];
      boardCopy[move] = humanSymbol;
      if (checkWinner(boardCopy)) return move;
    }

    if (board[4] === '' || !board[4]) return 4;

    const corners = [0, 2, 6, 8].filter((i) => availableMoves.includes(i));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  return getBestMoveMinimax(board, aiSymbol, humanSymbol);
}

function getBestMoveMinimax(board, aiSymbol, humanSymbol) {
  const availableMoves = getAvailableMoves(board);
  let bestScore = -Infinity;
  let bestMove = availableMoves[0];

  for (const move of availableMoves) {
    const boardCopy = [...board];
    boardCopy[move] = aiSymbol;
    const score = minimax(boardCopy, 0, false, aiSymbol, humanSymbol, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(board, depth, isMaximizing, aiSymbol, humanSymbol, alpha, beta) {
  const winInfo = checkWinner(board);
  if (winInfo) {
    return winInfo.winner === aiSymbol ? 10 - depth : depth - 10;
  }
  if (checkDraw(board)) {
    return 0;
  }

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of availableMoves) {
      board[move] = aiSymbol;
      const evaluation = minimax(board, depth + 1, false, aiSymbol, humanSymbol, alpha, beta);
      board[move] = '';
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of availableMoves) {
      board[move] = humanSymbol;
      const evaluation = minimax(board, depth + 1, true, aiSymbol, humanSymbol, alpha, beta);
      board[move] = '';
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
