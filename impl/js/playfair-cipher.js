// 關鍵字（J 視為 I，去重複）接上其餘字母，排成 5×5
function square(key) {
  const sq = [];
  for (const ch of (key.toUpperCase() + 'ABCDEFGHIKLMNOPQRSTUVWXYZ').replace(/J/g, 'I')) if (/[A-Z]/.test(ch) && !sq.includes(ch)) sq.push(ch);
  return sq;
}
// 相同字母中間插 X（XX 則插 Q），奇數長度補 X（末字為 X 則補 Q）
function pairsOf(text) {
  const t = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  const out = [];
  for (let i = 0; i < t.length;) {
    const a = t[i];
    let b = t[i + 1];
    if (b === undefined || a === b) { b = a === 'X' ? 'Q' : 'X'; i += 1; } else i += 2;
    out.push(a + b);
  }
  return out;
}
function playfair(pairs, sq, d) {
  const pos = {};
  sq.forEach((ch, i) => (pos[ch] = [Math.floor(i / 5), i % 5]));
  return pairs.map(([a, b]) => {
    const [ra, ca] = pos[a], [rb, cb] = pos[b];
    if (ra === rb) return sq[ra * 5 + ((ca + d) % 5)] + sq[rb * 5 + ((cb + d) % 5)];
    if (ca === cb) return sq[((ra + d) % 5) * 5 + ca] + sq[((rb + d) % 5) * 5 + cb];
    return sq[ra * 5 + cb] + sq[rb * 5 + ca];
  });
}

const sq = square('PLAYFAIR EXAMPLE');
for (let r = 0; r < 5; r++) console.log(sq.slice(r * 5, r * 5 + 5).join(' '));
const c = playfair(pairsOf('HIDE THE GOLD IN THE TREE STUMP'), sq, 1);
console.log('cipher:', c.join(' '));
console.log('plain :', playfair(c, sq, 4).join(' '));
