const PTS = [[2, 3], [12, 30], [40, 50], [5, 1], [12, 10], [3, 4], [25, 18], [33, 8], [18, 25], [45, 22], [8, 40], [30, 35], [22, 5]];
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

// 分治：左右兩半各自求解，再檢查跨中線、寬度 < d 的帶狀區域（每點只需比較常數個鄰居）
function closest(p) {
  if (p.length <= 3) {
    let best = [Infinity, null, null];
    for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (d2(p[i], p[j]) < best[0]) best = [d2(p[i], p[j]), p[i], p[j]];
    return best;
  }
  const mid = p.length >> 1, mx = p[mid][0];
  const l = closest(p.slice(0, mid)), r = closest(p.slice(mid));
  let best = l[0] <= r[0] ? l : r;
  const strip = p.filter((q) => (q[0] - mx) ** 2 < best[0]).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  for (let i = 0; i < strip.length; i++)
    for (let j = i + 1; j < strip.length && (strip[j][1] - strip[i][1]) ** 2 < best[0]; j++)
      if (d2(strip[i], strip[j]) < best[0]) best = [d2(strip[i], strip[j]), strip[i], strip[j]];
  return best;
}

const byXY = (a, b) => a[0] - b[0] || a[1] - b[1];
const [dist2, ...pair] = closest([...PTS].sort(byXY));
const [a, b] = pair.sort(byXY);
let brute = Infinity;
for (let i = 0; i < PTS.length; i++) for (let j = i + 1; j < PTS.length; j++) brute = Math.min(brute, d2(PTS[i], PTS[j]));
console.log(`closest pair: (${a[0]},${a[1]}) (${b[0]},${b[1]})`);
console.log(`distance = ${Math.sqrt(dist2).toFixed(4)}`);
console.log('brute force d^2 =', brute);
