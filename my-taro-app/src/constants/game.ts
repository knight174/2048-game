export const GRID_SIZE = 4;
export const WINNING_SCORE = 2048;
export const SWIPE_THRESHOLD = 30;
export const HIGH_SCORE_KEY = "2048_high_score";

export type Direction = "up" | "down" | "left" | "right";

export interface GameState {
  board: number[][];
  score: number;
  gameOver: boolean;
  won: boolean;
}

export interface Position {
  x: number;
  y: number;
}
