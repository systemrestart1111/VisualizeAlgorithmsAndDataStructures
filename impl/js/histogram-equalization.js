const N = 16;
function preset(name) {
  return Array.from({ length: N }, (_, r) => Array.from({ length: N }, (_, c) => {
    if (name === 'flat') return 120;
    let v = 30;
    if (r >= 2 && r <= 6 && c >= 2 && c <= 7) v = 200;
    if ((r - 10.5) ** 2 + (c - 10.5) ** 2 <= 12.96) v = 140;
    if (r >= 9 && r <= 14 && c >= 1 && c <= r - 8) v = 90;
    return name === 'lowcontrast' ? 95 + Math.floor(((v - 30) / 170) * 35 + 0.5) + Math.floor(r / 4) * 3 : v;
  }));
}

// map[v] = round((CDF[v] − CDF_min) / (N − CDF_min) × 255)；常數影像原樣輸出
for (const name of ['lowcontrast', 'shapes', 'flat']) {
  const hist = new Array(256).fill(0);
  for (const v of preset(name).flat()) hist[v]++;
  const cdf = [];
  let s = 0;
  for (const h of hist) { s += h; cdf.push(s); }
  const cmin = cdf.find((c) => c > 0);
  if (cmin === N * N) { console.log(`${name}: constant image, unchanged`); continue; }
  const used = hist.map((h, v) => (h ? v : -1)).filter((v) => v >= 0);
  console.log(`${name}: ${used.map((v) => `${v}->${Math.floor(((cdf[v] - cmin) * 255) / (N * N - cmin) + 0.5)}`).join(' ')}`);
}
