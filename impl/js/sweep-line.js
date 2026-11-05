const RECTS = [[1, 1, 6, 5], [3, 3, 9, 8], [7, 1, 11, 4], [2, 6, 5, 10]]; // (x1, y1, x2, y2)

// 掃描線：把所有矩形的左右邊 x 當成事件排序；相鄰兩個事件之間的直條內，覆蓋的 y 長度固定
const xs = [...new Set(RECTS.flatMap((r) => [r[0], r[2]]))].sort((a, b) => a - b);
let total = 0;
for (let k = 0; k + 1 < xs.length; k++) {
  const xa = xs[k], xb = xs[k + 1];
  const ivs = RECTS.filter((r) => r[0] <= xa && r[2] >= xb).map((r) => [r[1], r[3]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]); // 這一條內有效的 y 區間
  let covered = 0, lo = null, hi = null;
  for (const [a, b] of ivs) { // 合併重疊的 y 區間
    if (hi === null || a > hi) {
      if (hi !== null) covered += hi - lo;
      [lo, hi] = [a, b];
    } else hi = Math.max(hi, b);
  }
  if (hi !== null) covered += hi - lo;
  total += covered * (xb - xa);
  console.log(`x in [${xa}, ${xb}): covered y = ${covered}, area += ${covered * (xb - xa)}`);
}
console.log('union area =', total);
