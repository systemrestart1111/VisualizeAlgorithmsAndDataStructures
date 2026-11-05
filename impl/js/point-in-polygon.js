const POLY = [[2, 1], [9, 2], [11, 7], [7, 5], [5, 10], [1, 7]];

// 射線法：從點往右射一條水平線，與多邊形的邊相交奇數次就在內部
function inside([x, y], poly) {
  let res = false;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
    if (y1 > y !== y2 > y) { // 這條邊跨過水平線
      // 交點 x 座標 > x 才算在右側；改寫成乘法以避免除法誤差
      const v = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1);
      if (y2 > y1 ? v > 0 : v < 0) res = !res;
    }
  }
  return res;
}

for (const q of [[5, 4], [8, 7], [3, 8], [10, 3]]) console.log(`(${q[0]},${q[1]}):`, inside(q, POLY) ? 'inside' : 'outside');
