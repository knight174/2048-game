export const GRID_SIZE = 4;
export const SWIPE_THRESHOLD = 30;
export const HIGH_SCORE_KEY = '2048_high_score';
export const WINNING_SCORE = 2048;

export const INITIAL_GAME_STATE = {
  board: Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(0)),
  score: 0,
  gameOver: false,
  won: false,
};

export const TILE_COLORS = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
} as const;
