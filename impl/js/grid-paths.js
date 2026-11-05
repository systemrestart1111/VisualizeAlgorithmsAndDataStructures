const GRID = ['1 3 1 2', '1 # 1 4', '4 2 1 3', '2 1 # 1'].map((r) => r.split(' ')); // 只能往右或往下，# 為障礙
const R = GRID.length, C = GRID[0].length;
const count = Array.from({ length: R }, () => new Array(C).fill(0));   // 路徑數：上方 + 左方
const best = Array.from({ length: R }, () => new Array(C).fill(Infinity)); // 最小路徑和：min(上方, 左方) + 自己
for (let r = 0; r < R; r++)
  for (let c = 0; c < C; c++) {
    if (GRID[r][c] === '#') continue;
    const v = Number(GRID[r][c]);
    if (r === 0 && c === 0) { count[r][c] = 1; best[r][c] = v; continue; }
    count[r][c] = (r ? count[r - 1][c] : 0) + (c ? count[r][c - 1] : 0);
    best[r][c] = Math.min(r ? best[r - 1][c] : Infinity, c ? best[r][c - 1] : Infinity) + v;
  }
console.log('paths =', count[R - 1][C - 1]);
console.log('min path sum =', best[R - 1][C - 1]);
