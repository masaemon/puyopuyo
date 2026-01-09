import React, { useCallback, useRef } from 'react';
import './Controls.css';

interface ControlsProps {
  onMove: (direction: 'left' | 'right' | 'down') => void;
  onRotate: (rotation: 'clockwise' | 'counterclockwise') => void;
  onHardDrop: () => void;
  onPause: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  onMove,
  onRotate,
  onHardDrop,
  onPause,
  onReset,
  disabled,
}) => {
  // タッチイベントとマウスイベントの二重発火を防ぐ
  const lastTouchTimeRef = useRef<number>(0);
  const TOUCH_DELAY = 300; // ミリ秒

  const handleAction = useCallback(
    (action: () => void, isDisabled?: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();

      // タッチイベントの場合
      if ('touches' in e) {
        lastTouchTimeRef.current = now;
        if (!isDisabled) {
          action();
        }
        return;
      }

      // マウスイベントの場合、直近のタッチから一定時間経っていなければ無視
      if (now - lastTouchTimeRef.current < TOUCH_DELAY) {
        return;
      }

      if (!isDisabled) {
        action();
      }
    },
    []
  );

  return (
    <div className="controls">
      <div className="controls-row top">
        <button
          className="control-btn rotate-btn"
          onTouchStart={handleAction(() => onRotate('counterclockwise'), disabled)}
          onMouseDown={handleAction(() => onRotate('counterclockwise'), disabled)}
          disabled={disabled}
        >
          ↺
        </button>
        <button
          className="control-btn hard-drop-btn"
          onTouchStart={handleAction(onHardDrop, disabled)}
          onMouseDown={handleAction(onHardDrop, disabled)}
          disabled={disabled}
        >
          ⬇
        </button>
        <button
          className="control-btn rotate-btn"
          onTouchStart={handleAction(() => onRotate('clockwise'), disabled)}
          onMouseDown={handleAction(() => onRotate('clockwise'), disabled)}
          disabled={disabled}
        >
          ↻
        </button>
      </div>

      <div className="controls-row middle">
        <button
          className="control-btn move-btn"
          onTouchStart={handleAction(() => onMove('left'), disabled)}
          onMouseDown={handleAction(() => onMove('left'), disabled)}
          disabled={disabled}
        >
          ◀
        </button>
        <button
          className="control-btn move-btn down-btn"
          onTouchStart={handleAction(() => onMove('down'), disabled)}
          onMouseDown={handleAction(() => onMove('down'), disabled)}
          disabled={disabled}
        >
          ▼
        </button>
        <button
          className="control-btn move-btn"
          onTouchStart={handleAction(() => onMove('right'), disabled)}
          onMouseDown={handleAction(() => onMove('right'), disabled)}
          disabled={disabled}
        >
          ▶
        </button>
      </div>

      <div className="controls-row bottom">
        <button
          className="control-btn action-btn pause-btn"
          onTouchStart={handleAction(onPause)}
          onMouseDown={handleAction(onPause)}
        >
          ⏸
        </button>
        <button
          className="control-btn action-btn"
          onTouchStart={handleAction(onReset)}
          onMouseDown={handleAction(onReset)}
        >
          🔄
        </button>
      </div>
    </div>
  );
};
