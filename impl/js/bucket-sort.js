// 依數值範圍把元素分進 k 個桶，各桶內排序後依序串接
function bucketSort(a, k) {
  const lo = Math.min(...a), hi = Math.max(...a);
  const buckets = Array.from({ length: k }, () => []);
  for (const x of a) buckets[Math.floor(((x - lo) * k) / (hi - lo + 1))].push(x);
  buckets.forEach((b, i) => {
    b.sort((x, y) => x - y);
    console.log(`bucket ${i}:`, b.join(' '));
  });
  return buckets.flat();
}

const a = [29, 25, 3, 49, 9, 37, 21, 43, 12, 33, 6, 41, 17, 48];
console.log('sorted:', bucketSort(a, 5).join(' '));
