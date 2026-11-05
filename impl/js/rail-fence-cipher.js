// 讀出順序：依（所在軌道, 原位置）排序
function orderOf(n, rails) {
  const row = [];
  for (let i = 0, r = 0, d = 1; i < n; i++) {
    row.push(r);
    if (rails > 1) { if (r === 0) d = 1; else if (r === rails - 1) d = -1; r += d; }
  }
  return [...Array(n).keys()].sort((a, b) => row[a] - row[b] || a - b);
}
const encrypt = (t, rails) => orderOf(t.length, rails).map((i) => t[i]).join('');
function decrypt(c, rails) {
  const out = [];
  orderOf(c.length, rails).forEach((pos, k) => (out[pos] = c[k]));
  return out.join('');
}

const c = encrypt('WEAREDISCOVERED', 3);
console.log('cipher:', c);
console.log('plain :', decrypt(c, 3));
console.log('1 rail:', encrypt('HELLO', 1));
console.log('short :', encrypt('AB', 5), decrypt(encrypt('AB', 5), 5));
