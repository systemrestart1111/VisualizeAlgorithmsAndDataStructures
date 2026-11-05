// 逐欄處理；遮罩記錄目前這一欄已被前一欄橫放骨牌佔走的列
function tilings(R, C) {
  let dp = new Map([[0, 1]]);
  for (let c = 0; c < C; c++) {
    const nd = new Map();
    const fill = (row, cur, nxt, ways) => {
      if (row === R) { nd.set(nxt, (nd.get(nxt) ?? 0) + ways); return; }
      if ((cur >> row) & 1) { fill(row + 1, cur, nxt, ways); return; }
      fill(row + 1, cur, nxt | (1 << row), ways);                                  // 橫放
      if (row + 1 < R && !((cur >> (row + 1)) & 1)) fill(row + 2, cur, nxt, ways);  // 直放
    };
    for (const [m, w] of dp) fill(0, m, 0, w);
    dp = nd;
  }
  return dp.get(0) ?? 0;
}
function brute(R, C) {
  const g = Array.from({ length: R }, () => new Array(C).fill(false));
  const go = (pos) => {
    if (pos === R * C) return 1;
    const i = Math.floor(pos / C), j = pos % C;
    if (g[i][j]) return go(pos + 1);
    let t = 0;
    if (j + 1 < C && !g[i][j + 1]) { g[i][j] = g[i][j + 1] = true; t += go(pos + 1); g[i][j] = g[i][j + 1] = false; }
    if (i + 1 < R) { g[i][j] = g[i + 1][j] = true; t += go(pos + 1); g[i][j] = g[i + 1][j] = false; }
    return t;
  };
  return go(0);
}

for (const [R, C] of [[3, 4], [2, 8], [4, 4], [3, 3], [4, 6], [6, 6]]) console.log(`${R}x${C}: ${tilings(R, C)} tilings` + (R * C <= 24 ? ` (brute ${brute(R, C)})` : ''));
