// 以前綴和 p 結尾的子陣列個數 = 之前出現過幾次前綴和 p − k；先查詢再登錄
function countK(a, k) {
  const cnt = new Map([[0, 1]]);
  let p = 0, ans = 0;
  for (const x of a) {
    p += x;
    ans += cnt.get(p - k) ?? 0;
    cnt.set(p, (cnt.get(p) ?? 0) + 1);
  }
  return ans;
}

for (const [a, k] of [[[1, 2, -1, 3, 0, -2, 4, 1, -3], 3], [[0, 0, 0], 0], [[1, -1, 1, -1], 0], [[5], 3]]) {
  let brute = 0;
  for (let i = 0; i < a.length; i++) { let s = 0; for (let j = i; j < a.length; j++) { s += a[j]; if (s === k) brute++; } }
  console.log(`[${a.join(', ')}] k = ${k} -> ${countK(a, k)} brute: ${brute}`);
}
