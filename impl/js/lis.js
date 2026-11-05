const A = [10, 9, 2, 5, 3, 7, 101, 18, 4, 20], n = A.length;

// O(n²)：dp[i] = 以 a[i] 結尾的最長遞增子序列長度
const dp = new Array(n).fill(1), parent = new Array(n).fill(-1);
for (let i = 0; i < n; i++)
  for (let j = 0; j < i; j++) if (A[j] < A[i] && dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; parent[i] = j; }
let end = 0;
for (let i = 1; i < n; i++) if (dp[i] > dp[end]) end = i; // 同長度取最先出現的結尾
const seq = [];
for (let e = end; e >= 0; e = parent[e]) seq.unshift(A[e]);
console.log('LIS length =', dp[end]);
console.log('one LIS =', seq.join(' '));

// O(n log n)：tails[k] = 長度 k+1 的遞增子序列最小可能結尾，用二分搜尋更新
const tails = [];
for (const x of A) {
  let lo = 0, hi = tails.length;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (tails[mid] < x) lo = mid + 1; else hi = mid; }
  tails[lo] = x;
}
console.log('tails:', tails.join(' '));
