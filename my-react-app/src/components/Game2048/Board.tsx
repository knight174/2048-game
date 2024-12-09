import React from 'react';
import styles from './styles.module.css';

interface BoardProps {
  board: number[][];
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function Board({ board, onTouchStart, onTouchEnd }: BoardProps) {
  return (
    <div
      className={styles.gameBoard}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {board.map((row, i) =>
        row.map((cell, j) => (
          <div
            key={`${i}-${j}`}
            className={`${styles.tile} ${
              cell > 0 ? styles[`tile-${cell}`] : ''
            }`}
          >
            {cell || ''}
          </div>
        ))
      )}
    </div>
  );
}
