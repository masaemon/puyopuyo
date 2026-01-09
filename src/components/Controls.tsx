import React, { useCallback } from 'react';
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
  const handleTouchStart = useCallback(
    (action: () => void) => (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!disabled) {
        action();
      }
    },
    [disabled]
  );

  return (
    <div className="controls">
      <div className="controls-row top">
        <button
          className="control-btn rotate-btn"
          onTouchStart={handleTouchStart(() => onRotate('counterclockwise'))}
          onMouseDown={handleTouchStart(() => onRotate('counterclockwise'))}
          disabled={disabled}
        >
          ↺
        </button>
        <button
          className="control-btn hard-drop-btn"
          onTouchStart={handleTouchStart(onHardDrop)}
          onMouseDown={handleTouchStart(onHardDrop)}
          disabled={disabled}
        >
          ⬇
        </button>
        <button
          className="control-btn rotate-btn"
          onTouchStart={handleTouchStart(() => onRotate('clockwise'))}
          onMouseDown={handleTouchStart(() => onRotate('clockwise'))}
          disabled={disabled}
        >
          ↻
        </button>
      </div>

      <div className="controls-row middle">
        <button
          className="control-btn move-btn"
          onTouchStart={handleTouchStart(() => onMove('left'))}
          onMouseDown={handleTouchStart(() => onMove('left'))}
          disabled={disabled}
        >
          ◀
        </button>
        <button
          className="control-btn move-btn down-btn"
          onTouchStart={handleTouchStart(() => onMove('down'))}
          onMouseDown={handleTouchStart(() => onMove('down'))}
          disabled={disabled}
        >
          ▼
        </button>
        <button
          className="control-btn move-btn"
          onTouchStart={handleTouchStart(() => onMove('right'))}
          onMouseDown={handleTouchStart(() => onMove('right'))}
          disabled={disabled}
        >
          ▶
        </button>
      </div>

      <div className="controls-row bottom">
        <button
          className="control-btn action-btn"
          onTouchStart={handleTouchStart(onPause)}
          onMouseDown={handleTouchStart(onPause)}
        >
          ⏸
        </button>
        <button
          className="control-btn action-btn"
          onTouchStart={handleTouchStart(onReset)}
          onMouseDown={handleTouchStart(onReset)}
        >
          🔄
        </button>
      </div>
    </div>
  );
};
