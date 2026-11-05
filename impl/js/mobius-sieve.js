// 線性篩：質數 μ = −1；i % p == 0 時 i·p 含 p²，μ = 0；否則 μ(i·p) = −μ(i)
function mobiusSieve(N) {
  const mu = new Array(N + 1).fill(0), comp = new Array(N + 1).fill(false), primes = [];
  mu[1] = 1;
  for (let i = 2; i <= N; i++) {
    if (!comp[i]) { primes.push(i); mu[i] = -1; }
    for (const p of primes) {
      if (i * p > N) break;
      comp[i * p] = true;
      if (i % p === 0) { mu[i * p] = 0; break; }
      mu[i * p] = -mu[i];
    }
  }
  return mu;
}
function byFactoring(x) {
  let k = 0;
  for (let d = 2; d * d <= x; d++)
    if (x % d === 0) { x /= d; if (x % d === 0) return 0; k++; }
  if (x > 1) k++;
  return k % 2 ? -1 : 1;
}

console.log(`mu(1..30): ${mobiusSieve(30).slice(1).join(' ')}`);
const N = 1000, mu = mobiusSieve(N).slice(1);
const cnt = (v) => mu.filter((x) => x === v).length;
console.log(`N=${N}: +1 ${cnt(1)}, -1 ${cnt(-1)}, 0 ${cnt(0)}, Mertens ${mu.reduce((a, b) => a + b, 0)}`);
console.log(`check by factoring: ${mu.every((v, i) => v === byFactoring(i + 1)) ? 'True' : 'False'}`);
