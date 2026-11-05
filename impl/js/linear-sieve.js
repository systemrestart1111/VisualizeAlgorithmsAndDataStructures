// 線性篩：每個合數只被它的「最小質因數」劃掉一次，因此總共 O(n)
function linearSieve(n) {
  const spf = new Array(n + 1).fill(0), primes = []; // spf[i] = i 的最小質因數
  for (let i = 2; i <= n; i++) {
    if (spf[i] === 0) { spf[i] = i; primes.push(i); }
    for (const p of primes) {
      if (p > spf[i] || i * p > n) break;
      spf[i * p] = p;
    }
  }
  return [primes, spf];
}

const [primes, spf] = linearSieve(60);
console.log('primes:', primes.join(' '));
console.log('smallest prime factor of 2..20:', spf.slice(2, 21).join(' '));
