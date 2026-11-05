// 在較短陣列上二分切點，使左半共 (m+n+1)/2 個且左半最大 ≤ 右半最小
function median(a, b) {
  if (a.length > b.length) [a, b] = [b, a];
  const m = a.length, n = b.length, half = (m + n + 1) >> 1;
  let lo = 0, hi = m;
  while (lo <= hi) {
    const i = (lo + hi) >> 1, j = half - i;
    const l1 = i > 0 ? a[i - 1] : -Infinity, r1 = i < m ? a[i] : Infinity;
    const l2 = j > 0 ? b[j - 1] : -Infinity, r2 = j < n ? b[j] : Infinity;
    if (l1 <= r2 && l2 <= r1) return (m + n) % 2 ? Math.max(l1, l2) : (Math.max(l1, l2) + Math.min(r1, r2)) / 2;
    if (l1 > r2) hi = i - 1; else lo = i + 1;
  }
}

for (const [a, b] of [[[1, 3, 8, 9, 15], [7, 11, 18, 19, 21, 25]], [[], [2, 3]], [[1, 2], [3, 4]], [[5], [1, 2, 3, 4]]]) {
  console.log(`[${a.join(', ')}] [${b.join(', ')}] median = ${median(a, b).toFixed(1)}`);
}
