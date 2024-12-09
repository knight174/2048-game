export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  board: number[][];
  score: number;
  gameOver: boolean;
  won: boolean;
}

export interface GameMove {
  board: number[][];
  score: number;
  moved: boolean;
}
