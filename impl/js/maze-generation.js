const ROWS = 8, COLS = 12;
let state = 42;
// Park–Miller 亂數產生器：五種語言用同一個公式，因此會產生同一個迷宮
const randK = (k) => (state = (state * 48271) % 2147483647) % k;

// 迷宮格子 (r, c) 位於字元圖的 (2r+1, 2c+1)；一開始全是牆
const grid = Array.from({ length: 2 * ROWS + 1 }, () => new Array(2 * COLS + 1).fill('#'));
const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]]; // 上、右、下、左

// 遞迴回溯法（用堆疊實作）：從目前格子隨機走向一個沒去過的鄰格並打通中間的牆；四周都去過就退回上一格
const stack = [[0, 0]];
visited[0][0] = true;
grid[1][1] = ' ';
while (stack.length) {
  const [r, c] = stack[stack.length - 1];
  const nbrs = DIRS.map(([dr, dc]) => [r + dr, c + dc]).filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc]);
  if (!nbrs.length) { stack.pop(); continue; }
  const [nr, nc] = nbrs[randK(nbrs.length)];
  grid[r + nr + 1][c + nc + 1] = ' '; // 兩格中間的牆
  grid[2 * nr + 1][2 * nc + 1] = ' ';
  visited[nr][nc] = true;
  stack.push([nr, nc]);
}
console.log(grid.map((row) => row.join('')).join('\n'));
