// 後綴陣列、BWT、C 表與 Occ 前綴計數
function build(text) {
  const t = text + '$', n = t.length;
  const sa = [...t].map((_, i) => i).sort((a, b) => (t.slice(a) < t.slice(b) ? -1 : 1));
  const L = sa.map((i) => t[(i + n - 1) % n]);
  const alpha = [...new Set(t)].sort();
  const C = {};
  let acc = 0;
  for (const c of alpha) { C[c] = acc; acc += [...t].filter((x) => x === c).length; }
  const occ = Object.fromEntries(alpha.map((c) => [c, [0]]));
  for (const ch of L) for (const c of alpha) occ[c].push(occ[c].at(-1) + (ch === c ? 1 : 0));
  return { sa, C, occ, n };
}
// 向後搜尋：每讀一個字元，sp = C[c] + Occ(c, sp)、ep = C[c] + Occ(c, ep)
function search({ sa, C, occ, n }, pat) {
  let sp = 0, ep = n;
  for (const c of [...pat].reverse()) {
    if (!(c in C)) return [];
    [sp, ep] = [C[c] + occ[c][sp], C[c] + occ[c][ep]];
    if (sp >= ep) return [];
  }
  return sa.slice(sp, ep).sort((a, b) => a - b);
}

const text = 'abracadabra';
const idx = build(text);
for (const p of ['a', 'abra', 'cad', 'ra', 'xyz', 'abracadabra']) {
  const pos = search(idx, p), brute = [];
  for (let i = 0; i + p.length <= text.length; i++) if (text.slice(i, i + p.length) === p) brute.push(i);
  console.log(`'${p}': ${pos.length} at [${pos.join(', ')}] (brute [${brute.join(', ')}])`);
}
