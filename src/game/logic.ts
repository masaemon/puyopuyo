import type { Cell, FallingPuyo, GameState, PuyoColor, Position } from './types';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PUYO_COLORS,
  MIN_CONNECT,
  BASE_SCORE,
  CHAIN_BONUS,
  CONNECTION_BONUS,
  COLOR_BONUS,
} from './constants';

// 空のボードを作成
export function createEmptyBoard(): Cell[][] {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() =>
      Array(BOARD_WIDTH)
        .fill(null)
        .map(() => ({ color: null }))
    );
}

// ランダムな色を取得
export function getRandomColor(): PuyoColor {
  return PUYO_COLORS[Math.floor(Math.random() * PUYO_COLORS.length)];
}

// 新しいぷよペアを生成
export function createNewPuyo(): FallingPuyo {
  return {
    main: { pos: { x: 2, y: 0 }, color: getRandomColor() },
    sub: { pos: { x: 2, y: -1 }, color: getRandomColor() },
    rotation: 0,
  };
}

// 次のぷよを生成
export function createNextPuyo(): { main: PuyoColor; sub: PuyoColor } {
  return {
    main: getRandomColor(),
    sub: getRandomColor(),
  };
}

// 位置が有効かチェック
export function isValidPosition(
  board: Cell[][],
  x: number,
  y: number,
  currentPuyo?: FallingPuyo
): boolean {
  if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) return false;
  if (y < 0) return true; // 上部は許可
  if (board[y][x].color !== null) {
    // 現在のぷよ自身の位置はスキップ
    if (currentPuyo) {
      if (
        (currentPuyo.main.pos.x === x && currentPuyo.main.pos.y === y) ||
        (currentPuyo.sub.pos.x === x && currentPuyo.sub.pos.y === y)
      ) {
        return true;
      }
    }
    return false;
  }
  return true;
}

// ぷよを回転させた後の位置を計算
export function getRotatedPosition(puyo: FallingPuyo, clockwise: boolean): FallingPuyo {
  const newRotation = clockwise
    ? (puyo.rotation + 1) % 4
    : (puyo.rotation + 3) % 4;

  const offsets: Record<number, Position> = {
    0: { x: 0, y: -1 }, // 上
    1: { x: 1, y: 0 },  // 右
    2: { x: 0, y: 1 },  // 下
    3: { x: -1, y: 0 }, // 左
  };

  return {
    ...puyo,
    rotation: newRotation,
    sub: {
      ...puyo.sub,
      pos: {
        x: puyo.main.pos.x + offsets[newRotation].x,
        y: puyo.main.pos.y + offsets[newRotation].y,
      },
    },
  };
}

// 壁蹴りを考慮した回転
export function rotatePuyo(
  board: Cell[][],
  puyo: FallingPuyo,
  clockwise: boolean
): FallingPuyo {
  let rotated = getRotatedPosition(puyo, clockwise);

  // 通常の位置が有効かチェック
  if (
    isValidPosition(board, rotated.sub.pos.x, rotated.sub.pos.y) &&
    isValidPosition(board, rotated.main.pos.x, rotated.main.pos.y)
  ) {
    return rotated;
  }

  // 壁蹴り: 左右に1マスずらす
  const kicks = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
  ];

  for (const kick of kicks) {
    const kickedMain = {
      x: rotated.main.pos.x + kick.x,
      y: rotated.main.pos.y + kick.y,
    };
    const kickedSub = {
      x: rotated.sub.pos.x + kick.x,
      y: rotated.sub.pos.y + kick.y,
    };

    if (
      isValidPosition(board, kickedMain.x, kickedMain.y) &&
      isValidPosition(board, kickedSub.x, kickedSub.y)
    ) {
      return {
        ...rotated,
        main: { ...rotated.main, pos: kickedMain },
        sub: { ...rotated.sub, pos: kickedSub },
      };
    }
  }

  // 回転できない場合は元の状態を返す
  return puyo;
}

// ぷよを移動
export function movePuyo(
  board: Cell[][],
  puyo: FallingPuyo,
  direction: 'left' | 'right' | 'down'
): { puyo: FallingPuyo; landed: boolean } {
  const dx = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
  const dy = direction === 'down' ? 1 : 0;

  const newMainPos = {
    x: puyo.main.pos.x + dx,
    y: puyo.main.pos.y + dy,
  };
  const newSubPos = {
    x: puyo.sub.pos.x + dx,
    y: puyo.sub.pos.y + dy,
  };

  if (
    isValidPosition(board, newMainPos.x, newMainPos.y) &&
    isValidPosition(board, newSubPos.x, newSubPos.y)
  ) {
    return {
      puyo: {
        ...puyo,
        main: { ...puyo.main, pos: newMainPos },
        sub: { ...puyo.sub, pos: newSubPos },
      },
      landed: false,
    };
  }

  // 下に移動できない場合は着地
  if (direction === 'down') {
    return { puyo, landed: true };
  }

  return { puyo, landed: false };
}

