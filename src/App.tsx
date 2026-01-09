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

  return (
    <div className="app">
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
          onResume={togglePause}
          onRestart={resetGame}
        />

        <Controls
          onMove={move}
          onRotate={rotate}
          onHardDrop={hardDrop}
          onPause={togglePause}
          onReset={resetGame}
          disabled={gameState.gameOver || gameState.isPopping}
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
