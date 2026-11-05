// 字典預先放入所有單一字元（0..255）；持續延長 w，遇到不在字典裡的 w+c 就輸出 w 的編號並把 w+c 加入字典
function lzwEncode(s) {
  const dict = new Map(Array.from({ length: 256 }, (_, i) => [String.fromCharCode(i), i]));
  const out = [];
  let w = '';
  for (const ch of s) {
    if (dict.has(w + ch)) { w += ch; continue; }
    out.push(dict.get(w));
    dict.set(w + ch, dict.size);
    w = ch;
  }
  if (w) out.push(dict.get(w));
  return [out, dict];
}

function lzwDecode(codes) {
  const dict = Array.from({ length: 256 }, (_, i) => String.fromCharCode(i));
  let w = dict[codes[0]];
  const out = [w];
  for (const c of codes.slice(1)) {
    const entry = c < dict.length ? dict[c] : w + w[0]; // 特殊情況：編號剛好是正要建立的那一個
    out.push(entry);
    dict.push(w + entry[0]);
    w = entry;
  }
  return out.join('');
}

const s = 'TOBEORNOTTOBEORTOBEORNOT';
const [codes, dict] = lzwEncode(s);
console.log('codes:', codes.join(' '));
console.log('new entries:', [...dict].filter(([, v]) => v >= 256).map(([k, v]) => `${v}:${k}`).join(' '));
console.log(`${s.length} chars -> ${codes.length} codes, decode ok: ${lzwDecode(codes) === s ? 'True' : 'False'}`);