// ぷよをボードに固定
export function placePuyo(board: Cell[][], puyo: FallingPuyo): Cell[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  if (puyo.main.pos.y >= 0) {
    newBoard[puyo.main.pos.y][puyo.main.pos.x].color = puyo.main.color;
  }
  if (puyo.sub.pos.y >= 0) {
    newBoard[puyo.sub.pos.y][puyo.sub.pos.x].color = puyo.sub.color;
  }

  return newBoard;
}

// 重力を適用（ぷよを落下させる）
export function applyGravity(board: Cell[][]): Cell[][] {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  for (let x = 0; x < BOARD_WIDTH; x++) {
    let writeY = BOARD_HEIGHT - 1;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y][x].color !== null) {
        if (y !== writeY) {
          newBoard[writeY][x].color = newBoard[y][x].color;
          newBoard[y][x].color = null;
        }
        writeY--;
      }
    }
  }

  return newBoard;
}

// 連結を検出
export function findConnections(board: Cell[][]): Map<string, Set<string>> {
  const connections = new Map<string, Set<string>>();
  const visited = new Set<string>();

  function dfs(x: number, y: number, color: PuyoColor, group: Set<string>) {
    const key = `${x},${y}`;
    if (visited.has(key)) return;
    if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) return;
    if (board[y][x].color !== color) return;

    visited.add(key);
    group.add(key);

    dfs(x - 1, y, color, group);
    dfs(x + 1, y, color, group);
    dfs(x, y - 1, color, group);
    dfs(x, y + 1, color, group);
  }

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const color = board[y][x].color;
      if (color !== null && !visited.has(`${x},${y}`)) {
        const group = new Set<string>();
        dfs(x, y, color, group);
        if (group.size >= MIN_CONNECT) {
          for (const key of group) {
            connections.set(key, group);
          }
        }
      }
    }
  }

  return connections;
}

// ぷよを消去
export function popPuyos(board: Cell[][]): {
  board: Cell[][];
  popped: number;
  colors: Set<PuyoColor>;
  groups: number[];
} {
  const connections = findConnections(board);
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const colors = new Set<PuyoColor>();
  const groupSizes: number[] = [];
  const processedGroups = new Set<string>();

  for (const [, group] of connections) {
    const groupKey = Array.from(group).sort().join('|');
    if (processedGroups.has(groupKey)) continue;
    processedGroups.add(groupKey);

    groupSizes.push(group.size);

    for (const cellKey of group) {
      const [x, y] = cellKey.split(',').map(Number);
      colors.add(newBoard[y][x].color);
      newBoard[y][x].color = null;
    }
  }

  return {
    board: newBoard,
    popped: Array.from(connections.values()).reduce(
      (acc, group) => acc + group.size,
      0
    ) / (connections.size || 1) * processedGroups.size,
    colors,
    groups: groupSizes,
  };
}

// スコアを計算
export function calculateScore(
  popped: number,
  chain: number,
  colors: Set<PuyoColor>,
  groups: number[]
): number {
  if (popped === 0) return 0;

  const chainBonus = CHAIN_BONUS[Math.min(chain, CHAIN_BONUS.length - 1)] || 512;
  const colorBonus = COLOR_BONUS[Math.min(colors.size, COLOR_BONUS.length - 1)] || 24;

  let connectionBonus = 0;
  for (const size of groups) {
    connectionBonus += CONNECTION_BONUS[Math.min(size, CONNECTION_BONUS.length - 1)] || 10;
  }

  const totalBonus = Math.max(chainBonus + colorBonus + connectionBonus, 1);

  return popped * BASE_SCORE * totalBonus;
}

// ゲームオーバーをチェック
export function checkGameOver(board: Cell[][]): boolean {
  // 3列目（0-indexed で2）の最上部（見えない部分も含む）にぷよがあればゲームオーバー
  return board[0][2].color !== null || board[1][2].color !== null;
}

// 初期ゲーム状態を作成
export function createInitialState(): GameState {
  return {
    board: createEmptyBoard(),
    currentPuyo: createNewPuyo(),
    nextPuyo: createNextPuyo(),
    score: 0,
    gameOver: false,
    isPaused: false,
    chain: 0,
    isPopping: false,
  };
}

// 消去アニメーション用に消えるぷよをマーク
export function markPoppingPuyos(board: Cell[][]): Cell[][] {
  const connections = findConnections(board);
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell, willPop: false })));

  for (const key of connections.keys()) {
    const [x, y] = key.split(',').map(Number);
    newBoard[y][x].willPop = true;
  }

  return newBoard;
}

// 消えるぷよがあるかチェック
export function hasPoppingPuyos(board: Cell[][]): boolean {
  const connections = findConnections(board);
  return connections.size > 0;
}
