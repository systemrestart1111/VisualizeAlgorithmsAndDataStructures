const gcd = (a, b) => (b ? gcd(b, a % b) : a);

// φ(n) = n·∏(1 − 1/p)，以 result −= result / p 實作
function phi(n) {
  let result = n;
  for (let p = 2; p * p <= n; p++)
    if (n % p === 0) {
      while (n % p === 0) n /= p;
      result -= result / p;
    }
  if (n > 1) result -= result / n;
  return result;
}

for (const n of [1, 2, 36, 97, 100, 360, 1000000, 999999937, 600851475143]) {
  if (n <= 1000) {
    let brute = 0;
    for (let x = 1; x <= n; x++) if (gcd(x, n) === 1) brute++;
    console.log(`phi(${n}) = ${phi(n)} (gcd count ${brute})`);
  } else console.log(`phi(${n}) = ${phi(n)}`);
}
