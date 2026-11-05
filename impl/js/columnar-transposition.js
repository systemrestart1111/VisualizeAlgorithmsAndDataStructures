// 依（字母, 欄號）穩定排序，重複字母保持出現順序
const colOrder = (key) => [...key].map((_, c) => c).sort((a, b) => (key[a] < key[b] ? -1 : key[a] > key[b] ? 1 : a - b));

function encrypt(text, key) {
  let t = text.toUpperCase().replace(/[^A-Z]/g, '');
  const w = key.length;
  while (t.length % w) t += 'X';
  let out = '';
  for (const c of colOrder(key)) for (let r = 0; r < t.length / w; r++) out += t[r * w + c];
  return out;
}
function decrypt(cph, key) {
  const w = key.length, rows = cph.length / w, out = [];
  let k = 0;
  for (const c of colOrder(key)) for (let r = 0; r < rows; r++) out[r * w + c] = cph[k++];
  return out.join('');
}

const c = encrypt('WE ARE DISCOVERED FLEE AT ONCE', 'ZEBRAS');
console.log('cipher:', c);
console.log('plain :', decrypt(c, 'ZEBRAS'));
console.log('dup key:', encrypt('HELLOWORLD', 'BANANA'));
