const fmt = (v) => (Math.abs(v) < 5e-7 ? 0 : v).toFixed(6);

// 對稱且 Cholesky 成功才是對稱正定
function isSpd(A) {
  const n = A.length;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (A[i][j] !== A[j][i]) return false;
  const L = A.map(() => new Array(n).fill(0));
  for (let i = 0; i < n; i++)
    for (let j = 0; j <= i; j++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) { if (s <= 1e-12) return false; L[i][i] = Math.sqrt(s); }
      else L[i][j] = s / L[j][j];
    }
  return true;
}

// 方向 p 彼此 A-共軛：α = rᵀr / pᵀAp，β = r_newᵀr_new / rᵀr；至多 n 步
function cg(A, b) {
  const n = A.length, x = new Array(n).fill(0);
  let r = [...b], p = [...b];
  for (let k = 1; k < n + 6; k++) {
    const Ap = new Array(n).fill(0), rn = [];
    let rr = 0, pAp = 0, rnn = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) Ap[i] += A[i][j] * p[j];
    for (let i = 0; i < n; i++) rr += r[i] * r[i];
    for (let i = 0; i < n; i++) pAp += p[i] * Ap[i];
    const alpha = rr / pAp;
    for (let i = 0; i < n; i++) { x[i] += alpha * p[i]; rn.push(r[i] - alpha * Ap[i]); }
    for (const v of rn) rnn += v * v;
    if (Math.sqrt(rnn) < 1e-10) return { x, k };
    const beta = rnn / rr;
    p = rn.map((v, i) => v + beta * p[i]);
    r = rn;
  }
  return { x, k: 0 };
}

for (const [A, b] of [[[[3, 2], [2, 6]], [2, -8]], [[[4, 1, 0], [1, 3, 1], [0, 1, 2]], [1, 2, 3]], [[[4, 1], [1, 3]], [1, 2]], [[[1, 2], [2, 1]], [1, 1]]]) {
  if (!isSpd(A)) { console.log('not symmetric positive definite: CG not applicable'); continue; }
  const { x, k } = cg(A, b), n = A.length;
  let res = 0;
  for (let i = 0; i < n; i++) { let s = b[i]; for (let j = 0; j < n; j++) s -= A[i][j] * x[j]; res += s * s; }
  console.log(`x = (${x.map(fmt).join(', ')}) in ${k} steps (n = ${n}), residual small ${Math.sqrt(res) < 1e-9 ? 'True' : 'False'}`);
}
