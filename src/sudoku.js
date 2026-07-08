export class Sudoku {
  constructor() {
    this.board = [];
  }

  generate(level) {
    const difficultyMap = {
      Beginner: 55,
      Easy: 44,
      Medium: 37,
      Hard: 31,
      Expert: 26,
      Extreme: 22,
    };

    const targetClues = difficultyMap[level] || difficultyMap.Easy;
    const holesToDig = 81 - targetClues;
    const maxAttempts = 500;

    let bestPuzzle = [];
    let bestSolution = [];
    let minCluesFound = 81;

    for (let attempts = 0; attempts < maxAttempts; attempts += 1) {
      this.board = Array.from({ length: 9 }, () => Array(9).fill(0));
      this.fillDiagonal();
      this.solve(this.board);

      const solutionFlat = this.board.flat();
      const removedCount = this.removeDigits(holesToDig);
      const currentClues = 81 - removedCount;

      if (currentClues < minCluesFound) {
        minCluesFound = currentClues;
        bestPuzzle = this.board.flat();
        bestSolution = solutionFlat;
      }

      if (removedCount === holesToDig) {
        return { puzzle: this.board.flat(), solution: solutionFlat };
      }
    }

    return { puzzle: bestPuzzle, solution: bestSolution };
  }

  fillDiagonal() {
    for (let i = 0; i < 9; i += 3) {
      this.fillBox(i, i);
    }
  }

  fillBox(row, col) {
    for (let i = 0; i < 3; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        let num;
        do {
          num = Math.floor(Math.random() * 9) + 1;
        } while (!this.isSafeInBox(row, col, num));
        this.board[row + i][col + j] = num;
      }
    }
  }

  solve(board) {
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        if (board[row][col] === 0) {
          for (let num = 1; num <= 9; num += 1) {
            if (this.isSafe(board, row, col, num)) {
              board[row][col] = num;
              if (this.solve(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  removeDigits(targetHoles) {
    const fastUniqueCheck = (board) => {
      const rowMasks = new Int16Array(9);
      const colMasks = new Int16Array(9);
      const boxMasks = new Int16Array(9);

      for (let r = 0; r < 9; r += 1) {
        for (let c = 0; c < 9; c += 1) {
          const val = board[r][c];
          if (val !== 0) {
            const bit = 1 << (val - 1);
            rowMasks[r] |= bit;
            colMasks[c] |= bit;
            boxMasks[Math.floor(r / 3) * 3 + Math.floor(c / 3)] |= bit;
          }
        }
      }

      let solutions = 0;
      const solve = (idx) => {
        if (solutions > 1) return;
        if (idx === 81) {
          solutions += 1;
          return;
        }

        const r = Math.floor(idx / 9);
        const c = idx % 9;

        if (board[r][c] !== 0) {
          solve(idx + 1);
          return;
        }

        const boxIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        const taken = rowMasks[r] | colMasks[c] | boxMasks[boxIndex];

        for (let num = 1; num <= 9; num += 1) {
          const bit = 1 << (num - 1);
          if ((taken & bit) === 0) {
            rowMasks[r] |= bit;
            colMasks[c] |= bit;
            boxMasks[boxIndex] |= bit;
            board[r][c] = num;
            solve(idx + 1);
            board[r][c] = 0;
            rowMasks[r] &= ~bit;
            colMasks[c] &= ~bit;
            boxMasks[boxIndex] &= ~bit;
            if (solutions > 1) return;
          }
        }
      };

      solve(0);
      return solutions === 1;
    };

    const getRemovalScore = (r, c, board) => {
      const rowCount = board[r].reduce((sum, value) => sum + Number(value !== 0), 0);
      const colCount = board.reduce((sum, row) => sum + Number(row[c] !== 0), 0);
      const sr = 8 - r;
      const sc = 8 - c;

      return rowCount * 10 + colCount * 10 + (board[sr][sc] !== 0 ? 5 : 0);
    };

    const candidates = [];
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        candidates.push({ r, c });
      }
    }

    for (let i = candidates.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    candidates.sort((a, b) => getRemovalScore(b.r, b.c, this.board) - getRemovalScore(a.r, a.c, this.board));

    let removed = 0;
    for (const { r, c } of candidates) {
      if (removed >= targetHoles) break;

      const value = this.board[r][c];
      this.board[r][c] = 0;

      if (fastUniqueCheck(this.board)) {
        removed += 1;
      } else {
        this.board[r][c] = value;
      }
    }

    return removed;
  }

  isSafe(board, row, col, num) {
    return (
      this.isSafeInRow(board, row, num) &&
      this.isSafeInCol(board, col, num) &&
      this.isSafeInBox(row - (row % 3), col - (col % 3), num)
    );
  }

  isSafeInRow(board, row, num) {
    for (let c = 0; c < 9; c += 1) {
      if (board[row][c] === num) return false;
    }
    return true;
  }

  isSafeInCol(board, col, num) {
    for (let r = 0; r < 9; r += 1) {
      if (board[r][col] === num) return false;
    }
    return true;
  }

  isSafeInBox(rowStart, colStart, num) {
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (this.board[rowStart + r][colStart + c] === num) return false;
      }
    }
    return true;
  }
}
