const EPS = 1e-9;
const fmt = (v) => (Math.abs(v) < 5e-7 ? 0 : v).toFixed(6);

// 兩階段單純形法，入基／出基都用 Bland 法則（編號最小者）避免退化循環
function simplex(c0, cons, isMin) {
  const n = c0.length, m = cons.length;
  const c = c0.map((v) => (isMin ? -v : v));
  const rows = cons.map(([a, op, b]) => (op === '>=' ? [a.map((v) => -v), -b] : [[...a], b]));
  const art = rows.map(([, b], i) => (b < 0 ? i : -1)).filter((i) => i >= 0);
  const K = art.length, N = n + m + K;
  let T = [], basis = [], pivots = 0;
  rows.forEach(([a, b], i) => {
    const sg = b < 0 ? -1 : 1;
    const row = [...a.map((v) => sg * v), ...new Array(m + K).fill(0), sg * b];
    row[n + i] = sg;
    if (b < 0) { row[n + m + art.indexOf(i)] = 1; basis.push(n + m + art.indexOf(i)); } else basis.push(n + i);
    T.push(row);
  });
  const pivot = (pr, pc) => {
    const pv = T[pr][pc];
    T[pr] = T[pr].map((v) => v / pv);
    for (let i = 0; i < T.length; i++) if (i !== pr && Math.abs(T[i][pc]) > 1e-15) { const f = T[i][pc]; T[i] = T[i].map((v, j) => v - f * T[pr][j]); }
    basis[pr] = pc;
  };
  const solve = (cost, allowed) => {
    for (;;) {
      let e = -1;
      for (let j = 0; j < allowed && e < 0; j++) {
        if (basis.includes(j)) continue;
        let red = 0;
        for (let i = 0; i < T.length; i++) red += cost[basis[i]] * T[i][j];
        if (red - cost[j] < -EPS) e = j;
      }
      if (e < 0) return true;
      let l = -1, best = Infinity;
      for (let i = 0; i < T.length; i++)
        if (T[i][e] > EPS) {
          const q = T[i][N] / T[i][e];
          if (q < best - 1e-12 || (Math.abs(q - best) <= 1e-12 && basis[i] < basis[l])) { best = q; l = i; }
        }
      if (l < 0) return false;
      pivot(l, e);
      pivots++;
    }
  };
  if (K) {
    const cost1 = Array.from({ length: N }, (_, j) => (j >= n + m ? -1 : 0));
    solve(cost1, N);
    let z1 = 0;
    for (let i = 0; i < T.length; i++) z1 += cost1[basis[i]] * T[i][N];
    if (z1 < -1e-7) return 'infeasible';
    for (let i = T.length - 1; i >= 0; i--) {
      if (basis[i] < n + m) continue;
      let j = -1;
      for (let k = 0; k < n + m; k++) if (Math.abs(T[i][k]) > EPS) { j = k; break; }
      if (j < 0) { T.splice(i, 1); basis.splice(i, 1); } else pivot(i, j);
    }
  }
  const cost2 = Array.from({ length: N }, (_, j) => (j < n ? c[j] : 0));
  if (!solve(cost2, n + m)) return 'unbounded';
  const x = new Array(n).fill(0);
  basis.forEach((bj, i) => { if (bj < n) x[bj] = T[i][N]; });
  let zz = 0;
  for (let j = 0; j < n; j++) zz += c0[j] * x[j];
  return `optimal ${isMin ? 'min' : 'max'} = ${fmt(zz)} at x = (${x.map(fmt).join(', ')}), ${pivots} pivots`;
}

const tests = [
  ['classic', [3, 5], [[[1, 0], '<=', 4], [[0, 2], '<=', 12], [[3, 2], '<=', 18]], false],
  ['unbounded', [1, 1], [[[1, -1], '<=', 2], [[-1, 1], '<=', 3]], false],
  ['infeasible', [1, 1], [[[1, 1], '<=', 2], [[1, 1], '>=', 5]], false],
  ['min with >=', [2, 3], [[[1, 1], '>=', 4], [[1, 3], '>=', 6], [[1, 0], '<=', 5]], true],
  ['degenerate', [2, 1], [[[1, 1], '<=', 4], [[1, 0], '<=', 2], [[2, 1], '<=', 6]], false],
  ['Beale cycling', [0.75, -20, 0.5, -6], [[[0.25, -8, -1, 9], '<=', 0], [[0.5, -12, -0.5, 3], '<=', 0], [[0, 0, 1, 0], '<=', 1]], false],
];
for (const [name, c, cons, isMin] of tests) console.log(`${name}: ${simplex(c, cons, isMin)}`);
