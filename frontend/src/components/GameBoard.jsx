import React from 'react';
import { playSound } from '../utils/sound';

const GameBoard = ({
  board = Array(9).fill(null),
  onCellClick,
  disabled = false,
  winningLine = null,
  overlay = null,
}) => {
  const handleClick = (index) => {
    if (disabled || board[index] !== null || overlay) return;
    onCellClick(index);
  };

  const isBlurred = Boolean(overlay);

  return (
    <div className="gameboard-container">
      <div className={`gameboard-grid ${isBlurred ? 'board-blurred' : ''}`}>
        {board.map((cell, index) => {
          const isWinningCell = winningLine && winningLine.includes(index);
          const isOccupied = cell !== null;

          return (
            <button
              key={index}
              className={`game-cell ${isOccupied ? 'occupied' : ''} ${isWinningCell ? 'winning-cell' : ''}`}
              onClick={() => handleClick(index)}
              disabled={disabled || isOccupied || isBlurred}
              aria-label={`Cell ${index + 1}, ${cell ? cell : 'Empty'}`}
            >
              {cell === 'X' && (
                <span className="cell-symbol cell-symbol-x">X</span>
              )}
              {cell === 'O' && (
                <span className="cell-symbol cell-symbol-o">O</span>
              )}
            </button>
          );
        })}
      </div>

      {overlay && (
        <div className="gameboard-overlay">
          <div className="gameboard-overlay-card">
            {overlay}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
