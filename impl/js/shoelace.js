const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const on = (p, q, x) => Math.min(p[0], q[0]) <= x[0] && x[0] <= Math.max(p[0], q[0]) && Math.min(p[1], q[1]) <= x[1] && x[1] <= Math.max(p[1], q[1]);
// 閉線段是否相交（含端點接觸）
function touch(a, b, c, d) {
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  if (d1 && d2 && d3 && d4 && (d1 > 0) !== (d2 > 0) && (d3 > 0) !== (d4 > 0)) return true;
  return (!d1 && on(c, d, a)) || (!d2 && on(c, d, b)) || (!d3 && on(a, b, c)) || (!d4 && on(a, b, d));
}
function isSimple(P) {
  const n = P.length;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      if (touch(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) return false;
    }
  return true;
}
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

for (const P of [[[1, 1], [7, 2], [9, 6], [5, 9], [4, 5], [1, 7]], [[1, 7], [4, 5], [5, 9], [9, 6], [7, 2], [1, 1]], [[0, 0], [6, 0], [6, 4], [3, 2], [0, 4]], [[0, 0], [8, 6], [8, 0], [0, 6]]]) {
  const n = P.length;
  // S = Σ (xᵢ·yᵢ₊₁ − xᵢ₊₁·yᵢ)；有向面積 S/2，正為逆時針
  let s = 0, B = 0;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; s += P[i][0] * P[j][1] - P[j][0] * P[i][1]; }
  const A = s / 2;
  if (!isSimple(P)) { console.log(`signed area ${A.toFixed(1)}, but polygon is not simple: result is not its area`); continue; }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; B += gcd(Math.abs(P[j][0] - P[i][0]), Math.abs(P[j][1] - P[i][1])); }
  console.log(`signed area ${A.toFixed(1)} (${A > 0 ? 'counter-clockwise' : 'clockwise'}), area ${Math.abs(A).toFixed(1)}, Pick: B = ${B}, I = ${(Math.abs(A) - B / 2 + 1).toFixed(0)}`);
}
