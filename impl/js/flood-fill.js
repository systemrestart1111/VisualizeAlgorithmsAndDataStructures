const N4 = [[-1, 0], [0, -1], [0, 1], [1, 0]];
const N8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

// 外框（色 2）左上角缺一格，內部只能斜著碰到外面
function grid() {
  const a = Array.from({ length: 12 }, (_, i) => Array.from({ length: 12 }, (_, j) => (i >= 2 && i <= 9 && j >= 2 && j <= 9 && (i === 2 || i === 9 || j === 2 || j === 9) ? 2 : 1)));
  a[2][2] = 1;
  for (const i of [5, 6]) for (const j of [5, 6]) a[i][j] = 3;
  return a;
}
// BFS 把與種子相連、顏色相同的格子塗成新顏色；新舊色相同時直接結束
function flood(a, sr, sc, nw, nb) {
  const old = a[sr][sc];
  if (old === nw) return 0;
  a[sr][sc] = nw;
  const q = [[sr, sc]];
  let count = 1;
  for (let qi = 0; qi < q.length; qi++) {
    const [r, c] = q[qi];
    for (const [dr, dc] of nb) {
      const y = r + dr, x = c + dc;
      if (y >= 0 && y < 12 && x >= 0 && x < 12 && a[y][x] === old) { a[y][x] = nw; count++; q.push([y, x]); }
    }
  }
  return count;
}

for (const [sr, sc, nw, conn] of [[4, 4, 4, 4], [4, 4, 4, 8], [0, 0, 5, 4], [5, 5, 3, 4], [5, 5, 1, 8], [2, 5, 4, 4]]) {
  const a = grid();
  const n = flood(a, sr, sc, nw, conn === 4 ? N4 : N8);
  console.log(`seed (${sr},${sc}) -> color ${nw}, ${conn}-connected: ${n} cells filled${n === 0 ? ' (same color, nothing to do)' : ''}, grid sum ${a.flat().reduce((x, y) => x + y, 0)}`);
}
