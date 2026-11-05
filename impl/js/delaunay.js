const PTS = [[3, 3], [12, 4], [7, 9], [2, 13], [15, 12], [10, 16], [17, 7], [8, 2], [5, 6]];
const n = PTS.length;
const P = [...PTS, [-1000, -1000], [1000, -1000], [0, 1000]]; // 最後三點是包住所有點的超級三角形
const orient = (a, b, c) => (P[b][0] - P[a][0]) * (P[c][1] - P[a][1]) - (P[b][1] - P[a][1]) * (P[c][0] - P[a][0]);

// 點 d 是否在三角形 t 的外接圓內（整數行列式，沒有浮點誤差）
function inCircumcircle([a, b, c], d) {
  if (orient(a, b, c) < 0) [b, c] = [c, b]; // 調整成逆時針
  const r = [a, b, c].map((v) => {
    const x = P[v][0] - P[d][0], y = P[v][1] - P[d][1];
    return [x, y, x * x + y * y];
  });
  const det = r[0][0] * (r[1][1] * r[2][2] - r[2][1] * r[1][2]) - r[0][1] * (r[1][0] * r[2][2] - r[2][0] * r[1][2]) + r[0][2] * (r[1][0] * r[2][1] - r[2][0] * r[1][1]);
  return det > 0;
}

// Bowyer–Watson：逐一加入點；刪掉外接圓包含新點的三角形，留下的多邊形空洞再與新點連成三角形
let tris = [[n, n + 1, n + 2]];
for (let p = 0; p < n; p++) {
  const bad = tris.filter((t) => inCircumcircle(t, p));
  const count = new Map();
  for (const t of bad)
    for (let k = 0; k < 3; k++) {
      const key = [Math.min(t[k], t[(k + 1) % 3]), Math.max(t[k], t[(k + 1) % 3])].join(',');
      count.set(key, (count.get(key) ?? 0) + 1);
    }
  tris = tris.filter((t) => !bad.includes(t));
  for (const [key, c] of count) if (c === 1) tris.push([...key.split(',').map(Number), p]); // 只出現一次的邊是空洞的邊界
}

const result = tris.filter((t) => Math.max(...t) < n).map((t) => [...t].sort((a, b) => a - b)) // 去掉碰到超級三角形的三角形
  .sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
console.log('triangles:', result.length);
for (const t of result) console.log(`  (${t.join(', ')})`, t.map((v) => `(${P[v][0]},${P[v][1]})`).join(' '));
