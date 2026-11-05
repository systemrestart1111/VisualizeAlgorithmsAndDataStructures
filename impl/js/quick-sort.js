// Lomuto 分割：以最後一個元素為 pivot，比它小的都移到左邊
function partition(a, lo, hi) {
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++)
    if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
  [a[i], a[hi]] = [a[hi], a[i]];
  return i;
}

function quickSort(a, lo = 0, hi = a.length - 1) {
  if (lo < hi) {
    const p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
  }
}

const a = [38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47];
quickSort(a);
console.log(a.join(' '));
