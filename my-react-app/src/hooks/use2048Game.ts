import { useState, useCallback } from 'react';
import { GameState, Direction, GameMove } from '../types/game';
import {
  GRID_SIZE,
  HIGH_SCORE_KEY,
  WINNING_SCORE,
  INITIAL_GAME_STATE,
} from '../constants/game';

export function use2048Game() {
  const [gameState, setGameState] = useState<GameState>({
    ...INITIAL_GAME_STATE,
  });
  const [highScore, setHighScore] = useState<number>(() =>
    parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0')
  );

  const addNewTile = useCallback((board: number[][]) => {
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
  }, []);

  const moveBoard = useCallback(
    (direction: Direction): GameMove => {
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
            for (let j = 0; j < GRID_SIZE; j++) {
              newBoard[i][j] = rotated[i][j];
            }
          }
        }
      };

      const moveLeft = () => {
        for (let i = 0; i < GRID_SIZE; i++) {
          let column = 0;
          for (let j = 1; j < GRID_SIZE; j++) {
            if (newBoard[i][j] !== 0) {
              if (newBoard[i][column] === 0) {
                newBoard[i][column] = newBoard[i][j];
                newBoard[i][j] = 0;
                moved = true;
              } else if (newBoard[i][column] === newBoard[i][j]) {
                newBoard[i][column] *= 2;
                newScore += newBoard[i][column];
                newBoard[i][j] = 0;
                column++;
                moved = true;
              } else {
                column++;
                if (column !== j) {
                  newBoard[i][column] = newBoard[i][j];
                  newBoard[i][j] = 0;
                  moved = true;
                }
              }
            }
          }
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
    },
    [gameState.board]
  );

  const isGameOver = useCallback((board: number[][]) => {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 1; j++) {
        if (board[i][j] === board[i][j + 1]) return false;
        if (board[j][i] === board[j + 1][i]) return false;
      }
    }

    return true;
  }, []);

  const hasWon = useCallback((board: number[][]) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === WINNING_SCORE) return true;
      }
    }
    return false;
  }, []);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameState.gameOver || gameState.won) return;

      const { board: newBoard, score: newScore, moved } = moveBoard(direction);
      if (moved) {
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

        if (newState.score > highScore) {
          setHighScore(newState.score);
          localStorage.setItem(HIGH_SCORE_KEY, newState.score.toString());
        }

        setGameState(newState);
      }
    },
    [gameState, highScore, moveBoard, addNewTile, isGameOver, hasWon]
  );

  const initGame = useCallback(() => {
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
  }, [addNewTile]);

  return {
    gameState,
    highScore,
    initGame,
    handleMove,
  };
}
