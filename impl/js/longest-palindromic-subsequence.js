// L[i][j]：兩端相同 → L[i+1][j−1] + 2；不同 → max(L[i+1][j], L[i][j−1])
function lps(s) {
  const n = s.length;
  const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      L[i][j] = s[i] === s[j] ? (len > 2 ? L[i + 1][j - 1] : 0) + 2 : Math.max(L[i + 1][j], L[i][j - 1]);
    }
  let left = '', right = '';
  for (let i = 0, j = n - 1; i <= j;) {
    if (i === j) { left += s[i]; break; }
    if (s[i] === s[j]) { left += s[i]; right = s[j] + right; i++; j--; }
    else if (L[i + 1][j] >= L[i][j - 1]) i++;
    else j--;
  }
  return [L[0][n - 1], left + right];
}

for (const s of ['BBABCBCAB', 'CHARACTER', 'AGBDBA', 'X']) { const [len, pal] = lps(s); console.log(`${s}: ${len} (${pal})`); }
