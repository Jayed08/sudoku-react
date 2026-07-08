import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sudoku } from './sudoku.js';

const LEVELS = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert', 'Extreme'];
const MAX_MISTAKES = 3;
const emptyGrid = Array(81).fill(0);
const emptyNotes = () => Array.from({ length: 81 }, () => []);

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function readInitialLevel() {
  const params = new URLSearchParams(window.location.search);
  const level = params.get('level');
  return LEVELS.includes(level) ? level : null;
}

export default function App() {
  const gameRef = useRef(new Sudoku());
  const [screen, setScreen] = useState(() => (readInitialLevel() ? 'game' : 'menu'));
  const [level, setLevel] = useState(() => readInitialLevel() || 'Easy');
  const [puzzle, setPuzzle] = useState(emptyGrid);
  const [solution, setSolution] = useState(emptyGrid);
  const [values, setValues] = useState(emptyGrid);
  const [notes, setNotes] = useState(emptyNotes);
  const [errors, setErrors] = useState(() => Array(81).fill(false));
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const fixedCells = useMemo(() => puzzle.map((value) => value !== 0), [puzzle]);
  const selectedValue = selectedIndex === null ? 0 : puzzle[selectedIndex] || values[selectedIndex];

  const startGame = useCallback((nextLevel) => {
    setLevel(nextLevel);
    setScreen('game');
    setIsLoading(true);
    setModal(null);
    setSelectedIndex(null);
    window.history.pushState(null, '', `?level=${encodeURIComponent(nextLevel)}`);

    window.setTimeout(() => {
      const data = gameRef.current.generate(nextLevel);
      setPuzzle(data.puzzle);
      setSolution(data.solution);
      setValues(emptyGrid);
      setNotes(emptyNotes());
      setErrors(Array(81).fill(false));
      setMistakes(0);
      setIsPencilMode(false);
      setSecondsElapsed(0);
      setIsLoading(false);
    }, 50);
  }, []);

  const returnToMenu = useCallback(() => {
    setScreen('menu');
    setModal(null);
    setSelectedIndex(null);
    window.history.pushState(null, '', window.location.pathname);
  }, []);

  useEffect(() => {
    const initialLevel = readInitialLevel();
    if (initialLevel) {
      startGame(initialLevel);
    }
  }, [startGame]);

  useEffect(() => {
    if (screen !== 'game' || isLoading || modal) return undefined;

    const interval = window.setInterval(() => {
      setSecondsElapsed((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [screen, isLoading, modal]);

  const closeModal = useCallback(() => setModal(null), []);

  const clearConflictingNotes = useCallback((index, number) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    setNotes((current) =>
      current.map((cellNotes, i) => {
        const r = Math.floor(i / 9);
        const c = i % 9;
        const sameGroup = r === row || c === col || (r >= boxRow && r < boxRow + 3 && c >= boxCol && c < boxCol + 3);
        return sameGroup ? cellNotes.filter((note) => note !== number) : cellNotes;
      })
    );
  }, []);

  const checkSolved = useCallback((nextValues) => {
    return solution.every((answer, index) => puzzle[index] !== 0 || nextValues[index] === answer);
  }, [puzzle, solution]);

  const handleInput = useCallback((number) => {
    if (selectedIndex === null || fixedCells[selectedIndex] || modal) return;

    if (isPencilMode && !values[selectedIndex]) {
      setNotes((current) =>
        current.map((cellNotes, index) => {
          if (index !== selectedIndex) return cellNotes;
          return cellNotes.includes(number)
            ? cellNotes.filter((note) => note !== number)
            : [...cellNotes, number].sort((a, b) => a - b);
        })
      );
      return;
    }

    if (values[selectedIndex] === number && !errors[selectedIndex]) return;

    if (number === solution[selectedIndex]) {
      setValues((current) => {
        const next = [...current];
        next[selectedIndex] = number;
        if (checkSolved(next)) {
          setModal({
            title: 'Solved!',
            message: `Time: ${formatTime(secondsElapsed)}`,
            primary: 'Play Again',
            secondary: 'Menu',
            onPrimary: () => startGame(level),
            onSecondary: returnToMenu,
          });
        }
        return next;
      });
      setErrors((current) => {
        const next = [...current];
        next[selectedIndex] = false;
        return next;
      });
      setNotes((current) => {
        const next = current.map((cellNotes, index) => (index === selectedIndex ? [] : cellNotes));
        return next;
      });
      clearConflictingNotes(selectedIndex, number);
      return;
    }

    setValues((current) => {
      const next = [...current];
      next[selectedIndex] = number;
      return next;
    });
    setErrors((current) => {
      const next = [...current];
      next[selectedIndex] = true;
      return next;
    });
    setMistakes((current) => {
      const next = current + 1;
      if (next >= MAX_MISTAKES) {
        setModal({
          title: 'Game Over',
          message: 'Too many mistakes.',
          primary: 'Try Again',
          secondary: 'Menu',
          onPrimary: () => startGame(level),
          onSecondary: returnToMenu,
        });
      }
      return next;
    });
  }, [
    checkSolved,
    clearConflictingNotes,
    errors,
    fixedCells,
    isPencilMode,
    level,
    modal,
    returnToMenu,
    secondsElapsed,
    selectedIndex,
    solution,
    startGame,
    values,
  ]);

  const clearCurrentCell = useCallback(() => {
    if (selectedIndex === null || fixedCells[selectedIndex] || modal) return;

    setValues((current) => {
      const next = [...current];
      next[selectedIndex] = 0;
      return next;
    });
    setErrors((current) => {
      const next = [...current];
      next[selectedIndex] = false;
      return next;
    });
    setNotes((current) => current.map((cellNotes, index) => (index === selectedIndex ? [] : cellNotes)));
  }, [fixedCells, modal, selectedIndex]);

  const moveSelection = useCallback((key) => {
    setSelectedIndex((current) => {
      if (current === null) return 0;
      if (key === 'ArrowUp' && current >= 9) return current - 9;
      if (key === 'ArrowDown' && current <= 71) return current + 9;
      if (key === 'ArrowLeft' && current % 9 !== 0) return current - 1;
      if (key === 'ArrowRight' && current % 9 !== 8) return current + 1;
      return current;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (screen !== 'game' || modal) return;

      const number = Number(event.key);
      if (number >= 1 && number <= 9) {
        handleInput(number);
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        moveSelection(event.key);
      }

      if (event.key === 'Backspace' || event.key === 'Delete') clearCurrentCell();
      if (event.key.toLowerCase() === 'n') setIsPencilMode((current) => !current);
      if (event.key === 'Escape') setSelectedIndex(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [clearCurrentCell, handleInput, modal, moveSelection, screen]);

  const requestRestart = () => {
    setModal({
      title: 'Restart?',
      message: 'Abandon current game and start new?',
      primary: 'Restart',
      secondary: 'Cancel',
      onPrimary: () => startGame(level),
      onSecondary: closeModal,
    });
  };

  if (screen === 'menu') {
    return <Menu onSelectLevel={startGame} />;
  }

  return (
    <div className="app-shell">
      {isLoading && <LoadingOverlay />}
      <header className="game-header">
        <div className="header-title">
          <button className="icon-button" type="button" aria-label="Back to menu" onClick={returnToMenu}>
            <span aria-hidden="true">‹</span>
          </button>
          <h1>Sudoku</h1>
        </div>

        <div className="game-stats">
          <div className="timer">{formatTime(secondsElapsed)}</div>
          <div className="mistakes">
            Mistakes: <span className={mistakes > 0 ? 'danger' : ''}>{mistakes}/{MAX_MISTAKES}</span>
          </div>
          <span className="level-pill">{level}</span>
        </div>
      </header>

      <main className="game-layout">
        <section className="board-stage" aria-label="Sudoku board">
          <div className="sudoku-grid">
            {puzzle.map((given, index) => (
              <Cell
                key={index}
                index={index}
                given={given}
                value={values[index]}
                notes={notes[index]}
                isSelected={selectedIndex === index}
                isHighlighted={selectedValue !== 0 && (given || values[index]) === selectedValue}
                hasError={errors[index]}
                onSelect={() => setSelectedIndex(index)}
              />
            ))}
          </div>
        </section>

        <aside className="control-panel">
          <div className="action-row">
            <button className="primary-button" type="button" onClick={requestRestart}>New</button>
            <button className="secondary-button" type="button" onClick={clearCurrentCell}>Clear</button>
            <button
              className={`secondary-button pencil-button ${isPencilMode ? 'active' : ''}`}
              type="button"
              onClick={() => setIsPencilMode((current) => !current)}
            >
              <span aria-hidden="true">✎</span>
              {isPencilMode ? 'On' : 'Off'}
            </button>
          </div>

          <div className="numpad">
            {Array.from({ length: 9 }, (_, index) => index + 1).map((number) => (
              <button className="numpad-button" type="button" key={number} onClick={() => handleInput(number)}>
                {number}
              </button>
            ))}
          </div>
        </aside>
      </main>

      {modal && <GameModal modal={modal} />}
    </div>
  );
}

function Menu({ onSelectLevel }) {
  return (
    <main className="menu-screen">
      <section className="menu-panel">
        <div className="menu-copy">
          <h1>Sudoku</h1>
          <p>Select Difficulty</p>
        </div>

        <div className="level-grid">
          {LEVELS.map((level) => (
            <button className={`level-button level-${level.toLowerCase()}`} type="button" key={level} onClick={() => onSelectLevel(level)}>
              {level}{level === 'Extreme' ? ' ⚡' : ''}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function Cell({ given, value, notes, isSelected, isHighlighted, hasError, onSelect }) {
  const displayValue = given || value || '';
  const classes = [
    'cell',
    given ? 'fixed-cell' : 'playable-cell',
    isSelected ? 'selected' : '',
    isHighlighted ? 'highlight-same' : '',
    hasError ? 'error' : '',
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} type="button" onClick={onSelect}>
      <span className="notes-grid" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => index + 1).map((number) => (
          <span className={`note-num ${notes.includes(number) ? 'active' : ''}`} key={number}>
            {number}
          </span>
        ))}
      </span>
      <span className="value">{displayValue}</span>
    </button>
  );
}

function LoadingOverlay() {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p className="loading-text">Generating Puzzle...</p>
    </div>
  );
}

function GameModal({ modal }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card">
        <h2 id="modal-title">{modal.title}</h2>
        <p>{modal.message}</p>
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={modal.onSecondary}>
            {modal.secondary}
          </button>
          <button className="primary-button" type="button" onClick={modal.onPrimary}>
            {modal.primary}
          </button>
        </div>
      </div>
    </div>
  );
}
