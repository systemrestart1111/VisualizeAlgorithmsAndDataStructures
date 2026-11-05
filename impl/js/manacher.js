// 在字元間插入 #，奇偶長度回文統一處理；利用目前最右回文的對稱性，p[i] 可從鏡像位置繼承，O(n)
function manacher(s) {
  const t = '#' + [...s].join('#') + '#', n = t.length;
  const p = new Array(n).fill(0); // p[i] = 以 i 為中心的回文半徑（不含中心）
  for (let i = 0, c = 0, r = 0; i < n; i++) {
    if (i < r) p[i] = Math.min(r - i, p[2 * c - i]);
    while (i - p[i] - 1 >= 0 && i + p[i] + 1 < n && t[i - p[i] - 1] === t[i + p[i] + 1]) p[i]++;
    if (i + p[i] > r) { c = i; r = i + p[i]; }
  }
  let best = 0;
  for (let i = 1; i < n; i++) if (p[i] > p[best]) best = i; // 同長度取最先出現的
  const start = (best - p[best]) / 2;
  return [s.slice(start, start + p[best]), start];
}

const [pal, start] = manacher('babcbabcbaccba');
console.log('longest palindrome =', pal);
console.log('start =', start, 'length =', pal.length);
