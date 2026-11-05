// z[i] = s 與 s[i:] 的最長共同前綴長度；利用目前最右的 Z-box [l, r) 避免重複比較，O(n)
function zFunction(s) {
  const n = s.length, z = new Array(n).fill(0);
  for (let i = 1, l = 0, r = 0; i < n; i++) {
    if (i < r) z[i] = Math.min(r - i, z[i - l]);
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] > r) { l = i; r = i + z[i]; }
  }
  return z;
}

const s = 'aab$baabaaab';
const z = zFunction(s), m = s.indexOf('$'); // 把「樣式$文字」接起來，z[i] == len(樣式) 就是一次匹配
console.log('z:', z.join(' '));
console.log('pattern', s.slice(0, m), 'found in text at:', z.map((v, i) => (v === m ? i - m - 1 : null)).filter((x) => x !== null).join(' '));
