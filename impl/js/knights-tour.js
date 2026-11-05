const N = 6;
const MOVES = [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]];
const board = Array.from({ length: N }, () => new Array(N).fill(0));
let backtracks = 0;
const freeCell = (r, c) => r >= 0 && r < N && c >= 0 && c < N && board[r][c] === 0;
// 從 (r, c) 還能跳到幾個沒走過的格子
const onward = (r, c) => MOVES.filter(([dr, dc]) => freeCell(r + dr, c + dc)).length;

// Warnsdorff 規則：優先跳到「之後出路最少」的格子；仍走不通時回溯
function tour(r, c, step) {
  board[r][c] = step;
  if (step === N * N) return true;
  const cand = MOVES.map(([dr, dc]) => [r + dr, c + dc]).filter(([nr, nc]) => freeCell(nr, nc));
  cand.sort((a, b) => onward(...a) - onward(...b)); // 穩定排序，同分保持 MOVES 的順序
  for (const [nr, nc] of cand) if (tour(nr, nc, step + 1)) return true;
  board[r][c] = 0;
  backtracks++;
  return false;
}

const found = tour(0, 0, 1);
console.log('found:', found ? 'True' : 'False', 'backtracks =', backtracks);
for (const row of board) console.log(row.map((x) => String(x).padStart(3)).join(''));
