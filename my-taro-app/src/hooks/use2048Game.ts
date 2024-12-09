import { useState, useCallback } from "react";
import Taro from "@tarojs/taro";
import {
  GameState,
  Direction,
  Position,
  GRID_SIZE,
  HIGH_SCORE_KEY,
} from "../constants/game";

export function use2048Game() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0)),
    score: 0,
    gameOver: false,
    won: false,
  });

  const [highScore, setHighScore] = useState(() => {
    const stored = Taro.getStorageSync(HIGH_SCORE_KEY);
    return stored ? parseInt(stored) : 0;
  });

  const addNewTile = useCallback((board: number[][]) => {
    const emptyCells: Position[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 0) {
          emptyCells.push({ x: i, y: j });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { x, y } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[x][y] = Math.random() < 0.9 ? 2 : 4;
    }
  }, []);

  const moveBoard = useCallback(
    (direction: Direction) => {
      const newBoard = JSON.parse(JSON.stringify(gameState.board));
      let moved = false;
      let newScore = gameState.score;

      const moveInDirection = () => {
        for (let i = 0; i < GRID_SIZE; i++) {
          const row = [];
          let currentPos = 0;

          // 收集非零数字
          for (let j = 0; j < GRID_SIZE; j++) {
            const value =
              direction === "left" || direction === "right"
                ? newBoard[i][j]
                : newBoard[j][i];
            if (value !== 0) {
              row.push(value);
            }
          }

          // 合并相同数字
          for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
              row[j] *= 2;
              newScore += row[j];
              row.splice(j + 1, 1);
              moved = true;
            }
          }

          // 填充零
          while (row.length < GRID_SIZE) {
            direction === "left" || direction === "up"
              ? row.push(0)
              : row.unshift(0);
          }

          // 更新板子
          for (let j = 0; j < GRID_SIZE; j++) {
            if (direction === "left" || direction === "right") {
              if (newBoard[i][j] !== row[j]) moved = true;
              newBoard[i][j] = row[j];
            } else {
              if (newBoard[j][i] !== row[j]) moved = true;
              newBoard[j][i] = row[j];
            }
          }
        }
      };

      // 根据方向旋转板子
      if (direction === "up" || direction === "down") {
        moveInDirection();
      } else {
        moveInDirection();
      }

      return { newBoard, moved, newScore };
    },
    [gameState.board, gameState.score]
  );

  const checkWin = useCallback((board: number[][]) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 2048) return true;
      }
    }
    return false;
  }, []);

  const isGameOver = useCallback((board: number[][]) => {
    // 检查是否有空格
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // 检查是否有可合并的相邻格子
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        // 检查右侧
        if (j < GRID_SIZE - 1 && board[i][j] === board[i][j + 1]) return false;
        // 检查下方
        if (i < GRID_SIZE - 1 && board[i][j] === board[i + 1][j]) return false;
      }
    }

    return true;
  }, []);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameState.gameOver || gameState.won) return;

      const { newBoard, moved, newScore } = moveBoard(direction);
      if (moved) {
        addNewTile(newBoard);
        const gameOver = isGameOver(newBoard);
        const won = checkWin(newBoard);

        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          score: newScore,
          gameOver: gameOver,
          won: won,
        }));

        if (newScore > highScore) {
          setHighScore(newScore);
          Taro.setStorageSync(HIGH_SCORE_KEY, newScore.toString());
        }

        console.log("Game Status:", {
          moved,
          gameOver: gameOver,
          won: won,
          score: newScore,
        });
      }
    },
    [gameState, highScore, moveBoard, addNewTile, isGameOver, checkWin]
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
    console.log("initGame", gameState);
  }, [addNewTile]);

  return {
    gameState,
    highScore,
    initGame,
    handleMove,
  };
}
