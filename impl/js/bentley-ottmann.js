function segX(s, t) {
  const [[x1, y1], [x2, y2]] = s, [[x3, y3], [x4, y4]] = t;
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (Math.abs(d) < 1e-12) return null;
  const u = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d, v = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  if (u < -1e-9 || u > 1 + 1e-9 || v < -1e-9 || v > 1 + 1e-9) return null;
  return [x1 + u * (x2 - x1), y1 + u * (y2 - y1)];
}
const key = (p) => `${Math.round(p[0] * 1e6)},${Math.round(p[1] * 1e6)}`;
const f3 = (v) => (Math.abs(v) < 5e-4 ? 0 : v).toFixed(3);

// 掃描線由左往右；只檢查 status 中新相鄰的一對；同點多線只回報一次
function bentleyOttmann(raw) {
  const L = raw.map(([x1, y1, x2, y2]) => (x1 < x2 ? [[x1, y1], [x2, y2]] : [[x2, y2], [x1, y1]]));
  const yAt = (s, x) => s[0][1] + ((s[1][1] - s[0][1]) * (x - s[0][0])) / (s[1][0] - s[0][0]);
  const xs = L.flat().map((p) => p[0]);
  const delta = (Math.max(...xs) - Math.min(...xs) + 2) * 1e-7;
  const rank = { 0: 1, 1: 0, 2: 2 };
  const Q = [...L.map((s, i) => [s[0][0], s[0][1], 0, i]), ...L.map((s, i) => [s[1][0], s[1][1], 2, i])];
  const sortQ = () => Q.sort((p, q) => p[0] - q[0] || p[1] - q[1] || rank[p[2]] - rank[q[2]]);
  sortQ();
  let status = [];
  const queued = new Set(), found = [];
  while (Q.length) {
    const [x, y, kind, s] = Q.shift();
    const before = new Set(status.slice(0, -1).map((a, k) => `${Math.min(a, status[k + 1])}-${Math.max(a, status[k + 1])}`));
    if (kind === 0) { status.push(s); status.sort((i, j) => yAt(L[i], x + delta) - yAt(L[j], x + delta)); }
    else if (kind === 2) status = status.filter((i) => i !== s);
    else {
      const through = L.map((t, i) => (t[0][0] - 1e-9 <= x && x <= t[1][0] + 1e-9 && Math.abs(yAt(t, x) - y) < 1e-7 ? i : -1)).filter((i) => i >= 0);
      found.push([[x, y], through]);
      status.sort((i, j) => yAt(L[i], x + delta) - yAt(L[j], x + delta));
    }
    for (let k = 0; k + 1 < status.length; k++) {
      const a = status[k], b = status[k + 1];
      if (before.has(`${Math.min(a, b)}-${Math.max(a, b)}`)) continue;
      const p = segX(L[a], L[b]);
      if (!p || p[0] < x - 1e-9 || (Math.abs(p[0] - x) <= 1e-9 && p[1] < y - 1e-9)) continue;
      if (queued.has(key(p))) continue;
      queued.add(key(p));
      Q.push([p[0], p[1], 1, -1]);
    }
    sortQ();
  }
  const brute = new Set();
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const p = segX(L[i], L[j]); if (p) brute.add(key(p)); }
  const mine = new Set(found.map(([p]) => key(p)));
  return { found, ok: brute.size === mine.size && [...brute].every((k) => mine.has(k)) };
}

for (const segs of [
  [[1, 2, 9, 8], [1, 7, 8, 1], [3, 1, 10, 6], [2, 9, 11, 3], [4, 5, 12, 5], [6, 8, 12, 9]],
  [[0, 0, 10, 10], [0, 10, 10, 0], [0, 5, 10, 5], [2, 8, 4, 9]],
  [[0, 0, 5, 5], [5, 5, 10, 0], [1, 4, 9, 4]],
]) {
  const { found, ok } = bentleyOttmann(segs);
  found.sort((a, b) => a[0][0] - b[0][0] || a[0][1] - b[0][1]);
  console.log(`${found.length} intersections (brute force agrees ${ok ? 'True' : 'False'})`);
  for (const [p, through] of found) console.log(`  (${f3(p[0])}, ${f3(p[1])}): segments ${through.join(' ')}`);
}
