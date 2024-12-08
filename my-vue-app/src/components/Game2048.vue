<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { GameState, Direction, Position } from '../types/game';

const GRID_SIZE = 4;
const SWIPE_THRESHOLD = 50; // 触摸滑动的最小距离

// 游戏状态
const gameState = ref<GameState>({
  board: Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => ({ value: 0, id: crypto.randomUUID() }))
    ),
  score: 0,
  bestScore: parseInt(localStorage.getItem('bestScore') || '0'),
  gameOver: false,
  won: false,
});

// 触摸事件相关状态
const touchStartX = ref(0);
const touchStartY = ref(0);

// 重置游戏
const initGame = () => {
  // 初始化游戏状态
  gameState.value = {
    board: Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({ value: 0, id: crypto.randomUUID() }))
      ),
    score: 0,
    bestScore: parseInt(localStorage.getItem('bestScore') || '0'),
    gameOver: false,
    won: false,
  };

  // 添加两个初始瓦片
  addNewTile();
  addNewTile();
};

// 获取空白位置
const getEmptyCells = (): Position[] => {
  const emptyCells: Position[] = [];
  gameState.value.board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell.value === 0) {
        emptyCells.push({ x, y });
      }
    });
  });
  return emptyCells;
};

// 添加新瓦片
const addNewTile = () => {
  const emptyCells = getEmptyCells();
  if (emptyCells.length > 0) {
    const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    gameState.value.board[y][x] = {
      value: Math.random() < 0.9 ? 2 : 4,
      id: crypto.randomUUID(),
    };
  }
};

// 更新最高分
const updateBestScore = (score: number) => {
  if (score > gameState.value.bestScore) {
    gameState.value.bestScore = score;
    localStorage.setItem('bestScore', score.toString());
  }
};

// 检查是否还能移动
const canMove = () => {
  // 检查是否有空格
  if (getEmptyCells().length > 0) return true;

  // 检查是否有相邻的相同数字
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      const current = gameState.value.board[i][j].value;
      const hasEqualNeighbor =
        (i < GRID_SIZE - 1 &&
          gameState.value.board[i + 1][j].value === current) ||
        (j < GRID_SIZE - 1 &&
          gameState.value.board[i][j + 1].value === current);
      if (hasEqualNeighbor) return true;
    }
  }
  return false;
};

// 移动瓦片的核心逻辑
const moveTiles = (direction: Direction) => {
  const newBoard = JSON.parse(JSON.stringify(gameState.value.board));
  let moved = false;
  let score = gameState.value.score;

  // 清除之前的合并标记
  newBoard.forEach((row: number[]) =>
    row.forEach((cell) => (cell.merged = false))
  );

  // 获取遍历方向和范围
  const getTraversalOrder = () => {
    const isVertical = direction === 'up' || direction === 'down';
    const isReverse = direction === 'right' || direction === 'down';
    const primary = Array(GRID_SIZE)
      .fill(0)
      .map((_, i) => i);
    const secondary = isReverse ? [...primary].reverse() : primary;
    return { isVertical, primary, secondary };
  };

  // 移动单个瓦片
  const moveTile = (fromPos: Position, toPos: Position) => {
    if (newBoard[toPos.y][toPos.x].value === 0) {
      newBoard[toPos.y][toPos.x] = newBoard[fromPos.y][fromPos.x];
      newBoard[fromPos.y][fromPos.x] = { value: 0, id: crypto.randomUUID() };
      moved = true;
      return true;
    }
    return false;
  };

  // 合并瓦片
  const mergeTiles = (fromPos: Position, toPos: Position) => {
    const fromCell = newBoard[fromPos.y][fromPos.x];
    const toCell = newBoard[toPos.y][toPos.x];

    if (
      !toCell.merged &&
      !fromCell.merged &&
      toCell.value === fromCell.value &&
      toCell.value !== 0
    ) {
      const newValue = toCell.value * 2;
      newBoard[toPos.y][toPos.x] = {
        value: newValue,
        id: crypto.randomUUID(),
        merged: true,
      };
      newBoard[fromPos.y][fromPos.x] = { value: 0, id: crypto.randomUUID() };
      score += newValue;
      moved = true;

      if (newValue === 2048) {
        gameState.value.won = true;
      }
      return true;
    }
    return false;
  };

  const { isVertical, primary, secondary } = getTraversalOrder();

  // 执行移动
  primary.forEach((i) => {
    secondary.forEach((j) => {
      const pos = isVertical ? { x: i, y: j } : { x: j, y: i };
      if (newBoard[pos.y][pos.x].value === 0) return;

      const next = { ...pos };
      const step = direction === 'right' || direction === 'down' ? 1 : -1;
      const coord = isVertical ? 'y' : 'x';

      // 移动到最远的空位置
      while (
        next[coord] + step >= 0 &&
        next[coord] + step < GRID_SIZE &&
        newBoard[isVertical ? next.y + step : next.y][
          isVertical ? next.x : next.x + step
        ].value === 0
      ) {
        next[coord] += step;
        moveTile(pos, next);
      }

      // 尝试合并
      if (next[coord] + step >= 0 && next[coord] + step < GRID_SIZE) {
        const mergePos = { ...next };
        mergePos[coord] += step;
        mergeTiles(pos, mergePos);
      }
    });
  });

  if (moved) {
    gameState.value.board = newBoard;
    gameState.value.score = score;
    updateBestScore(score);
    addNewTile();

    if (!canMove()) {
      gameState.value.gameOver = true;
    }
  }
};

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (gameState.value.gameOver) return;

  const keyToDirection: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  };

  const direction = keyToDirection[event.key];
  if (direction) {
    event.preventDefault();
    moveTiles(direction);
  }
};

