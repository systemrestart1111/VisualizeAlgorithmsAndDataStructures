const f3 = (v) => (Math.abs(v) < 5e-4 ? 0 : v).toFixed(3);
const out = (h, x) => h.d[0] * (x[1] - h.p[1]) - h.d[1] * (x[0] - h.p[0]) < -1e-9;
const inter = (s, t) => {
  const al = ((t.p[0] - s.p[0]) * t.d[1] - (t.p[1] - s.p[1]) * t.d[0]) / (s.d[0] * t.d[1] - s.d[1] * t.d[0]);
  return [s.p[0] + s.d[0] * al, s.p[1] + s.d[1] * al];
};

// 每個 a·x + b·y ≤ c 轉成有向線（可行側在左），加大方框，依角度排序後用雙端佇列
function hpi(cons) {
  const H = cons.map(([a, b, c]) => { const n2 = a * a + b * b; return { p: [(a * c) / n2, (b * c) / n2], d: [-b, a], box: false }; });
  const M = Math.max(50, ...cons.map(([a, b, c]) => Math.abs(c) / Math.hypot(a, b))) * 4;
  H.push({ p: [M, -M], d: [0, 1], box: true }, { p: [M, M], d: [-1, 0], box: true }, { p: [-M, M], d: [0, -1], box: true }, { p: [-M, -M], d: [1, 0], box: true });
  H.sort((a, b) => Math.atan2(a.d[1], a.d[0]) - Math.atan2(b.d[1], b.d[0]));
  const dq = [];
  for (const h of H) {
    while (dq.length >= 2 && out(h, inter(dq.at(-1), dq.at(-2)))) dq.pop();
    while (dq.length >= 2 && out(h, inter(dq[0], dq[1]))) dq.shift();
    const last = dq.at(-1);
    if (last && Math.abs(h.d[0] * last.d[1] - h.d[1] * last.d[0]) < 1e-12) {
      if (h.d[0] * last.d[0] + h.d[1] * last.d[1] < 0) return null;
      if (out(h, last.p)) dq.pop();
      else continue;
    }
    dq.push(h);
  }
  while (dq.length >= 3 && out(dq[0], inter(dq.at(-1), dq.at(-2)))) dq.pop();
  while (dq.length >= 3 && out(dq.at(-1), inter(dq[0], dq[1]))) dq.shift();
  if (dq.length < 3) return null;
  const poly = [];
  for (let i = 0; i < dq.length; i++) {
    const p = inter(dq[i], dq[(i + 1) % dq.length]);
    if (!poly.length || Math.hypot(p[0] - poly.at(-1)[0], p[1] - poly.at(-1)[1]) > 1e-9) poly.push(p);
  }
  if (poly.length > 1 && Math.hypot(poly[0][0] - poly.at(-1)[0], poly[0][1] - poly.at(-1)[1]) <= 1e-9) poly.pop();
  return { poly, boxed: dq.some((h) => h.box) };
}

for (const cons of [[[1, 1, 10], [-1, 0, 0], [0, -1, 0], [1, -2, 4], [-2, 1, 6], [1, 0, 7]], [[1, 0, 2], [-1, 0, -5], [0, 1, 5], [0, -1, 0]], [[1, 1, 4], [1, -1, 2], [-1, 0, 1], [1, 1, 6]], [[-1, 0, 0], [0, -1, 0]]]) {
  const res = hpi(cons);
  if (!res) { console.log('empty intersection'); continue; }
  let { poly } = res;
  if (res.boxed) { console.log(`unbounded: clipped by the bounding box (${poly.length} vertices)`); continue; }
  let s = 0;
  const k6 = (v) => Math.round(v * 1e6);
  for (let i = 1; i < poly.length; i++) if (k6(poly[i][0]) < k6(poly[s][0]) || (k6(poly[i][0]) === k6(poly[s][0]) && k6(poly[i][1]) < k6(poly[s][1]))) s = i;
  poly = [...poly.slice(s), ...poly.slice(0, s)];
  const area = Math.abs(poly.reduce((acc, p, i) => { const q = poly[(i + 1) % poly.length]; return acc + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  console.log(`${poly.length}-gon, area ${f3(area)}: ${poly.map(([x, y]) => `(${f3(x)}, ${f3(y)})`).join(' ')}`);
}
