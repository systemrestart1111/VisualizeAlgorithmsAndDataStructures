const PTS = [[3, 1], [7, 2], [10, 5], [6, 4], [2, 6], [5, 7], [8, 9], [1, 3], [4, 4], [9, 7], [6, 10], [3, 9], [7, 6]];
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

function convexHull(pts) {
  pts = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const h = [];
  for (const seq of [pts, [...pts].reverse()]) {
    const start = h.length;
    for (const p of seq) {
      while (h.length >= start + 2 && cross(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop();
      h.push(p);
    }
    h.pop();
  }
  return h;
}

// 旋轉卡尺：沿凸包每條邊，把對面的「最遠點」指標 j 單調往前推；最遠點對一定是某組對蹠點
function diameter(h) {
  const n = h.length;
  let j = 1, best = [0, null, null];
  for (let i = 0; i < n; i++) {
    const ni = (i + 1) % n;
    while (Math.abs(cross(h[i], h[ni], h[(j + 1) % n])) > Math.abs(cross(h[i], h[ni], h[j]))) j = (j + 1) % n;
    for (const a of [h[i], h[ni]]) if (d2(a, h[j]) > best[0]) best = [d2(a, h[j]), a, h[j]];
  }
  return best;
}

const hull = convexHull(PTS);
const [dist2, a, b] = diameter(hull);
let brute = 0;
for (const p of PTS) for (const q of PTS) brute = Math.max(brute, d2(p, q));
console.log('hull:', hull.map(([x, y]) => `(${x},${y})`).join(' '));
console.log(`farthest pair: (${a[0]},${a[1]}) (${b[0]},${b[1]}), distance = ${Math.sqrt(dist2).toFixed(4)}`);
console.log('brute force d^2 =', brute);
