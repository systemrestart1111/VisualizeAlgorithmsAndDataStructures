const pw = (b, e, m) => { let r = 1n; b %= m; while (e) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; } return r; };
const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// a^x ≡ b (mod M)：小步存 a^j，大步檢查 b·a^(−s·i)；需要 gcd(a, M) = 1
function bsgs(a, b, M) {
  if (gcd(a % M, M) !== 1n) return 'gcd';
  a %= M; b %= M;
  let s = 1n;
  while (s * s < M) s++;
  const table = new Map();
  let cur = 1n;
  for (let j = 0n; j < s; j++) { if (!table.has(cur)) table.set(cur, j); cur = (cur * a) % M; }
  const factor = modInv(pw(a, s, M), M);
  let gamma = b;
  for (let i = 0n; i < s; i++) {
    if (table.has(gamma)) return i * s + table.get(gamma);
    gamma = (gamma * factor) % M;
  }
  return null;
}
// 擴展歐幾里得求反元素
function modInv(a, m) {
  let [g, x, g1, x1] = [m, 0n, a, 1n];
  while (g1) { const q = g / g1; [g, g1] = [g1, g - q * g1]; [x, x1] = [x1, x - q * x1]; }
  return ((x % m) + m) % m;
}

for (const [a, b, M] of [[3n, 13n, 101n], [2n, 3n, 7n], [5n, 1n, 23n], [2n, 1000n, 1000003n], [7n, 123456n, 1000000007n], [6n, 4n, 10n], [3n, 13n, 17n]]) {
  const x = bsgs(a, b, M), head = `${a}^x = ${b} mod ${M}: `;
  if (x === 'gcd') console.log(head + 'gcd(a, M) != 1, basic BSGS not applicable');
  else if (x === null) console.log(head + 'no solution');
  else console.log(head + `x = ${x} (check ${pw(a, x, M)})`);
}
