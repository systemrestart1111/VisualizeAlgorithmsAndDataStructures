function insertionSort(a, lo, hi) {
  for (let i = lo + 1; i <= hi; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }
    a[j + 1] = key;
  }
}

function heapSortRange(a, lo, hi) {
  const n = hi - lo + 1;
  const sift = (i, size) => {
    for (;;) {
      let big = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < size && a[lo + l] > a[lo + big]) big = l;
      if (r < size && a[lo + r] > a[lo + big]) big = r;
      if (big === i) return;
      [a[lo + i], a[lo + big]] = [a[lo + big], a[lo + i]];
      i = big;
    }
  };
  for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n);
  for (let end = n - 1; end > 0; end--) { [a[lo], a[lo + end]] = [a[lo + end], a[lo]]; sift(0, end); }
}

function partition(a, lo, hi) {
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
  [a[i], a[hi]] = [a[hi], a[i]];
  return i;
}

// 快速排序為主；區間很小改用插入排序，遞迴太深改用堆積排序，保證 O(n log n)
function intro(a, lo, hi, depth, small) {
  if (hi - lo + 1 <= small) insertionSort(a, lo, hi);
  else if (depth === 0) heapSortRange(a, lo, hi);
  else {
    const p = partition(a, lo, hi);
    intro(a, lo, p - 1, depth - 1, small);
    intro(a, p + 1, hi, depth - 1, small);
  }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23, 50, 8];
intro(a, 0, a.length - 1, 2 * Math.floor(Math.log2(a.length)), 4);
console.log(a.join(' '));
