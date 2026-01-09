import type { PuyoColor } from './types';

// ボードサイズ
export const BOARD_WIDTH = 6;
export const BOARD_HEIGHT = 13; // 実際の表示は12行、1行は隠れ行
export const VISIBLE_HEIGHT = 12;

// ゲーム設定
export const INITIAL_DROP_SPEED = 1000; // ミリ秒
export const SOFT_DROP_SPEED = 50;
export const MIN_CONNECT = 4; // 消えるために必要な連結数

// ぷよの色一覧
export const PUYO_COLORS: PuyoColor[] = ['red', 'green', 'blue', 'yellow', 'purple'];

// 色のスタイル（CSS用）
export const COLOR_MAP: Record<string, string> = {
  red: '#ff4444',
  green: '#44ff44',
  blue: '#4444ff',
  yellow: '#ffff44',
  purple: '#ff44ff',
};

// スコア計算用
export const BASE_SCORE = 10;
export const CHAIN_BONUS = [0, 0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480, 512];
export const CONNECTION_BONUS = [0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 10];
export const COLOR_BONUS = [0, 0, 3, 6, 12, 24];
