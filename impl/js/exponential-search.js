function binarySearch(a, t, lo, hi) {
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid] === t) return mid;
    if (a[mid] < t) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

// 範圍以 1, 2, 4, 8… 倍增，找到包含 t 的區間後做二分搜尋
function exponentialSearch(a, t) {
  const n = a.length;
  if (n === 0) return -1;
  if (a[0] === t) return 0;
  let i = 1;
  while (i < n && a[i] <= t) i *= 2;
  return binarySearch(a, t, i >> 1, Math.min(i, n - 1));
}

const a = [2, 5, 8, 11, 15, 19, 24, 28, 33, 39, 44, 50, 57, 63, 70, 78, 85, 93];
console.log('search 57 ->', exponentialSearch(a, 57));
console.log('search 60 ->', exponentialSearch(a, 60));
