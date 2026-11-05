const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
// 上方平坦、左側只有垂直條紋（孔徑問題）、右下是二維紋理
const tex = (y, x) => 128 + smooth(y - 4) * (50 * Math.sin(0.5 * x) + smooth((x - 7) / 2) * (40 * Math.sin(0.45 * y + 0.3 * x) + 30 * Math.cos(0.35 * x - 0.4 * y)));
const z = (v) => (Math.abs(v) < 0.005 ? 0 : v);

// Ix·u + Iy·v + It = 0 在 5×5 視窗內以最小平方求解；依特徵值判斷可靠／孔徑問題／平坦
function lucasKanade(du, dv) {
  const I1 = Array.from({ length: 16 }, (_, r) => Array.from({ length: 16 }, (_, c) => tex(r, c)));
  const I2 = Array.from({ length: 16 }, (_, r) => Array.from({ length: 16 }, (_, c) => tex(r - dv, c - du)));
  const Ix = I1.map((row, r) => row.map((_, c) => (c > 0 && c < 15 ? (I1[r][c + 1] - I1[r][c - 1]) / 2 : 0)));
  const Iy = I1.map((row, r) => row.map((_, c) => (r > 0 && r < 15 ? (I1[r + 1][c] - I1[r - 1][c]) / 2 : 0)));
  const out = [];
  for (const i of [1, 8, 12])
    for (const j of [2, 4, 11, 13]) {
      let a = 0, b = 0, c = 0, bx = 0, by = 0;
      for (let y = Math.max(1, i - 2); y <= Math.min(14, i + 2); y++)
        for (let x = Math.max(1, j - 2); x <= Math.min(14, j + 2); x++) {
          const it = I2[y][x] - I1[y][x];
          a += Ix[y][x] * Ix[y][x]; b += Ix[y][x] * Iy[y][x]; c += Iy[y][x] * Iy[y][x];
          bx -= Ix[y][x] * it; by -= Iy[y][x] * it;
        }
      const tr = a + c, det = a * c - b * b, disc = Math.sqrt(Math.max(0, (tr / 2) * (tr / 2) - det));
      const l1 = tr / 2 + disc, l2 = tr / 2 - disc;
      if (l1 < 200) out.push(`(${i},${j}) flat`);
      else if (l2 < 0.05 * l1) out.push(`(${i},${j}) aperture`);
      else out.push(`(${i},${j}) (${z((c * bx - b * by) / det).toFixed(2)}, ${z((a * by - b * bx) / det).toFixed(2)})`);
    }
  return out;
}

for (const [du, dv] of [[1, 0.5], [0.5, 0], [0, 1], [3, 2]]) console.log(`true (${du}, ${dv}): ${lucasKanade(du, dv).join('; ')}`);
