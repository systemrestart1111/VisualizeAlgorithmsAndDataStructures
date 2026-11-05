function insertionSort(a, lo, hi) {
  for (let i = lo + 1; i < hi; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }
    a[j + 1] = key;
  }
}

function merge(a, lo, mid, hi) {
  const left = a.slice(lo, mid), right = a.slice(mid, hi);
  let i = 0, j = 0;
  for (let k = lo; k < hi; k++)
    a[k] = j >= right.length || (i < left.length && left[i] <= right[j]) ? left[i++] : right[j++];
}

// 簡化版 TimSort：先把每段 minrun 個元素用插入排序排好，再兩兩合併、長度倍增
function timSort(a, minrun = 4) {
  const n = a.length;
  for (let lo = 0; lo < n; lo += minrun) insertionSort(a, lo, Math.min(lo + minrun, n));
  for (let size = minrun; size < n; size *= 2)
    for (let lo = 0; lo < n; lo += 2 * size) {
      const mid = Math.min(lo + size, n), hi = Math.min(lo + 2 * size, n);
      if (mid < hi) merge(a, lo, mid, hi);
    }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23];
timSort(a, 4);
console.log(a.join(' '));