// 处理触摸事件
const handleTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.touches[0].clientX;
  touchStartY.value = event.touches[0].clientY;
};

const handleTouchEnd = (event: TouchEvent) => {
  if (gameState.value.gameOver) return;

  const deltaX = event.changedTouches[0].clientX - touchStartX.value;
  const deltaY = event.changedTouches[0].clientY - touchStartY.value;

  if (Math.abs(deltaX) < SWIPE_THRESHOLD && Math.abs(deltaY) < SWIPE_THRESHOLD)
    return;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    moveTiles(deltaX > 0 ? 'right' : 'left');
  } else {
    moveTiles(deltaY > 0 ? 'down' : 'up');
  }
};

onMounted(() => {
  initGame();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="container">
    <div class="header">
      <div class="title-container">
        <h1>2048</h1>
        <img src="/qr_code.webp" alt="QR Code" class="qr-code" />
      </div>
      <div class="score-container">
        <div class="score-label">Score</div>
        <div class="score">{{ gameState.score }}</div>
      </div>
    </div>

    <div
      class="game-board"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <template v-for="(row, y) in gameState.board" :key="y">
        <div
          v-for="(cell, x) in row"
          :key="`${y}-${x}`"
          class="tile"
          :class="[
            cell.value ? `tile-${cell.value}` : '',
            cell.merged ? 'tile-merged' : '',
            cell.isNew ? 'tile-new' : '',
          ]"
        >
          {{ cell.value || '' }}
        </div>
      </template>
    </div>

    <div class="instructions">
      Use arrow keys to move tiles. Combine matching tiles to reach 2048!
    </div>

    <!-- Game Over Modal -->
    <div class="modal" v-if="gameState.gameOver">
      <div class="modal-content">
        <h2>Game Over!</h2>
        <p>Your final score: {{ gameState.score }}</p>
        <button @click="initGame">Play Again</button>
      </div>
    </div>

    <!-- Win Modal -->
    <div class="modal" v-if="gameState.won">
      <div class="modal-content">
        <h2>You Win!</h2>
        <p>Congratulations! You've reached 2048!</p>
        <button @click="initGame">Play Again</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  text-align: center;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.qr-code {
  height: 90px;
  width: auto;
  object-fit: contain;
}

h1 {
  color: #776e65;
  font-size: 80px;
  margin: 0;
}

.score-container {
  background-color: #bbada0;
  color: white;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
}

.score-label {
  font-size: 13px;
  text-transform: uppercase;
}

.score {
  font-size: 24px;
  font-weight: bold;
}

.game-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 15px;
  background-color: #bbada0;
  border-radius: 5px;
  padding: 15px;
  width: 500px;
  height: 500px;
  margin: 0 auto;
  position: relative;
  touch-action: none;
}

.tile {
  background-color: #cdc1b4;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  font-weight: bold;
  color: #776e65;
  transition: all 0.2s ease-in-out;
  width: 100%;
  height: 100%;
}

.tile-2 {
  background-color: #eee4da;
}
.tile-4 {
  background-color: #ede0c8;
}
.tile-8 {
  background-color: #f2b179;
  color: white;
}
.tile-16 {
  background-color: #f59563;
  color: white;
}
.tile-32 {
  background-color: #f67c5f;
  color: white;
}
.tile-64 {
  background-color: #f65e3b;
  color: white;
}
.tile-128 {
  background-color: #edcf72;
  color: white;
  font-size: 35px;
}
.tile-256 {
  background-color: #edcc61;
  color: white;
  font-size: 35px;
}
.tile-512 {
  background-color: #edc850;
  color: white;
  font-size: 35px;
}
.tile-1024 {
  background-color: #edc53f;
  color: white;
  font-size: 30px;
}
.tile-2048 {
  background-color: #edc22e;
  color: white;
  font-size: 30px;
}

.instructions {
  margin-top: 20px;
  color: #776e65;
  font-size: 16px;
}

.tile-new {
  animation: appear 0.2s ease-in-out;
}

.tile-merged {
  animation: merge 0.2s ease-in-out;
}

@keyframes appear {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes merge {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal:not([hidden]) {
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #faf8ef;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-content h2 {
  color: #776e65;
  font-size: 32px;
  margin: 0 0 20px 0;
}

.modal-content p {
  color: #776e65;
  font-size: 20px;
  margin-bottom: 25px;
}

button {
  background-color: #8f7a66;
  color: white;
  border: none;
  padding: 10px 30px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #7f6a56;
}

@media (max-width: 600px) {
  .container {
    padding: 10px;
  }

  h1 {
    font-size: 60px;
  }

  .qr-code {
    height: 70px;
  }

  .game-board {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    gap: 10px;
    padding: 10px;
  }

  .tile {
    font-size: 35px;
  }

  .tile-128,
  .tile-256,
  .tile-512 {
    font-size: 30px;
  }

  .tile-1024,
  .tile-2048 {
    font-size: 25px;
  }
}
</style>
