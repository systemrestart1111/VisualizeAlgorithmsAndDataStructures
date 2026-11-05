const MSG = 'BACAB';

// 依出現頻率把 [0, 1) 切給各符號；每編一個符號就把目前區間縮小到該符號負責的那一段
const freq = {};
for (const ch of MSG) freq[ch] = (freq[ch] ?? 0) + 1;
const syms = Object.keys(freq).sort(), total = MSG.length, cum = {};
let acc = 0;
for (const c of syms) { cum[c] = acc; acc += freq[c]; }

// 區間以分數 low/denom、(low+width)/denom 表示，全程整數運算，沒有浮點誤差
// num / total^k 的十進位表示（total = 5 時恰好是有限小數）
function dec(num, k) {
  if (k === 0) return String(num);
  const v = Math.floor((num * 10 ** k) / total ** k), p = 10 ** k;
  return `${Math.floor(v / p)}.${String(v % p).padStart(k, '0')}`;
}

console.log('model:', syms.map((c) => `${c}:[${cum[c]}/${total},${cum[c] + freq[c]}/${total})`).join(' '));
let low = 0, width = 1;
[...MSG].forEach((ch, i) => {
  low = low * total + width * cum[ch];
  width *= freq[ch];
  console.log(`after '${ch}': [${dec(low, i + 1)}, ${dec(low + width, i + 1)})`);
});
console.log(`code = ${dec(low, MSG.length)} (= ${low}/${total ** MSG.length})`);

// 解碼：看 code 落在哪個符號的區段，再把它放大回 [0, 1)
let num = low, den = total ** MSG.length, out = '';
for (let k = 0; k < MSG.length; k++) {
  const scaled = num * total;
  const ch = [...syms].reverse().find((c) => scaled >= cum[c] * den);
  out += ch;
  num = scaled - cum[ch] * den;
  den *= freq[ch];
}
console.log('decoded:', out);
