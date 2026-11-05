const EN = [8.17, 1.49, 2.78, 4.25, 12.7, 2.23, 2.02, 6.09, 6.97, 0.15, 0.77, 4.03, 2.41, 6.75, 7.51, 1.93, 0.1, 5.99, 6.33, 9.06, 2.76, 0.98, 2.36, 0.15, 1.97, 0.07];

const cipher = 'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ. IUHTXHQFB DQDOBVLV LV D FODVVLF ZDB WR EUHDN VXEVWLWXWLRQ FLSKHUV';
const cnt = new Array(26).fill(0);
let n = 0;
for (const c of cipher) if (c >= 'A' && c <= 'Z') { cnt[c.charCodeAt(0) - 65]++; n++; }
console.log('counts:', cnt.map((c, i) => (c ? String.fromCharCode(65 + i) + c : '')).filter(Boolean).join(' '));
// 對每個位移計算卡方距離，越小越像英文
const chi = Array.from({ length: 26 }, (_, k) => {
  let s = 0;
  for (let c = 0; c < 26; c++) { const e = (n * EN[c]) / 100, d = cnt[(c + k) % 26] - e; s += (d * d) / e; }
  return s;
});
const order = [...Array(26).keys()].sort((a, b) => chi[a] - chi[b]);
for (const k of order.slice(0, 3)) console.log(`shift ${k}: chi2 = ${chi[k].toFixed(2)}`);
const best = order[0];
console.log('plain:', cipher.replace(/[A-Z]/g, (c) => String.fromCharCode(65 + ((c.charCodeAt(0) - 65 - best + 26) % 26))));
