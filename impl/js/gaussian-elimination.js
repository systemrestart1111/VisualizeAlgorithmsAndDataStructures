const M = [[2, 1, -1, 8], [-3, -1, 2, -11], [-2, 1, 2, -3]]; // 增廣矩陣 [A | b]
const n = M.length;

// 前向消去：每一欄選絕對值最大的列當主元（部分樞軸），再消去下方各列；最後回代求解
for (let col = 0; col < n; col++) {
  let piv = col;
  for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
  if (piv !== col) {
    [M[col], M[piv]] = [M[piv], M[col]];
    console.log(`swap rows ${col} and ${piv}`);
  }
  for (let r = col + 1; r < n; r++) {
    const factor = M[r][col] / M[col][col];
    for (let c = col; c <= n; c++) M[r][c] -= factor * M[col][c];
  }
}
const x = new Array(n).fill(0);
for (let r = n - 1; r >= 0; r--) {
  let s = M[r][n];
  for (let c = r + 1; c < n; c++) s -= M[r][c] * x[c];
  x[r] = s / M[r][r];
}
console.log('solution:', x.map((v, i) => `x${i} = ${(Math.abs(v) < 1e-9 ? 0 : v).toFixed(4)}`).join(' '));
