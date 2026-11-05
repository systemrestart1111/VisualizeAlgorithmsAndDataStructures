// 加上終止符 $，排序所有循環旋轉，取最後一欄
function bwt(s) {
  s += '$';
  const rots = [...s].map((_, i) => s.slice(i) + s.slice(0, i)).sort();
  return rots.map((r) => r.at(-1)).join('');
}
// LF 映射：L 中第 k 個 c 對應 F 中第 k 個 c；從 $ 所在列往回讀
function inverse(L) {
  const F = [...L].sort(), first = {}, seen = {};
  F.forEach((c, i) => { if (!(c in first)) first[c] = i; });
  const LF = [...L].map((c) => { const v = first[c] + (seen[c] ?? 0); seen[c] = (seen[c] ?? 0) + 1; return v; });
  let row = L.indexOf('$'), out = '';
  for (let k = 0; k < L.length - 1; k++) { row = LF[row]; out = L[row] + out; }
  return out;
}

for (const s of ['banana', 'abracadabra', 'mississippi', 'aaaa']) { const L = bwt(s); console.log(`${s}: bwt ${L}, inverse ${inverse(L)}`); }
