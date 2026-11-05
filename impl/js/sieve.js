// 埃拉托斯特尼篩法：從每個質數 p 的 p² 開始，把它的倍數全部劃掉
function sieve(n) {
  const isPrime = new Array(n + 1).fill(true);
  isPrime[0] = isPrime[1] = false;
  for (let p = 2; p * p <= n; p++) if (isPrime[p]) for (let m = p * p; m <= n; m += p) isPrime[m] = false;
  return isPrime.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
}

const primes = sieve(100);
console.log('primes <= 100:', primes.join(' '));
console.log('count =', primes.length);
