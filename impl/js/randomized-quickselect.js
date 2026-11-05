let state = 42;
// Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1
const randInt = (k) => (state = (state * 48271) % 2147483647) % k;

// 隨機選 pivot，讓已排序等「最壞輸入」也只有極低機率退化成 O(n²)；期望時間 O(n)
function quickselect(a, k) {
  let lo = 0, hi = a.length - 1;
  for (;;) {
    const r = lo + randInt(hi - lo + 1);
    [a[r], a[hi]] = [a[hi], a[r]];
    const pivot = a[hi];
    let i = lo;
    for (let j = lo; j < hi; j++) if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
    [a[i], a[hi]] = [a[hi], a[i]];
    console.log(`range [${lo}, ${hi}] pivot ${pivot} -> position ${i}`);
    if (i === k) return a[i];
    if (k < i) hi = i - 1;
    else lo = i + 1;
  }
}

const a = Array.from({ length: 14 }, (_, i) => i + 1);
const r = quickselect(a, 3);
console.log('k = 3 ->', r);
