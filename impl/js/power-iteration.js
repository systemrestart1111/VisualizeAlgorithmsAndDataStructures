const fmt = (v) => (Math.abs(v) < 5e-7 ? 0 : v).toFixed(6);

// x ← Ax / ‖Ax‖；Rayleigh 商 xᵀAx 估計主特徵值；方向不再改變（含正負號翻轉）即收斂
function powerIteration(A, x0, steps = 60) {
  const n = A.length;
  let nx = 0;
  for (const v of x0) nx += v * v;
  nx = Math.sqrt(nx);
  let x = x0.map((v) => v / nx), lam = 0;
  for (let k = 1; k <= steps; k++) {
    const y = new Array(n).fill(0);
    let ny = 0, l = 0, dm = 0, dp = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) y[i] += A[i][j] * x[j];
    for (let i = 0; i < n; i++) l += x[i] * y[i];
    for (let i = 0; i < n; i++) ny += y[i] * y[i];
    ny = Math.sqrt(ny);
    const xn = [];
    for (let i = 0; i < n; i++) { const v = y[i] / ny; dm += (v - x[i]) * (v - x[i]); dp += (v + x[i]) * (v + x[i]); xn.push(v); }
    x = xn;
    lam = l;
    if (Math.min(Math.sqrt(dm), Math.sqrt(dp)) < 1e-10) return { lam, x, k };
  }
  return null;
}

for (const [A, x0] of [[[[2, 1], [1, 3]], [1, 0]], [[[2, 0, 0], [0, 1, 0], [0, 0, 3]], [1, 1, 1]], [[[4, 1], [2, 3]], [1, 1]], [[[0, 1], [1, 0]], [1, 0]]]) {
  const res = powerIteration(A, x0);
  if (!res) console.log('no convergence in 60 steps (|lambda1| = |lambda2|?)');
  else console.log(`lambda = ${fmt(res.lam)}, x = (${res.x.map(fmt).join(', ')}), steps ${res.k}`);
}
