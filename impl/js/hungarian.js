const COST = [[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]];

// 匈牙利演算法 O(n^3)：以位能 u、v 維持「縮減成本 >= 0」，每次加入一列並沿零成本邊找增廣路徑
function hungarian(a) {
  const n = a.length;
  const u = new Array(n + 1).fill(0), v = new Array(n + 1).fill(0);
  const p = new Array(n + 1).fill(0), way = new Array(n + 1).fill(0); // p[j] = 第 j 欄配到的列（1 起算）
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(n + 1).fill(Infinity), used = new Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= n; j++)
        if (!used[j]) {
          const cur = a[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
          if (minv[j] < delta) { delta = minv[j]; j1 = j; }
        }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do { // 沿 way 回溯翻轉
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0);
  }
  const assign = new Array(n);
  for (let j = 1; j <= n; j++) assign[p[j] - 1] = j - 1;
  return assign;
}

const assign = hungarian(COST);
assign.forEach((j, i) => console.log(`row ${i} -> col ${j} (cost ${COST[i][j]})`));
console.log('total cost =', assign.reduce((s, j, i) => s + COST[i][j], 0));
