// 用擴展歐幾里得解 a·x + m·y = 1，x 就是 a 在模 m 下的反元素（需 gcd(a, m) = 1）
function modInverse(a, m) {
  let [oldR, r, oldT, t] = [m, a, 0, 1];
  while (r) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldT, t] = [t, oldT - q * t];
  }
  return oldR === 1 ? ((oldT % m) + m) % m : null;
}

function modPow(a, n, m) {
  let r = 1;
  for (a %= m; n; n >>= 1, a = (a * a) % m) if (n & 1) r = (r * a) % m;
  return r;
}

const a = 17, m = 43, inv = modInverse(a, m);
console.log(`${a}^-1 mod ${m} = ${inv}`);
console.log(`check: ${a} x ${inv} mod ${m} = ${(a * inv) % m}`);
console.log(`Fermat (m is prime): ${a}^(${m}-2) mod ${m} = ${modPow(a, m - 2, m)}`);
