// 字典從空開始：找出字典中最長的前綴 w，輸出 (w 的編號, 下一個字元)，並把 w+字元 加入字典
function lz78Encode(s) {
  const dict = new Map(), out = [];
  let w = '';
  for (const ch of s) {
    if (dict.has(w + ch)) { w += ch; continue; }
    out.push([dict.get(w) ?? 0, ch]);
    dict.set(w + ch, dict.size + 1);
    w = '';
  }
  if (w) out.push([dict.get(w), '']);
  return [out, dict];
}

const [pairs, dict] = lz78Encode('ABBCBCABABCAABCAAB');
console.log('output:', pairs.map(([i, c]) => `(${i},${c})`).join(' '));
console.log('dictionary:', [...dict].map(([k, v]) => `${v}:${k}`).join(' '));
