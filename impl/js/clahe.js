const N = 16;
function preset(low) {
  return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
    let v = 30;
    if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
    if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96) v = 140;
    if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
    return low ? 95 + Math.floor(((v - 30) / 170) * 35 + 0.5) + Math.floor(r / 4) * 3 : v;
  }));
}
const rnd = (x) => (x >= 0 ? Math.floor(x + 0.5) : -Math.floor(-x + 0.5));

// 每格直方圖裁切上限後平均分回（總數不變），各自求對應表，再以雙線性內插消除接縫
function clahe(A, T, clip) {
  const ts = N / T, P = ts * ts, limit = Math.max(1, Math.ceil((clip * P) / 256));
  let ok = true;
  const maps = [];
  for (let ti = 0; ti < T; ti++) {
    maps.push([]);
    for (let tj = 0; tj < T; tj++) {
      let h = new Array(256).fill(0);
      for (let i = 0; i < ts; i++) for (let j = 0; j < ts; j++) h[A[ti * ts + i][tj * ts + j]]++;
      let excess = 0;
      h = h.map((v) => { if (v > limit) { excess += v - limit; return limit; } return v; });
      const each = Math.floor(excess / 256), rem = excess % 256;
      h = h.map((v, i) => v + each + (i < rem ? 1 : 0));
      if (h.reduce((a, b) => a + b, 0) !== P) ok = false;
      let s = 0;
      maps[ti].push(h.map((v) => { s += v; return rnd((s * 255) / P); }));
    }
  }
  const no = A.map((row, r) => row.map((v, c) => maps[Math.floor(r / ts)][Math.floor(c / ts)][v]));
  const out = A.map((row, r) => row.map((v, c) => {
    const fy = (r + 0.5) / ts - 0.5, fx = (c + 0.5) / ts - 0.5;
    const y0 = Math.max(0, Math.min(T - 1, Math.floor(fy))), x0 = Math.max(0, Math.min(T - 1, Math.floor(fx)));
    const y1 = Math.min(T - 1, y0 + 1), x1 = Math.min(T - 1, x0 + 1);
    const wy = Math.max(0, Math.min(1, fy - y0)), wx = Math.max(0, Math.min(1, fx - x0));
    return rnd((1 - wy) * ((1 - wx) * maps[y0][x0][v] + wx * maps[y0][x1][v]) + wy * ((1 - wx) * maps[y1][x0][v] + wx * maps[y1][x1][v]));
  }));
  const seam = (a) => { let d = 0; for (let k = 1; k < T; k++) for (let i = 0; i < N; i++) d += Math.abs(a[i][k * ts] - a[i][k * ts - 1]) + Math.abs(a[k * ts][i] - a[k * ts - 1][i]); return d; };
  return { limit, ok, s1: seam(no), s2: seam(out), total: out.flat().reduce((a, b) => a + b, 0) };
}

for (const [name, low] of [['lowcontrast', true], ['shapes', false]])
  for (const [T, clip] of [[2, 8], [4, 4], [2, 32]]) {
    const { limit, ok, s1, s2, total } = clahe(preset(low), T, clip);
    console.log(`${name}, ${T}x${T} tiles, clip ${clip}: limit ${limit}, totals preserved ${ok ? 'True' : 'False'}, seam without/with interpolation ${s1}/${s2}, output sum ${total}`);
  }
