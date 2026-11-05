const N = 16;
const N4 = [[-1, 0], [0, -1], [0, 1], [1, 0]];
const N8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const blobs = () => Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => ((r - 5.5) ** 2 + (c - 5) ** 2 <= 16 || (r - 9) ** 2 + (c - 10.5) ** 2 <= 16 || (r - 13) ** 2 + (c - 2.5) ** 2 <= 3.5 ? 1 : 0)));
function noisyBin() {
  const a = blobs();
  let s = 5;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { s = (s * 48271) % 2147483647; if (s % 100 < 6) a[r][c] = 1 - a[r][c]; }
  return a;
}
// 侵蝕：蓋到的全為 1 才為 1；膨脹：蓋到任一為 1 就為 1；邊界外視為 0
function morph(a, se, erode) {
  const get = (r, c) => (r >= 0 && r < N && c >= 0 && c < N ? a[r][c] : 0);
  return a.map((row, r) => row.map((_, c) => { const vals = se.map(([dr, dc]) => get(r + dr, c + dc)); return (erode ? vals.every((v) => v) : vals.some((v) => v)) ? 1 : 0; }));
}
const count = (a) => a.flat().reduce((x, y) => x + y, 0);
function components(a) {
  const seen = a.map((row) => row.map(() => false));
  let n = 0;
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (!a[r][c] || seen[r][c]) continue;
      n++;
      const st = [[r, c]];
      seen[r][c] = true;
      while (st.length) {
        const [y, x] = st.pop();
        for (const [dy, dx] of N4) {
          const yy = y + dy, xx = x + dx;
          if (yy >= 0 && yy < N && xx >= 0 && xx < N && a[yy][xx] && !seen[yy][xx]) { seen[yy][xx] = true; st.push([yy, xx]); }
        }
      }
    }
  return n;
}

for (const [name, A] of [['noisy blobs', noisyBin()], ['blobs', blobs()]])
  for (const [sname, se] of [['square', [[0, 0], ...N8]], ['cross', [[0, 0], ...N4]]]) {
    const er = morph(A, se, true), di = morph(A, se, false), op = morph(er, se, false), cl = morph(di, se, true);
    console.log(`${name}, ${sname}: input ${count(A)} (${components(A)} parts), erode ${count(er)}, dilate ${count(di)}, open ${count(op)} (${components(op)} parts), close ${count(cl)} (${components(cl)} parts)`);
  }
