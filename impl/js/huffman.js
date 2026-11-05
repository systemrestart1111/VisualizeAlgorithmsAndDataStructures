const TEXT = 'ABRACADABRA BANANA';

// 每次取出頻率最小的兩棵樹合併（同頻率時保持先後順序），頻率高的字元自然離根較近、編碼較短
const freq = {};
for (const ch of TEXT) freq[ch] = (freq[ch] ?? 0) + 1;
let pq = Object.entries(freq).map(([ch, f]) => ({ f, ch }));
while (pq.length > 1) {
  pq.sort((a, b) => a.f - b.f); // 穩定排序
  const [a, b] = pq;
  pq = [...pq.slice(2), { f: a.f + b.f, left: a, right: b }];
}

const codes = {};
(function walk(n, code) {
  if (n.ch !== undefined) codes[n.ch] = code || '0';
  else { walk(n.left, code + '0'); walk(n.right, code + '1'); }
})(pq[0], '');

let bits = 0;
for (const ch of Object.keys(codes).sort()) {
  console.log(`${ch === ' ' ? 'SP' : ch} freq=${freq[ch]} code=${codes[ch]}`);
  bits += freq[ch] * codes[ch].length;
}
console.log(`total bits = ${bits} (fixed 8-bit: ${8 * TEXT.length})`);
