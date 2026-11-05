const subsetSums = (xs) => xs.reduce((s, x) => s.concat(s.map((v) => v + x)), [0]);

// 兩半各列舉子集合和；右半排序後，對每個左半和二分搜尋 ≤ T − s 的最大值
function bestAtMost(a, T) {
  const h = a.length >> 1;
  const L = subsetSums(a.slice(0, h)), R = subsetSums(a.slice(h)).sort((x, y) => x - y);
  let best = -1;
  for (const s of L) {
    if (s > T) continue;
    let lo = 0, hi = R.length - 1, idx = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (R[m] <= T - s) { idx = m; lo = m + 1; } else hi = m - 1; }
    best = Math.max(best, s + R[idx]);
  }
  return best;
}

const a = [7, 3, 12, 18, 5, 9, 14, 2];
const all = subsetSums(a);
for (const T of [30, 10, 1, 1000]) {
  const brute = Math.max(...all.filter((s) => s <= T));
  console.log(`T = ${T}: best = ${bestAtMost(a, T)} brute = ${brute}`);
}
