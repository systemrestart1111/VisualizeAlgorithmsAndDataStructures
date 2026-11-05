const pw = (b, e, m) => { let r = 1n; b %= m; while (e) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; e >>= 1n; } return r; };
const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };

// C(n, k) ≡ ∏ C(nᵢ, kᵢ) (mod p)，nᵢ、kᵢ 是 p 進位的各位數
function lucas(n, k, p) {
  const P = BigInt(p), fact = [1n];
  for (let i = 1; i < p; i++) fact.push((fact[i - 1] * BigInt(i)) % P);
  let res = 1n;
  while (n || k) {
    const ni = Number(n % P), ki = Number(k % P);
    if (ki > ni) return 0n;
    res = (res * ((((fact[ni] * pw(fact[ki], P - 2n, P)) % P) * pw(fact[ni - ki], P - 2n, P)) % P)) % P;
    n /= P; k /= P;
  }
  return res;
}
function pascal(n, k, p) {
  if (k > n) return 0;
  const row = [1, ...new Array(k).fill(0)];
  for (let i = 1; i <= n; i++) for (let j = Math.min(i, k); j > 0; j--) row[j] = (row[j] + row[j - 1]) % p;
  return row[k];
}

for (const [n, k, p] of [[1000n, 300n, 13], [5n, 2n, 3], [100n, 50n, 7], [10n, 3n, 2], [7n, 9n, 5], [999n, 0n, 11], [10n ** 12n, 123456789n, 99991], [10n ** 15n, 10n ** 14n, 7], [6n, 2n, 4]]) {
  const head = `C(${n},${k}) mod ${p}`;
  if (!isPrime(p)) console.log(`${head}: ${p} is not prime`);
  else if (n <= 1000n) console.log(`${head} = ${lucas(n, k, p)} (pascal ${pascal(Number(n), Number(k), p)})`);
  else console.log(`${head} = ${lucas(n, k, p)}`);
}
