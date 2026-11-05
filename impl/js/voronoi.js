const SITES = [[3, 3], [12, 4], [7, 9], [2, 13], [15, 12], [10, 16], [17, 7]];
const xs = SITES.map((p) => p[0]), ys = SITES.map((p) => p[1]);
const [x0, x1, y0, y1] = [Math.min(...xs) - 3, Math.max(...xs) + 3, Math.min(...ys) - 3, Math.max(...ys) + 3];

// 保留滿足 a·x + b·y <= c 的部分（凸多邊形與半平面的交集）
function clipHalfplane(poly, a, b, c) {
  const out = [];
  poly.forEach((p, k) => {
    const q = poly[(k + 1) % poly.length];
    const fp = a * p[0] + b * p[1] - c, fq = a * q[0] + b * q[1] - c;
    if (fp <= 0) out.push(p);
    if ((fp < 0 && fq > 0) || (fq < 0 && fp > 0)) {
      const t = fp / (fp - fq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  });
  return out;
}
const area = (poly) => Math.abs(poly.reduce((s, p, i) => s + p[0] * poly[(i + 1) % poly.length][1] - poly[(i + 1) % poly.length][0] * p[1], 0)) / 2;

// 站點 i 的 Voronoi 區域 = 外框依序被「比站點 j 更靠近站點 i」的半平面（垂直平分線的一側）裁切後剩下的部分
let total = 0;
SITES.forEach(([sx, sy], i) => {
  let cell = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  SITES.forEach(([tx, ty], j) => {
    // |P - S|² <= |P - T|²  <=>  2(T - S)·P <= |T|² - |S|²
    if (i !== j) cell = clipHalfplane(cell, 2 * (tx - sx), 2 * (ty - sy), tx * tx + ty * ty - sx * sx - sy * sy);
  });
  total += area(cell);
  console.log(`site ${i} (${sx},${sy}): ${cell.length} vertices, area = ${area(cell).toFixed(4)}`);
});
console.log(`sum of areas = ${total.toFixed(4)} (box area = ${(x1 - x0) * (y1 - y0)})`);
