// LSD 基數排序：從個位數開始，每一位做一次穩定的計數排序
function radixSort(a) {
  const mx = Math.max(...a);
  for (let exp = 1; Math.floor(mx / exp) > 0; exp *= 10) {
    const buckets = Array.from({ length: 10 }, () => []);
    for (const x of a) buckets[Math.floor(x / exp) % 10].push(x);
    a = buckets.flat();
    console.log(`digit ${exp}:`, a.join(' '));
  }
  return a;
}

const a = [170, 45, 75, 90, 802, 24, 2, 66, 431, 318, 59, 7];
console.log('sorted:', radixSort(a).join(' '));
