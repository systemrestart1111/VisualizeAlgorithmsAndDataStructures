// 每個起點都從頭逐字比較；不相符就把樣式右移一格
function naiveMatch(t, p) {
  const matches = [];
  let comparisons = 0;
  for (let s = 0; s + p.length <= t.length; s++) {
    let j = 0;
    while (j < p.length) {
      comparisons++;
      if (t[s + j] !== p[j]) break;
      j++;
    }
    if (j === p.length) matches.push(s);
  }
  return [matches, comparisons];
}

const [m, c] = naiveMatch('AABAACAADAABAABA', 'AABA');
console.log('matches at:', m.join(' '));
console.log('comparisons =', c);
