// 固定長度 k：加入右邊新元素、減去左邊離開的元素
function maxWindowSum(a, k) {
  let s = a.slice(0, k).reduce((x, y) => x + y, 0), best = s, at = 0;
  for (let i = k; i < a.length; i++) { s += a[i] - a[i - k]; if (s > best) { best = s; at = i - k + 1; } }
  return [best, at];
}
// 可變視窗：只適用於元素皆為正；有非正數回傳 null，不存在回傳 0
function minLenAtLeast(a, S) {
  if (a.some((x) => x <= 0)) return null;
  let l = 0, s = 0, best = Infinity;
  for (let r = 0; r < a.length; r++) {
    s += a[r];
    while (s >= S) { best = Math.min(best, r - l + 1); s -= a[l++]; }
  }
  return best === Infinity ? 0 : best;
}

const a = [4, 2, 12, 1, 7, 9, 3, 2, 8, 5];
const [best, at] = maxWindowSum(a, 3);
console.log(`max sum of length 3: ${best} at ${at}`);
console.log('shortest with sum >= 18:', minLenAtLeast(a, 18));
console.log('shortest with sum >= 100:', minLenAtLeast(a, 100));
console.log('with negatives:', minLenAtLeast([3, -1, 4], 5) ?? 'not applicable');
