const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const byXY = (a, b) => a[0] - b[0] || a[1] - b[1];

// 最左、最右點必在凸包上；遞迴找離線段最遠的點，三角形內的點丟掉
function quickhull(raw) {
  const S = raw.filter((p, i) => raw.findIndex((q) => q[0] === p[0] && q[1] === p[1]) === i);
  const n = S.length;
  let A = 0, B = 0;
  for (let i = 1; i < n; i++) { if (byXY(S[i], S[A]) < 0) A = i; if (byXY(S[i], S[B]) > 0) B = i; }
  const find = (pts, p, q) => {
    if (!pts.length) return [];
    let f = pts[0];
    for (const i of pts) if (cross(S[p], S[q], S[i]) > cross(S[p], S[q], S[f]) + 1e-12) f = i;
    const s1 = pts.filter((i) => cross(S[p], S[f], S[i]) > 1e-9), s2 = pts.filter((i) => cross(S[f], S[q], S[i]) > 1e-9);
    return [...find(s1, p, f), f, ...find(s2, f, q)];
  };
  const rest = S.map((_, i) => i).filter((i) => i !== A && i !== B);
  const cw = [A, ...find(rest.filter((i) => cross(S[A], S[B], S[i]) > 1e-9), A, B), B, ...find(rest.filter((i) => cross(S[A], S[B], S[i]) < -1e-9), B, A)];
  return { S, hull: [cw[0], ...cw.slice(1).reverse()].map((i) => S[i]) };
}
function monotone(S) {
  const p = [...S].sort(byXY);
  if (p.length < 3) return p;
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo.at(-2), lo.at(-1), q) <= 1e-9) lo.pop(); lo.push(q); }
  for (const q of [...p].reverse()) { while (up.length >= 2 && cross(up.at(-2), up.at(-1), q) <= 1e-9) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}

let s = 7;
const rnd = (n) => { s = (s * 48271) % 2147483647; return s % n; };
const t3 = Array.from({ length: 30 }, () => { const x = rnd(100); const y = rnd(100); return [x, y]; });
for (const raw of [[[3, 1], [7, 2], [10, 5], [6, 4], [2, 6], [5, 7], [8, 9], [1, 3], [4, 4], [9, 7], [6, 10], [3, 9], [7, 6], [5, 5]], [[0, 0], [4, 0], [4, 4], [0, 4], [2, 0], [2, 2], [4, 2], [0, 0], [0, 2]], t3]) {
  const { S, hull } = quickhull(raw);
  const a = [...hull].sort(byXY), b = monotone(S).sort(byXY);
  const same = a.length === b.length && a.every((p, i) => byXY(p, b[i]) === 0);
  console.log(`hull (${hull.length}): ${hull.map(([x, y]) => `(${x},${y})`).join(' ')}; same as monotone chain ${same ? 'True' : 'False'}`);
}
