const fmt = (v) => (Math.abs(v) < 5e-7 ? 0 : v).toFixed(6);

// PA = LU（部分樞軸）；交換列時 L 已算好的欄也要一起交換
function lu(A) {
  const n = A.length, U = A.map((r) => [...r]), L = A.map((_, i) => A.map((__, j) => (i === j ? 1 : 0))), perm = A.map((_, i) => i);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(U[i][k]) > Math.abs(U[p][k])) p = i;
    if (p !== k) {
      [U[k], U[p]] = [U[p], U[k]];
      [perm[k], perm[p]] = [perm[p], perm[k]];
      for (let j = 0; j < k; j++) [L[k][j], L[p][j]] = [L[p][j], L[k][j]];
    }
    if (Math.abs(U[k][k]) < 1e-12) return { bad: k };
    for (let i = k + 1; i < n; i++) {
      const f = U[i][k] / U[k][k];
      L[i][k] = f;
      for (let j = k; j < n; j++) U[i][j] -= f * U[k][j];
    }
  }
  return { perm, L, U };
}

for (const A of [[[2, 1, 1, 0], [4, 3, 3, 1], [8, 7, 9, 5], [6, 7, 9, 8]], [[1, 2, 3], [2, 4, 6], [1, 0, 1]], [[0, 1], [1, 0]]]) {
  const res = lu(A), n = A.length;
  if (res.bad !== undefined) { console.log(`singular: no pivot in column ${res.bad + 1}`); continue; }
  const { perm, L, U } = res;
  console.log(`perm: ${perm.join(' ')}`);
  for (let i = 0; i < n; i++) console.log(`L: ${L[i].map(fmt).join(' ')} | U: ${U[i].map(fmt).join(' ')}`);
  let err = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { let s = 0; for (let k = 0; k < n; k++) s += L[i][k] * U[k][j]; err = Math.max(err, Math.abs(A[perm[i]][j] - s)); }
  console.log(`PA = LU: ${err < 1e-9 ? 'True' : 'False'}`);
}
