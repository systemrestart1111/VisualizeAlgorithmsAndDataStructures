function partition(a, lo, hi) {
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
  [a[i], a[hi]] = [a[hi], a[i]];
  return i;
}

// 找第 k 小（0 起算）：分割後只往含有第 k 個位置的那一邊繼續，平均 O(n)
function quickselect(a, k) {
  let lo = 0, hi = a.length - 1;
  for (;;) {
    const p = partition(a, lo, hi);
    if (p === k) return a[p];
    if (k < p) hi = p - 1;
    else lo = p + 1;
  }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72];
console.log('k = 5 ->', quickselect(a, 5));
