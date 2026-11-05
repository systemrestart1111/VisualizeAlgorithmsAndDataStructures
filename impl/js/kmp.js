// lps[i] = p[0..i] 最長的「相同前綴與後綴」長度（不含整個字串）
function prefixFunction(p) {
  const lps = new Array(p.length).fill(0);
  for (let i = 1, k = 0; i < p.length; i++) {
    while (k && p[i] !== p[k]) k = lps[k - 1];
    if (p[i] === p[k]) k++;
    lps[i] = k;
  }
  return lps;
}

// 失配時不回退文字指標，而是依 lps 把樣式滑到下一個可能的位置
function kmp(t, p) {
  const lps = prefixFunction(p), matches = [];
  for (let i = 0, k = 0; i < t.length; i++) {
    while (k && t[i] !== p[k]) k = lps[k - 1];
    if (t[i] === p[k]) k++;
    if (k === p.length) { matches.push(i - k + 1); k = lps[k - 1]; }
  }
  return [lps, matches];
}

const [lps, m] = kmp('ABABDABACDABABCABAB', 'ABABCABAB');
console.log('lps:', lps.join(' '));
console.log('matches at:', m.join(' '));
