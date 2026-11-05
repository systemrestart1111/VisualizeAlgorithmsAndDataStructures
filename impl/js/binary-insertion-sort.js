// 二分找第一個 > key 的位置（upper bound），相等鍵保持原順序。回傳 [比較, 搬移]
function binaryInsertionSort(a, key = (x) => x) {
  let comps = 0, moves = 0;
  for (let i = 1; i < a.length; i++) {
    const x = a[i];
    let lo = 0, hi = i;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      comps++;
      if (key(a[mid]) <= key(x)) lo = mid + 1; else hi = mid;
    }
    for (let j = i; j > lo; j--) { a[j] = a[j - 1]; moves++; }
    a[lo] = x;
  }
  return [comps, moves];
}

const a = [5, 2, 8, 2, 9, 1, 5, 6, 3, 5];
const [c, m] = binaryInsertionSort(a);
console.log('sorted:', a.join(' '));
console.log('comparisons:', c, 'moves:', m);
const p = ['3a', '1b', '3c', '2d', '1e'];
binaryInsertionSort(p, (s) => +s[0]);
console.log('stable:', p.join(' '));
