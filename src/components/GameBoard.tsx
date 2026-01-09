import type { Cell, FallingPuyo, PuyoColor } from '../game/types';
import { Puyo } from './Puyo';
import './GameBoard.css';

interface GameBoardProps {
  board: Cell[][];
  currentPuyo: FallingPuyo | null;
  nextPuyo: { main: PuyoColor; sub: PuyoColor };
  score: number;
  chain: number;
  gameOver: boolean;
  isPaused: boolean;
  onResume?: () => void;
  onRestart?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  currentPuyo,
  nextPuyo,
  score,
  chain,
  gameOver,
  isPaused,
  onResume,
  onRestart,
}) => {
  // 表示用のボードを作成（上1行を除く）
  const visibleBoard = board.slice(1);

  // 落下中のぷよの位置を調整（表示用）
  const adjustY = (y: number) => y - 1;

  const handleOverlayClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (gameOver && onRestart) {
      onRestart();
    } else if (isPaused && onResume) {
      onResume();
    }
  };

  return (
    <div className="game-container">
      <div className="side-panel left">
        <div className="next-puyo-container">
          <div className="label">NEXT</div>
          <div className="next-puyo">
            <div className="next-cell">
              <Puyo color={nextPuyo.sub} />
            </div>
            <div className="next-cell">
              <Puyo color={nextPuyo.main} />
            </div>
          </div>
        </div>
      </div>

      <div className="board-wrapper">
        <div className="board">
          {visibleBoard.map((row, y) => (
            <div key={y} className="row">
              {row.map((cell, x) => {
                // 落下中のぷよをチェック
                let puyoColor = cell.color;
                let isCurrentPuyo = false;

                if (currentPuyo) {
                  if (
                    adjustY(currentPuyo.main.pos.y) === y &&
                    currentPuyo.main.pos.x === x
                  ) {
                    puyoColor = currentPuyo.main.color;
                    isCurrentPuyo = true;
                  }
                  if (
                    adjustY(currentPuyo.sub.pos.y) === y &&
                    currentPuyo.sub.pos.x === x
                  ) {
                    puyoColor = currentPuyo.sub.color;
                    isCurrentPuyo = true;
                  }
                }

                return (
                  <div key={x} className={`cell ${isCurrentPuyo ? 'current' : ''}`}>
                    <Puyo color={puyoColor} willPop={cell.willPop} />
                  </div>
                );
              })}
            </div>
          ))}

          {gameOver && (
            <div
              className="overlay"
              onClick={handleOverlayClick}
              onTouchStart={handleOverlayClick}
            >
              <div className="overlay-content">
                <h2>GAME OVER</h2>
                <p>Score: {score.toLocaleString()}</p>
                <p className="restart-hint">タップしてリスタート</p>
              </div>
            </div>
          )}

          {isPaused && !gameOver && (
            <div
              className="overlay"
              onClick={handleOverlayClick}
              onTouchStart={handleOverlayClick}
            >
              <div className="overlay-content">
                <h2>PAUSED</h2>
                <p className="restart-hint">タップして再開</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="side-panel right">
        <div className="score-container">
          <div className="label">SCORE</div>
          <div className="score">{score.toLocaleString()}</div>
        </div>
        {chain > 1 && (
          <div className="chain-container">
            <div className="chain">{chain - 1} CHAIN!</div>
          </div>
        )}
      </div>
    </div>
  );
};
