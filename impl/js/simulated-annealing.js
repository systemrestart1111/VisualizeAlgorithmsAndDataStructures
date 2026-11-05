let st = 0;
const nxt = () => (st = (st * 48271) % 2147483647);
const length = (C, t) => { let s = 0; for (let i = 0; i < t.length; i++) { const a = C[t[i]], b = C[t[(i + 1) % t.length]]; s += Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2); } return s; };

// 2-opt 反轉一段；變短必接受，變長以 e^(−Δ/T) 接受；T 每步乘以冷卻率
function anneal(C, seed, steps, cool) {
  st = seed;
  const n = C.length;
  let tour = C.map((_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = nxt() % (i + 1); [tour[i], tour[j]] = [tour[j], tour[i]]; }
  let cur = length(C, tour), best = cur, T = 2.0, worse = 0;
  for (let s = 0; s < steps; s++) {
    let i = nxt() % n, j = nxt() % n;
    if (i > j) [i, j] = [j, i];
    if (i === j) { T *= cool; continue; }
    const nt = [...tour.slice(0, i), ...tour.slice(i, j + 1).reverse(), ...tour.slice(j + 1)];
    const nl = length(C, nt);
    let d = nl - cur;
    if (Math.abs(d) < 1e-9) d = 0; // 長度相同（例如整條路線反轉）時視為 0，避免不同語言的捨入差異
    if (d < 0 || nxt() / 2147483647 < Math.exp(-d / T)) {
      if (d > 0) worse++;
      tour = nt; cur = nl;
      if (cur < best - 1e-12) best = cur;
    }
    T *= cool;
  }
  return { best, worse };
}
function brute(C) {
  let best = Infinity;
  const perm = (a, k) => { if (k === a.length) { best = Math.min(best, length(C, a)); return; } for (let i = k; i < a.length; i++) { [a[k], a[i]] = [a[i], a[k]]; perm(a, k + 1); [a[k], a[i]] = [a[i], a[k]]; } };
  perm(C.map((_, i) => i), 1);
  return best;
}

st = 21;
const C = Array.from({ length: 8 }, () => { const x = (nxt() % 1000) / 100; const y = (nxt() % 1000) / 100; return [x, y]; });
const opt = brute(C);
console.log(`8 cities, brute-force optimum ${opt.toFixed(3)}`);
for (const [seed, steps, cool] of [[7, 2000, 0.997], [7, 300, 0.99], [11, 2000, 0.997], [3, 8000, 0.9995]]) {
  const { best, worse } = anneal(C, seed, steps, cool);
  console.log(`seed ${seed}, ${steps} steps, cooling ${cool}: best ${best.toFixed(3)}, gap ${((100 * (best - opt)) / opt).toFixed(2)}%, accepted ${worse} worse moves`);
}
