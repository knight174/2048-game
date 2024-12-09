import React, { useEffect, useRef } from 'react';
import { Header } from './Header';
import { Controls } from './Controls';
import { Board } from './Board';
import { use2048Game } from '../../hooks/use2048Game';
import { Position } from '../../types/game';
import { SWIPE_THRESHOLD } from '../../constants/game';
import styles from './styles.module.css';

export default function Game2048() {
  const { gameState, highScore, initGame, handleMove } = use2048Game();
  const touchStartRef = useRef<Position | null>(null);

  // 初始化游戏
  useEffect(() => {
    initGame();
  }, []);

  // 监听键盘事件
  useEffect(() => {
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
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
      <Header score={gameState.score} highScore={highScore} />
      <Controls onNewGame={initGame} />
      <Board
        board={gameState.board}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
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
