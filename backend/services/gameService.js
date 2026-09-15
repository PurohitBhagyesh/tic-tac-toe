/**
 * Backend Authoritative Game Service
 * Handles match scoring, turn validation, win detection, and round progression.
 */

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

class GameService {
  /**
   * Check board state for winner, draw, or ongoing status.
   * @param {Array<string>} board - 9 element array
   * @returns {Object} { isFinished, winner, winPattern, isDraw }
   */
  evaluateBoard(board) {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          isFinished: true,
          winner: board[a],
          winPattern: combination,
          isDraw: false
        };
      }
    }

    const isDraw = board.every(cell => cell !== '' && cell !== null);
    if (isDraw) {
      return {
        isFinished: true,
        winner: null,
        winPattern: null,
        isDraw: true
      };
    }

    return {
      isFinished: false,
      winner: null,
      winPattern: null,
      isDraw: false
    };
  }

  /**
   * Validates if a requested move is legal.
   * @param {Array<string>} board
   * @param {number} cellIndex
   * @param {string} playerSymbol
   * @param {string} turnSymbol
   * @returns {Object} { valid: boolean, reason?: string }
   */
  validateMove(board, cellIndex, playerSymbol, turnSymbol) {
    if (cellIndex < 0 || cellIndex > 8) {
      return { valid: false, reason: 'Invalid board position' };
    }

    if (board[cellIndex] !== '' && board[cellIndex] !== null) {
      return { valid: false, reason: 'Cell already occupied' };
    }

    if (playerSymbol !== turnSymbol) {
      return { valid: false, reason: 'Not player turn' };
    }

    return { valid: true };
  }

  /**
   * Advances match scores and determines tournament status.
   * @param {Object} currentScores - { p1Score, p2Score }
   * @param {string|null} roundWinnerSymbol - 'X', 'O', or null
   * @param {number} currentRound - Current round number (1..maxRounds)
   * @param {number} maxRounds - Total match rounds (default 5)
   * @returns {Object}
   */
  processRoundResult(currentScores, roundWinnerSymbol, currentRound, maxRounds = 5) {
    const updatedScores = { ...currentScores };

    if (roundWinnerSymbol === 'X') {
      updatedScores.p1Score += 1;
    } else if (roundWinnerSymbol === 'O') {
      updatedScores.p2Score += 1;
    }

    const isMatchComplete = currentRound >= maxRounds;
    let matchWinner = null;

    if (isMatchComplete) {
      if (updatedScores.p1Score > updatedScores.p2Score) {
        matchWinner = 'X';
      } else if (updatedScores.p2Score > updatedScores.p1Score) {
        matchWinner = 'O';
      } else {
        matchWinner = 'draw';
      }
    }

    return {
      updatedScores,
      isMatchComplete,
      matchWinner,
      nextRound: isMatchComplete ? currentRound : currentRound + 1
    };
  }
}

module.exports = new GameService();
