// 乘積可能超過 2^53，因此用 BigInt 計算
function modPow(a, e, n) {
  let r = 1n;
  for (a %= n; e > 0n; e >>= 1n, a = (a * a) % n) if (e & 1n) r = (r * a) % n;
  return r;
}

// 寫成 n-1 = d·2^s；對每個底數 a，若 a^d ≢ 1 且平方 s 次都沒出現 -1，a 就是「合數的證人」
function isProbablePrime(n) {
  if (n < 2n) return [false, null];
  if (n % 2n === 0n) return [n === 2n, 2n];
  let d = n - 1n, s = 0;
  while (d % 2n === 0n) { d /= 2n; s++; }
  for (const a of [2n, 3n, 5n, 7n, 11n, 13n, 17n]) {
    if (a % n === 0n) continue;
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let ok = false;
    for (let r = 1; r < s && !ok; r++) {
      x = (x * x) % n;
      if (x === n - 1n) ok = true;
    }
    if (!ok) return [false, a];
  }
  return [true, null];
}

for (const n of [561n, 7919n, 1000003n, 25326001n, 2147483647n]) {
  const [prime, w] = isProbablePrime(n);
  console.log(prime ? `${n}: prime` : `${n}: composite (witness ${w})`);
}
