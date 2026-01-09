// ぷよの色
export type PuyoColor = 'red' | 'green' | 'blue' | 'yellow' | 'purple' | null;

// ぷよの位置
export interface Position {
  x: number;
  y: number;
}

// 落下中のぷよペア
export interface FallingPuyo {
  main: { pos: Position; color: PuyoColor };
  sub: { pos: Position; color: PuyoColor };
  rotation: number; // 0: 上, 1: 右, 2: 下, 3: 左
}

// ゲームボードのセル
export interface Cell {
  color: PuyoColor;
  isConnected?: boolean;
  willPop?: boolean;
}

// ゲーム状態
export interface GameState {
  board: Cell[][];
  currentPuyo: FallingPuyo | null;
  nextPuyo: { main: PuyoColor; sub: PuyoColor };
  score: number;
  gameOver: boolean;
  isPaused: boolean;
  chain: number;
  isPopping: boolean;
}

// 方向
export type Direction = 'left' | 'right' | 'down';
export type Rotation = 'clockwise' | 'counterclockwise';
