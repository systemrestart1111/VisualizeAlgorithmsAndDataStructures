// 好後綴規則：已比對成功的後綴，在樣式中前一次出現的位置（或與前綴重疊的部分）決定可安全移動的距離
function goodSuffixTable(p) {
  const m = p.length, shift = new Array(m + 1).fill(0), border = new Array(m + 1).fill(0);
  let i = m, j = m + 1;
  border[i] = j;
  while (i > 0) {
    while (j <= m && p[i - 1] !== p[j - 1]) {
      if (shift[j] === 0) shift[j] = j - i;
      j = border[j];
    }
    border[--i] = --j;
  }
  j = border[0];
  for (i = 0; i <= m; i++) {
    if (shift[i] === 0) shift[i] = j;
    if (i === j) j = border[j];
  }
  return shift;
}

// 由右往左比較；失配時取「壞字元規則」與「好後綴規則」中移得較遠的那個
function boyerMoore(t, p) {
  const n = t.length, m = p.length, last = {}, gs = goodSuffixTable(p), matches = [], tries = [];
  for (let i = 0; i < m; i++) last[p[i]] = i; // 壞字元：該字元在樣式中最後出現的位置
  for (let s = 0; s <= n - m; ) {
    tries.push(s);
    let j = m - 1;
    while (j >= 0 && p[j] === t[s + j]) j--;
    if (j < 0) { matches.push(s); s += gs[0]; }
    else s += Math.max(gs[j + 1], j - (last[t[s + j]] ?? -1));
  }
  return [matches, tries];
}

const [m, tries] = boyerMoore('HERE IS A SIMPLE EXAMPLE', 'EXAMPLE');
console.log('alignments tried:', tries.join(' '));
console.log('matches at:', m.join(' '));
