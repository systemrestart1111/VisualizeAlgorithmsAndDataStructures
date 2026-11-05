const m26 = (x) => ((x % 26) + 26) % 26;

// 2×2 金鑰在 mod 26 的反矩陣；det 與 26 不互質時回傳 null
function inverseKey(K) {
  const d = m26(K[0][0] * K[1][1] - K[0][1] * K[1][0]);
  let di = -1;
  for (let x = 1; x < 26; x++) if ((d * x) % 26 === 1) di = x;
  if (di < 0) return null;
  return [[m26(K[1][1] * di), m26(-K[0][1] * di)], [m26(-K[1][0] * di), m26(K[0][0] * di)]];
}
function hill(text, K) {
  const t = [...text.toUpperCase().replace(/[^A-Z]/g, '')].map((c) => c.charCodeAt(0) - 65);
  if (t.length % 2) t.push(23); // 補 X
  let out = '';
  for (let i = 0; i < t.length; i += 2) for (let r = 0; r < 2; r++) out += String.fromCharCode(65 + m26(K[r][0] * t[i] + K[r][1] * t[i + 1]));
  return out;
}

const K = [[3, 3], [2, 5]], Ki = inverseKey(K);
console.log(`K^-1 = [[${Ki[0][0]}, ${Ki[0][1]}], [${Ki[1][0]}, ${Ki[1][1]}]]`);
const c = hill('HELP ME', K);
console.log('cipher:', c);
console.log('plain :', hill(c, Ki));
console.log('key [[2,4],[6,8]] invertible:', inverseKey([[2, 4], [6, 8]]) ? 'True' : 'False');
