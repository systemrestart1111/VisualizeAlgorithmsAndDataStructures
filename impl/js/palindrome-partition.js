// isPal 預算回文區間；cut[j] = 0（整段回文）或 min(cut[i−1] + 1)
function minCut(s) {
  const n = s.length;
  if (!n) return [0, []];
  const P = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let len = 1; len <= n; len++) for (let i = 0; i + len - 1 < n; i++) { const j = i + len - 1; P[i][j] = s[i] === s[j] && (len < 3 || P[i + 1][j - 1]); }
  const cut = new Array(n).fill(0), prev = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    if (P[0][j]) continue;
    cut[j] = n;
    for (let i = 1; i <= j; i++) if (P[i][j] && cut[i - 1] + 1 < cut[j]) { cut[j] = cut[i - 1] + 1; prev[j] = i; }
  }
  const parts = [];
  for (let j = n - 1; j >= 0; j = prev[j] - 1) parts.unshift(s.slice(prev[j], j + 1));
  return [cut[n - 1], parts];
}

for (const s of ['aabbcbbdd', 'aab', 'racecar', 'abcde', '']) { const [c, parts] = minCut(s); console.log(`'${s}': ${c} cuts ${parts.join(' | ')}`); }
