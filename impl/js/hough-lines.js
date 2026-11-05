const N = 16, TH = 60;
const E = Array.from({ length: N }, () => new Array(N).fill(0));
for (let c = 1; c <= 14; c++) E[4][c] = 1;
for (let k = 1; k <= 14; k++) E[15 - k][k] = 1;
for (let r = 7; r <= 15; r++) E[r][12] = 1;

// 每個邊緣點對 θ = 0°, 3°, …, 177° 投票給 ρ = round(x cos θ + y sin θ)；取 5×5 鄰域內的峰值
const D = Math.ceil(Math.hypot(N, N));
const acc = Array.from({ length: 2 * D + 1 }, () => new Array(TH).fill(0));
const cs = Array.from({ length: TH }, (_, t) => Math.cos((t * 3 * Math.PI) / 180)), sn = Array.from({ length: TH }, (_, t) => Math.sin((t * 3 * Math.PI) / 180));
let npts = 0;
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    if (!E[y][x]) continue;
    npts++;
    for (let t = 0; t < TH; t++) acc[Math.floor(x * cs[t] + y * sn[t] + 0.5) + D][t]++;
  }
for (const thr of [8, 12]) {
  const peaks = [];
  for (let i = 0; i <= 2 * D; i++)
    for (let t = 0; t < TH; t++) {
      if (acc[i][t] < thr) continue;
      let ok = true;
      for (let a = -2; a <= 2; a++)
        for (let b = -2; b <= 2; b++) {
          if (!a && !b) continue;
          const y = i + a, tt = (((t + b) % TH) + TH) % TH, yy = t + b < 0 || t + b >= TH ? 2 * D - y : y;
          if (yy >= 0 && yy <= 2 * D && (acc[yy][tt] > acc[i][t] || (acc[yy][tt] === acc[i][t] && (a < 0 || (a === 0 && b < 0))))) ok = false;
        }
      if (ok) peaks.push(`theta ${t * 3}, rho ${i - D}, votes ${acc[i][t]}`);
    }
  console.log(`${npts} edge points, threshold ${thr}: ${peaks.join('; ')}`);
}
