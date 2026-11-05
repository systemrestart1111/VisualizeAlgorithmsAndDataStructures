// 只用「視窗最右端那個文字字元」決定移動量：shift[c] = 它在樣式（不含最後一字）中最後出現處到結尾的距離
function horspool(t, p) {
  const n = t.length, m = p.length, shift = {}, matches = [], tries = [];
  for (let i = 0; i < m - 1; i++) shift[p[i]] = m - 1 - i;
  for (let s = 0; s <= n - m; s += shift[t[s + m - 1]] ?? m) {
    tries.push(s);
    let j = m - 1;
    while (j >= 0 && p[j] === t[s + j]) j--;
    if (j < 0) matches.push(s);
  }
  return [matches, tries];
}

const [m, tries] = horspool('JIM SAW ME IN A BARBERSHOP', 'BARBER');
console.log('alignments tried:', tries.join(' '));
console.log('matches at:', m.join(' '));
