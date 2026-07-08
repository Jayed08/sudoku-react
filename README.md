# 🧩 Zen Sudoku Engine

A sleek, ultra-responsive, and minimalist Sudoku game built with **React**, **Vite**, and **Oxlint**. Engineered for speed and smooth gameplay, it includes custom board-generation logic, real-time feedback loops, and multi-modal controls.

🎨 **[https://jayed08.github.io/sudoku-react/]**

---

## ✨ Features

* **6 Core Difficulty Scales:** From *Beginner* to *Extreme ⚡*, accommodating casual players and hardcore logic enthusiasts alike.
* **Intelligent Algorithmic Generation:** Utilizes a custom backtracking algorithm to generate grids, backed by a bitmask unique-solution solver to guarantee every puzzle has exactly one valid resolution.
* **Pencil-In Mock Notes:** Toggle note mode (`✎`) to overlay hypothetical numbers on an absolute 3x3 secondary sub-grid within empty cells.
* **Dynamic Group Highlighting:** Automatically surfaces cells holding the same digit on hover or focus to improve scannability.
* **Complete Native Keyboard Controls:** Full binding map supporting arrow keys for fluid grid navigation, numeric inputs, and clear keys.
* **Mistake Threshold Tracking:** Keeps games engaging with a strict 3-strike mistake constraint and live ticking timers.
* **Highly Responsive Execution:** Optimized via modern CSS grid layouts with fluid typography, performing flawlessly across standard displays and mobile viewpoints.

---

## 🛠️ Tech Stack

* **Core:** React 18+ (Hooks: `useCallback`, `useMemo`, `useRef`, `useState`)
* **Build System:** Vite
* **Linter & Code Guard:** Oxlint (Rust-powered validation)
* **Styles:** Modular Vanilla CSS (`styles.css`) with Custom Properties (Variables)

---

## 🚀 Getting Started

Follow these steps to run the engine locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your computer.

### 1. Clone the Project
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Spin Up Development Environment
```bash
npm run dev
```
Open your local browser context at the terminal-specified host address (usually `http://localhost:5173`).

---

## 🎹 Keyboard Control Bindings

| Key Input | Action Target |
| :--- | :--- |
| `↑` `↓` `←` `→` | Grid Selection Movement |
| `1` - `9` | Input Digit Value into Cell |
| `Backspace` / `Delete` | Clear Current Value or Notes |
| `N` / `n` | Toggle Pencil-Notes Mode On/Off |
| `Escape` | Reset Active Grid Highlight / Blur Selection |

---

## 🧠 Code Architecture Highlights

* **Custom Solvers:** The mathematical puzzle backbone relies on a highly efficient bitmask validator inside `sudoku.js` that performs lightning-fast matrix cell comparisons during generation pipelines.
* **Performance Engineering:** Heavy data array filtering operations—such as clearing duplicate pencil marks out of intersecting boxes and lines—are isolated inside `App.jsx` using `useCallback` hook optimizations to minimize computational frame drops.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more details.
