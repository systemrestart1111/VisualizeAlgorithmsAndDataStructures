// Huffman 只決定碼長；平手時依建立順序（葉子依符號排序在前）
function codeLengths(text) {
  const freq = {};
  for (const c of text) freq[c] = (freq[c] ?? 0) + 1;
  const syms = Object.keys(freq).sort();
  if (syms.length === 1) return { [syms[0]]: 1 };
  const lens = Object.fromEntries(syms.map((c) => [c, 0]));
  let nodes = syms.map((c, i) => [freq[c], i, [c]]), order = syms.length;
  while (nodes.length > 1) {
    nodes.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    const [[wa, , la], [wb, , lb]] = nodes;
    for (const c of [...la, ...lb]) lens[c]++;
    nodes = [[wa + wb, order++, [...la, ...lb]], ...nodes.slice(2)];
  }
  return lens;
}
// 依（碼長, 符號）排序；每個碼是前一個加 1，碼長變長時左移補 0
function canonical(lens) {
  const order = Object.keys(lens).sort((a, b) => lens[a] - lens[b] || (a < b ? -1 : 1));
  const codes = {};
  let code = 0, prev = lens[order[0]];
  for (const c of order) {
    code <<= lens[c] - prev;
    prev = lens[c];
    codes[c] = code.toString(2).padStart(lens[c], '0');
    code++;
  }
  return [codes, order];
}

const text = 'abracadabra alakazam';
const lens = codeLengths(text);
const [codes, order] = canonical(lens);
for (const c of order) console.log(`'${c}' len ${lens[c]} code ${codes[c]}`);
const enc = [...text].map((c) => codes[c]).join('');
const rev = Object.fromEntries(Object.entries(codes).map(([k, v]) => [v, k]));
let buf = '', dec = '';
for (const b of enc) { buf += b; if (buf in rev) { dec += rev[buf]; buf = ''; } }
console.log(`bits ${enc.length}, decoded ok ${dec === text ? 'True' : 'False'}`);
