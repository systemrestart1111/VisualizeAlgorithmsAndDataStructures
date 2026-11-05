const fmt = (v) => (Math.abs(v) < 5e-7 ? 0 : v).toFixed(6);

// 修正版 Gram–Schmidt：依序扣掉在每個 q 上的投影，剩下的正規化成新的 q
function qr(A) {
  const m = A.length, n = A[0].length;
  const Q = A.map(() => new Array(n).fill(0)), R = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    const v = A.map((r) => r[j]);
    for (let i = 0; i < j; i++) {
      let s = 0;
      for (let k = 0; k < m; k++) s += Q[k][i] * v[k];
      R[i][j] = s;
      for (let k = 0; k < m; k++) v[k] -= s * Q[k][i];
    }
    let nv = 0;
    for (const x of v) nv += x * x;
    nv = Math.sqrt(nv);
    if (nv < 1e-9) return { bad: j };
    R[j][j] = nv;
    for (let k = 0; k < m; k++) Q[k][j] = v[k] / nv;
  }
  return { Q, R };
}

for (const A of [[[12, -51, 4], [6, 167, -68], [-4, 24, -41]], [[1, 1], [1, 0], [0, 1]], [[1, 2], [2, 4]]]) {
  const res = qr(A), m = A.length, n = A[0].length;
  if (res.bad !== undefined) { console.log(`column ${res.bad + 1} is linearly dependent`); continue; }
  const { Q, R } = res;
  for (const row of Q) console.log(`Q: ${row.map(fmt).join(' ')}`);
  for (const row of R) console.log(`R: ${row.map(fmt).join(' ')}`);
  let e1 = 0, e2 = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { let s = 0; for (let k = 0; k < m; k++) s += Q[k][i] * Q[k][j]; e1 = Math.max(e1, Math.abs(s - (i === j ? 1 : 0))); }
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) { let s = 0; for (let k = 0; k < n; k++) s += Q[i][k] * R[k][j]; e2 = Math.max(e2, Math.abs(s - A[i][j])); }
  console.log(`QtQ = I: ${e1 < 1e-9 ? 'True' : 'False'}, QR = A: ${e2 < 1e-9 ? 'True' : 'False'}`);
}
