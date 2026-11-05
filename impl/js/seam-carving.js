const N = 16;
function preset(name) {
  return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
    if (name === 'step') return (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0);
    let v = 30;
    if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
    if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96) v = 140;
    if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
    return v;
  }));
}

// e = |Gx| + |Gy|；M[r][c] = e + min(M[r−1][c−1..c+1])；最後一列取最小，再往上追溯
function findSeam(A) {
  const W = A[0].length;
  const g = (r, c) => A[Math.min(N - 1, Math.max(0, r))][Math.min(W - 1, Math.max(0, c))];
  const M = A.map((row, r) => row.map((_, c) => {
    const gx = g(r - 1, c + 1) + 2 * g(r, c + 1) + g(r + 1, c + 1) - g(r - 1, c - 1) - 2 * g(r, c - 1) - g(r + 1, c - 1);
    const gy = g(r + 1, c - 1) + 2 * g(r + 1, c) + g(r + 1, c + 1) - g(r - 1, c - 1) - 2 * g(r - 1, c) - g(r - 1, c + 1);
    return Math.abs(gx) + Math.abs(gy);
  }));
  for (let r = 1; r < N; r++) for (let c = 0; c < W; c++) M[r][c] += Math.min(M[r - 1][c], c > 0 ? M[r - 1][c - 1] : Infinity, c < W - 1 ? M[r - 1][c + 1] : Infinity);
  const seam = new Array(N);
  seam[N - 1] = 0;
  for (let c = 1; c < W; c++) if (M[N - 1][c] < M[N - 1][seam[N - 1]]) seam[N - 1] = c;
  for (let r = N - 2; r >= 0; r--) {
    let b = seam[r + 1];
    for (const k of [seam[r + 1] - 1, seam[r + 1] + 1]) if (k >= 0 && k < W && M[r][k] < M[r][b]) b = k;
    seam[r] = b;
  }
  return { seam, cost: M[N - 1][seam[N - 1]] };
}

for (const name of ['shapes', 'step']) {
  let A = preset(name);
  for (let s = 1; s <= 3; s++) {
    const { seam, cost } = findSeam(A);
    const ok = seam.every((v, r) => r === 0 || Math.abs(v - seam[r - 1]) <= 1);
    console.log(`${name} seam ${s}: cost ${cost}, columns ${seam.join(' ')}, connected ${ok ? 'True' : 'False'}`);
    A = A.map((row, r) => row.filter((_, c) => c !== seam[r]));
  }
  console.log(`${name}: width now ${A[0].length}, pixel sum ${A.flat().reduce((a, b) => a + b, 0)}`);
}
