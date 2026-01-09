import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Direction, Rotation } from '../game/types';
import {
  createInitialState,
  movePuyo,
  rotatePuyo,
  placePuyo,
  applyGravity,
  popPuyos,
  calculateScore,
  checkGameOver,
  createNextPuyo,
  hasPoppingPuyos,
  markPoppingPuyos,
} from '../game/logic';
import { INITIAL_DROP_SPEED, SOFT_DROP_SPEED } from '../game/constants';

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [dropSpeed, setDropSpeed] = useState(INITIAL_DROP_SPEED);
  const dropIntervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  // ゲームをリセット
  const resetGame = useCallback(() => {
    setGameState(createInitialState());
    setDropSpeed(INITIAL_DROP_SPEED);
    isProcessingRef.current = false;
  }, []);

  // 連鎖処理
  const processChain = useCallback(async (board: typeof gameState.board, chain: number, currentScore: number) => {
    isProcessingRef.current = true;

    // 消えるぷよがなくなるまで繰り返す
    let currentBoard = board;
    let currentChain = chain;
    let totalScore = currentScore;

    while (hasPoppingPuyos(currentBoard)) {
      // 消えるぷよをマーク
      const markedBoard = markPoppingPuyos(currentBoard);
      setGameState((prev) => ({
        ...prev,
        board: markedBoard,
        isPopping: true,
        chain: currentChain,
      }));

      // アニメーション待機
      await new Promise((resolve) => setTimeout(resolve, 300));

      // ぷよを消去
      const { board: poppedBoard, colors, groups } = popPuyos(currentBoard);
      const chainScore = calculateScore(groups.reduce((a, b) => a + b, 0), currentChain, colors, groups);
      totalScore += chainScore;
      currentChain++;

      setGameState((prev) => ({
        ...prev,
        board: poppedBoard,
        score: totalScore,
        chain: currentChain,
      }));

      // 少し待機
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 重力適用
      currentBoard = applyGravity(poppedBoard);
      setGameState((prev) => ({
        ...prev,
        board: currentBoard,
        isPopping: false,
      }));

      // 落下アニメーション待機
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // ゲームオーバーチェック
    if (checkGameOver(currentBoard)) {
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        currentPuyo: null,
      }));
      isProcessingRef.current = false;
      return;
    }

    // 新しいぷよを生成
    setGameState((prev) => {
      const newPuyo = {
        main: { pos: { x: 2, y: 0 }, color: prev.nextPuyo.main },
        sub: { pos: { x: 2, y: -1 }, color: prev.nextPuyo.sub },
        rotation: 0,
      };
      return {
        ...prev,
        currentPuyo: newPuyo,
        nextPuyo: createNextPuyo(),
        chain: 0,
      };
    });

    isProcessingRef.current = false;
  }, []);

  // ぷよを落下させる
  const drop = useCallback(() => {
    if (isProcessingRef.current) return;

    setGameState((prev) => {
      if (!prev.currentPuyo || prev.gameOver || prev.isPaused) return prev;

      const { puyo, landed } = movePuyo(prev.board, prev.currentPuyo, 'down');

      if (landed) {
        const newBoard = placePuyo(prev.board, prev.currentPuyo);
        const boardWithGravity = applyGravity(newBoard);

        // 非同期で連鎖処理を開始
        setTimeout(() => processChain(boardWithGravity, 1, prev.score), 0);

        return {
          ...prev,
          board: boardWithGravity,
          currentPuyo: null,
        };
      }

      return { ...prev, currentPuyo: puyo };
    });
  }, [processChain]);

  // ぷよを移動
  const move = useCallback((direction: Direction) => {
    if (isProcessingRef.current) return;

    setGameState((prev) => {
      if (!prev.currentPuyo || prev.gameOver || prev.isPaused) return prev;

      const { puyo, landed } = movePuyo(prev.board, prev.currentPuyo, direction);

      if (direction === 'down' && landed) {
        const newBoard = placePuyo(prev.board, prev.currentPuyo);
        const boardWithGravity = applyGravity(newBoard);

        setTimeout(() => processChain(boardWithGravity, 1, prev.score), 0);

        return {
          ...prev,
          board: boardWithGravity,
          currentPuyo: null,
        };
      }

      return { ...prev, currentPuyo: puyo };
    });
  }, [processChain]);

  // ぷよを回転
  const rotate = useCallback((rotation: Rotation) => {
    if (isProcessingRef.current) return;

    setGameState((prev) => {
      if (!prev.currentPuyo || prev.gameOver || prev.isPaused) return prev;

      const rotated = rotatePuyo(
        prev.board,
        prev.currentPuyo,
        rotation === 'clockwise'
      );
      return { ...prev, currentPuyo: rotated };
    });
  }, []);

  // 一気に落下
  const hardDrop = useCallback(() => {
    if (isProcessingRef.current) return;

    setGameState((prev) => {
      if (!prev.currentPuyo || prev.gameOver || prev.isPaused) return prev;

      let puyo = prev.currentPuyo;
      let landed = false;

      while (!landed) {
        const result = movePuyo(prev.board, puyo, 'down');
        puyo = result.puyo;
        landed = result.landed;
      }

      const newBoard = placePuyo(prev.board, puyo);
      const boardWithGravity = applyGravity(newBoard);

      setTimeout(() => processChain(boardWithGravity, 1, prev.score), 0);

      return {
        ...prev,
        board: boardWithGravity,
        currentPuyo: null,
      };
    });
  }, [processChain]);

  // ソフトドロップ（高速落下）
  const startSoftDrop = useCallback(() => {
    setDropSpeed(SOFT_DROP_SPEED);
  }, []);

  const stopSoftDrop = useCallback(() => {
    setDropSpeed(INITIAL_DROP_SPEED);
  }, []);

  // ポーズ切り替え
  const togglePause = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  // 自動落下
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused || !gameState.currentPuyo) {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
        dropIntervalRef.current = null;
      }
      return;
    }

    dropIntervalRef.current = window.setInterval(drop, dropSpeed);

    return () => {
      if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current);
      }
    };
  }, [drop, dropSpeed, gameState.gameOver, gameState.isPaused, gameState.currentPuyo]);

  // キーボード入力
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver) {
        if (e.key === 'Enter' || e.key === ' ') {
          resetGame();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          move('right');
          break;
        case 'ArrowDown':
          e.preventDefault();
          move('down');
          break;
        case 'ArrowUp':
          e.preventDefault();
          hardDrop();
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          rotate('counterclockwise');
          break;
        case 'x':
        case 'X':
          e.preventDefault();
          rotate('clockwise');
          break;
        case 'p':
        case 'P':
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetGame();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        stopSoftDrop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.gameOver, move, rotate, hardDrop, togglePause, resetGame, startSoftDrop, stopSoftDrop]);

  return {
    gameState,
    move,
    rotate,
    hardDrop,
    togglePause,
    resetGame,
    startSoftDrop,
    stopSoftDrop,
  };
}
