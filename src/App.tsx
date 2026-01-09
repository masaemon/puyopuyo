import { useGame } from './hooks/useGame';
import { GameBoard } from './components/GameBoard';
import { Controls } from './components/Controls';
import './App.css';

function App() {
  const {
    gameState,
    move,
    rotate,
    hardDrop,
    togglePause,
    resetGame,
  } = useGame();

  const handleScreenTap = () => {
    if (gameState.gameOver) {
      resetGame();
    }
  };

  return (
    <div className="app" onClick={handleScreenTap}>
      <header className="header">
        <h1>ぷよぷよ</h1>
      </header>

      <main className="main">
        <GameBoard
          board={gameState.board}
          currentPuyo={gameState.currentPuyo}
          nextPuyo={gameState.nextPuyo}
          score={gameState.score}
          chain={gameState.chain}
          gameOver={gameState.gameOver}
          isPaused={gameState.isPaused}
        />

        <Controls
          onMove={move}
          onRotate={rotate}
          onHardDrop={hardDrop}
          onPause={togglePause}
          onReset={resetGame}
          disabled={gameState.gameOver || gameState.isPaused || gameState.isPopping}
        />
      </main>

      <footer className="footer">
        <div className="instructions">
          <p className="desktop-only">
            ← → : 移動 | ↓ : 落下 | ↑ : 即落下 | Z/X : 回転 | P : ポーズ | R : リセット
          </p>
          <p className="mobile-only">
            ボタンで操作してください
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
