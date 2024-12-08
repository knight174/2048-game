export interface Cell {
  value: number;
  id: string;
  merged?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  board: Cell[][];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
}

export type Direction = 'up' | 'down' | 'left' | 'right';
