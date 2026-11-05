const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const area = (P) => P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;

// 凸頂點且三角形內沒有其他頂點 → 耳朵；切下來直到剩一個三角形
function earClipping(P) {
  const idx = P.map((_, i) => i);
  if (area(P) < 0) idx.reverse();
  const tris = [];
  while (idx.length > 3) {
    const m = idx.length;
    let clipped = false;
    for (let k = 0; k < m && !clipped; k++) {
      const p = idx[(k + m - 1) % m], i = idx[k], q = idx[(k + 1) % m];
      if (cross(P[p], P[i], P[q]) <= 1e-12) continue; // 凹頂點
      const inside = idx.some((j) => j !== p && j !== i && j !== q && cross(P[p], P[i], P[j]) >= -1e-12 && cross(P[i], P[q], P[j]) >= -1e-12 && cross(P[q], P[p], P[j]) >= -1e-12);
      if (inside) continue;
      tris.push([p, i, q]);
      idx.splice(k, 1);
      clipped = true;
    }
    if (!clipped) return null;
  }
  tris.push([...idx]);
  return tris;
}

for (const P of [[[0, 0], [8, 0], [8, 6], [5, 3], [3, 7], [1, 4]], [[0, 0], [10, 0], [10, 8], [7, 8], [7, 3], [3, 3], [3, 8], [0, 8]], [[1, 4], [3, 7], [5, 3], [8, 6], [8, 0], [0, 0]]]) {
  const tris = earClipping(P);
  const total = tris.reduce((s, t) => s + Math.abs(area(t.map((i) => P[i]))), 0);
  console.log(`${P.length} vertices -> ${tris.length} triangles: ${tris.map((t) => t.join('-')).join(' ')}; area sum ${total.toFixed(2)} = shoelace ${Math.abs(area(P)).toFixed(2)}`);
}
