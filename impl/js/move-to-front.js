const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

// 輸出字元目前的位置，再把它移到最前面
function encode(s) {
  const table = [...ALPHABET], out = [];
  for (const c of s) { const i = table.indexOf(c); out.push(i); table.splice(i, 1); table.unshift(c); }
  return out;
}
function decode(codes) {
  const table = [...ALPHABET];
  return codes.map((i) => { const c = table[i]; table.splice(i, 1); table.unshift(c); return c; }).join('');
}

for (const s of ['bananaaa', 'aaabbbccc', 'abcabcabc', 'annb']) { const codes = encode(s); console.log(`${s}: ${codes.join(' ')} -> ${decode(codes)}`); }
