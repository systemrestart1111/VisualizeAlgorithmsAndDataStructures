const N = 16;
function preset(name) {
  return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
    let v = 30;
    if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
    if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96) v = 140;
    if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
    if (name === 'lowcontrast') return 95 + Math.floor(((v - 30) / 170) * 35 + 0.5) + Math.floor(r / 4) * 3;
    if (name === 'step') return (c < 8 ? 60 : 190) + (r >= 11 ? 40 : 0);
    if (name === 'flat') return 120;
    return v;
  }));
}

// 最大化類間變異數 ω₀ω₁(μ₀ − μ₁)²；空類別跳過；只有一種灰階時 t = 該灰階
function otsu(A) {
  const hist = new Array(256).fill(0);
  for (const v of A.flat()) hist[v]++;
  const P = N * N, levels = hist.map((h, v) => (h ? v : -1)).filter((v) => v >= 0);
  if (levels.length === 1) return { t: levels[0], sb: null };
  let total = 0;
  hist.forEach((h, v) => { total += v * h; });
  let w0 = 0, sum0 = 0, best = -1, bt = 0;
  for (let t = 0; t < 256; t++) {
    w0 += hist[t];
    sum0 += hist[t] * t;
    const w1 = P - w0;
    if (!w0 || !w1) continue;
    const m0 = sum0 / w0, m1 = (total - sum0) / w1;
    const sb = (w0 / P) * (w1 / P) * (m0 - m1) * (m0 - m1);
    if (sb > best) { best = sb; bt = t; }
  }
  return { t: bt, sb: best };
}

for (const name of ['shapes', 'lowcontrast', 'step', 'flat']) {
  const A = preset(name), { t, sb } = otsu(A);
  console.log(`${name}: ${sb === null ? `single gray level, t = ${t}, all background` : `t = ${t}, between-class variance ${sb.toFixed(3)}, foreground ${A.flat().filter((v) => v > t).length} pixels`}`);
}
