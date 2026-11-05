const PUZZLE = ['530070000', '600195000', '098000060', '800060003', '400803001', '700020006', '060000280', '000419005', '000080079'];
const board = PUZZLE.map((row) => [...row].map(Number));

// 同列、同欄、同 3x3 宮內都不能出現 d
function ok(r, c, d) {
  for (let k = 0; k < 9; k++) if (board[r][k] === d || board[k][c] === d) return false;
  const br = r - (r % 3), bc = c - (c % 3);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (board[br + i][bc + j] === d) return false;
  return true;
}

// 找下一個空格依序試 1..9，填不下去就回溯
function solve() {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] === 0) {
        for (let d = 1; d <= 9; d++)
          if (ok(r, c, d)) {
            board[r][c] = d;
            if (solve()) return true;
            board[r][c] = 0;
          }
        return false;
      }
  return true;
}

console.log('solved:', solve() ? 'True' : 'False');
for (const row of board) console.log(row.join(' '));
