import React from 'react';

const GameBoard = ({
  board = Array(9).fill(null),
  onCellClick,
  disabled = false,
  winningLine = null,
  highlightSymbol = null,
}) => {
  return (
    <div className="gameboard-container">
      <div className="gameboard-grid">
        {board.map((cell, index) => {
          const isWinningCell = winningLine && winningLine.includes(index);
          const isOccupied = cell !== null;

          return (
            <button
              key={index}
              className={`game-cell ${isOccupied ? 'occupied' : ''} ${isWinningCell ? 'winning-cell' : ''}`}
              onClick={() => !disabled && !isOccupied && onCellClick(index)}
              disabled={disabled || isOccupied}
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
    </div>
  );
};

export default GameBoard;
