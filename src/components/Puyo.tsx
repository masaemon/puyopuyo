import type { PuyoColor } from '../game/types';
import { COLOR_MAP } from '../game/constants';
import './Puyo.css';

interface PuyoProps {
  color: PuyoColor;
  willPop?: boolean;
  isGhost?: boolean;
}

export const Puyo: React.FC<PuyoProps> = ({ color, willPop, isGhost }) => {
  if (!color) return null;

  const backgroundColor = COLOR_MAP[color] || 'transparent';

  return (
    <div
      className={`puyo ${willPop ? 'popping' : ''} ${isGhost ? 'ghost' : ''}`}
      style={{ backgroundColor }}
    >
      <div className="puyo-shine" />
      <div className="puyo-eyes">
        <div className="puyo-eye left" />
        <div className="puyo-eye right" />
      </div>
    </div>
  );
};
