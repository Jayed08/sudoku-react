# 🧩 Zen Sudoku Engine

A sleek, high-performance, and minimalist Sudoku web application built with **React**, **Vite**, and **Oxlint**. Engineered for developers, recruiters, and Sudoku enthusiasts, this project serves as a showcase of algorithmic complexity, clean component design, performance engineering, and state management in modern React.

🔗 **[Live Demo](https://jayed08.github.io/sudoku-react/)**

---

## 🚀 The Elevator Pitch
Most Sudoku web games use pre-generated puzzle databases or slow, third-party APIs. **Zen Sudoku Engine** implements a **custom, client-side puzzle generator and solver engine** from scratch. By combining recursive backtracking with low-overhead bitmask validations, it creates valid, uniquely solvable grids in milliseconds directly in the user's browser.

---

## 🧠 Technical Architecture & Algorithmic Highlights

This project was built to demonstrate clean software engineering patterns, algorithmic optimizations, and interactive UX design. Below are the key engineering decisions:

### 1. Bitmask-Optimized Backtracking Solver
Generating a Sudoku puzzle requires verifying that a candidate board has exactly **one unique solution**. A naive solver can be slow, but this engine utilizes a **bitwise backtracking solver** ([sudoku.js](file:///home/jayed/GitHub/sudoku-react/src/sudoku.js)):
* **State Compression:** Represents grid rows, columns, and 3x3 sub-grids as 16-bit integers (`Int16Array`).
* **$O(1)$ Safety Checks:** Instead of scanning full rows, columns, or boxes to see if a digit is present, a bitwise check is performed using `rowMasks[r] | colMasks[c] | boxMasks[boxIndex]`. Checking if a number $N$ is safe is done via:
  ```javascript
  const bit = 1 << (num - 1);
  if ((taken & bit) === 0) { ... }
  ```
* **Early Pruning:** The solver returns immediately if it discovers more than one valid configuration, ensuring extremely fast puzzle verification.

### 2. Heuristic-Guided Board Depletion (Hole Digging)
To generate a puzzle from a solved grid:
* The engine ranks cells based on a **Removal Score** heuristic, prioritizing cells in highly populated rows/columns to maintain symmetry and logical progression.
* It iteratively empties cells, running the unique solution validator at each step. If removing a cell makes the puzzle solvable in more than one way, the change is reverted.
* Employs a fallback solver that searches for the "best match" within a strict iteration threshold to guarantee games are generated with target clue density (ranging from 55 clues for *Beginner* to 22 clues for *Extreme*).

### 3. Performance Engineering in React
* **Optimal Memoization:** Static grids (given numbers) are computed via `useMemo` to prevent redundant computations on selection shifts.
* **Callback Stability:** Functions modifying state (e.g., cell inputs, pencil-notes toggles) are wrapped in `useCallback` to ensure reference equality and optimize React’s reconciliation loop.
* **Sub-millisecond Linting:** Configured with `Oxlint` (a Rust-powered linter) which validates code quality and catches runtime issues instantly, running over 50x faster than standard ESLint.

### 4. Fully Interactive UX & Accessibility
* **Keyboard Navigation System:** Implements native key listeners supporting directional navigation (arrow keys), number placement (1-9), deletion (Backspace/Delete), pencil-notes toggle (N), and blur (Escape).
* **Smart Pencil-Notes Layer:** Dynamic sub-grids (3x3 absolute overlays) allow players to sketch multiple candidate digits inside unsolved cells.
* **Auto-Pruning Notes:** When a player successfully places a digit, the engine automatically calculates intersecting paths (row, column, 3x3 box) and sweeps conflicting pencil marks.
* **Dynamic Group Highlighting:** Hovering over or selecting any cell dynamically highlights all other cells sharing the same active value, drastically improving board scannability.

---

## 🛠️ Technology Stack

* **Frontend:** React 19 (Hooks: `useState`, `useRef`, `useMemo`, `useCallback`, `useEffect`)
* **Styling:** Modular CSS Custom Properties (CSS variables) for full theme control, combined with CSS Grid and Flexbox for responsive scaling on mobile, tablet, and desktop viewports.
* **Build Tooling:** Vite (for near-instant HMR and optimized production bundles).
* **Linter:** Oxlint (Rust-based validation layer).
* **Deployment:** GitHub Pages (fully automated via simple npm script pipelines).

---

## 📂 Project Structure

```bash
sudoku-react/
├── public/                 # Static assets
├── src/
│   ├── App.jsx            # Main React component, state orchestration, layout, and event handlers
│   ├── main.jsx           # React app entry point and DOM mounting
│   ├── styles.css         # Responsive typography, layout sheets, dark/minimalist design variables
│   └── sudoku.js          # Backtracking solver, generator, bitwise unique validation class
├── package.json           # Scripts, build dependencies, and engine configurations
├── vite.config.js         # Vite bundling configuration
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

Follow these steps to run the engine locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (Node 18+ recommended).

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/sudoku-react.git
cd sudoku-react
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development Mode
```bash
npm run dev
```
Open your browser at the local address shown in the terminal (typically `http://localhost:5173`).

---

## ⌨️ Keyboard Control Bindings

| Key Input | Action Target |
| :--- | :--- |
| `↑` `↓` `←` `→` | Navigate grid selection |
| `1` - `9` | Input number into cell (or toggle pencil note) |
| `Backspace` / `Delete` | Clear current cell value or pencil notes |
| `N` / `n` | Toggle pencil-notes mode |
| `Escape` | Reset selection and highlights |

---

## 📈 Future Roadmaps & Enhancements
* [ ] **Local Storage State Persistence:** Auto-save gameplay progress to local storage so users can resume after a browser crash/refresh.
* [ ] **Custom Board Builder:** Allow users to type/scan custom Sudoku puzzles and solve them using the bitmask backtracking solver.
* [ ] **Dark Mode Toggle:** Integrate system-level dark mode hooks to switch CSS variables smoothly.

---

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](file:///home/jayed/GitHub/sudoku-react/LICENSE) file for details.
