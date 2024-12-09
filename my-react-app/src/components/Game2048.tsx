import { useEffect, useRef, useState } from 'react';
import type { GameState, Direction, Position } from '../types/game';
import styles from './Game2048.module.css';

const GRID_SIZE = 4;
const SWIPE_THRESHOLD = 30; // 降低滑动阈值，提高灵敏度
const HIGH_SCORE_KEY = '2048_high_score';

export default function Game2048() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0)),
    score: 0,
    gameOver: false,
    won: false,
  });
  const [highScore, setHighScore] = useState<number>(() =>
    parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0')
  );

  const touchStartRef = useRef<Position | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const newBoard = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0));
    addNewTile(newBoard);
    addNewTile(newBoard);
    setGameState({
      board: newBoard,
      score: 0,
      gameOver: false,
      won: false,
    });
  };

  const addNewTile = (board: number[][]) => {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ x: i, y: j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const moveBoard = (direction: Direction) => {
    const newBoard = JSON.parse(JSON.stringify(gameState.board));
    let moved = false;
    let newScore = 0;

    const rotateBoard = (times: number) => {
      for (let t = 0; t < times; t++) {
        const rotated = Array(GRID_SIZE)
          .fill(null)
          .map(() => Array(GRID_SIZE).fill(0));
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            rotated[j][GRID_SIZE - 1 - i] = newBoard[i][j];
          }
        }
        for (let i = 0; i < GRID_SIZE; i++) {
          newBoard[i] = [...rotated[i]];
        }
      }
    };

    const moveLeft = () => {
      for (let i = 0; i < GRID_SIZE; i++) {
        let row = newBoard[i].filter((cell: number) => cell !== 0);
        for (let j = 0; j < row.length - 1; j++) {
          if (row[j] === row[j + 1]) {
            row[j] *= 2;
            newScore += row[j];
            row[j + 1] = 0;
            moved = true;
            if (row[j] === 2048) {
              setGameState((prev) => ({ ...prev, won: true }));
            }
          }
        }
        row = row.filter((cell: number) => cell !== 0);
        while (row.length < GRID_SIZE) row.push(0);
        if (row.join(',') !== newBoard[i].join(',')) moved = true;
        newBoard[i] = row;
      }
    };

    switch (direction) {
      case 'left':
        moveLeft();
        break;
      case 'right':
        rotateBoard(2);
        moveLeft();
        rotateBoard(2);
        break;
      case 'up':
        rotateBoard(3);
        moveLeft();
        rotateBoard(1);
        break;
      case 'down':
        rotateBoard(1);
        moveLeft();
        rotateBoard(3);
        break;
    }

    return { board: newBoard, score: newScore, moved };
  };

  const handleMove = (direction: Direction) => {
    if (gameState.gameOver || gameState.won) return;

    const { board: newBoard, score: newScore, moved } = moveBoard(direction);
    if (moved) {
      // 添加触觉反馈
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }

      addNewTile(newBoard);
      const newState = {
        board: newBoard,
        score: gameState.score + newScore,
        gameOver: isGameOver(newBoard),
        won: hasWon(newBoard),
      };

      // 更新最高分
      if (newState.score > highScore) {
        setHighScore(newState.score);
        localStorage.setItem(HIGH_SCORE_KEY, newState.score.toString());
      }

      setGameState(newState);
    }
  };

  const isGameOver = (board: number[][]) => {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (
          (i < GRID_SIZE - 1 && board[i][j] === board[i + 1][j]) ||
          (j < GRID_SIZE - 1 && board[i][j] === board[i][j + 1])
        ) {
          return false;
        }
      }
    }

    return true;
  };

  const hasWon = (board: number[][]) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 2048) return true;
      }
    }
    return false;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        handleMove('up');
        break;
      case 'ArrowDown':
        handleMove('down');
        break;
      case 'ArrowLeft':
        handleMove('left');
        break;
      case 'ArrowRight':
        handleMove('right');
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (Math.max(absDeltaX, absDeltaY) > SWIPE_THRESHOLD) {
      if (absDeltaX > absDeltaY) {
        handleMove(deltaX > 0 ? 'right' : 'left');
      } else {
        handleMove(deltaY > 0 ? 'down' : 'up');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h1>2048</h1>
          <img
            src={`${import.meta.env.BASE_URL}qr_code.webp`}
            alt="QR Code"
            className={styles.qrCode}
          />
        </div>
        <div className={styles.scores}>
          <div className={styles.scoreContainer}>
            <div className={styles.scoreLabel}>SCORE</div>
            <div className={styles.score}>{gameState.score}</div>
          </div>
          <div className={styles.scoreContainer}>
            <div className={styles.scoreLabel}>BEST</div>
            <div className={styles.score}>{highScore}</div>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button onClick={initGame} className={styles.newGameBtn}>
          New Game
        </button>
      </div>

      <div
        ref={boardRef}
        className={styles.gameBoard}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {gameState.board.map((row, i) =>
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

      <div className={styles.instructions}>
        <p>↑↓←→ 键盘方向键 或 滑动屏幕 移动方块</p>
      </div>

      {(gameState.gameOver || gameState.won) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{gameState.won ? '🎉 胜利！' : '💫 游戏结束'}</h2>
            <p>得分: {gameState.score}</p>
            <p>最高分: {highScore}</p>
            <button onClick={initGame}>再来一局</button>
          </div>
        </div>
      )}
    </div>
  );
}
