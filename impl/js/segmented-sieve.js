// 先用普通篩法求出 √hi 以內的質數，再只在 [lo, hi] 這一段裡劃掉它們的倍數（記憶體只需區間長度）
function segmentedSieve(lo, hi) {
  const lim = Math.floor(Math.sqrt(hi)), comp = new Array(lim + 1).fill(false), small = [];
  for (let p = 2; p <= lim; p++) {
    if (comp[p]) continue;
    small.push(p);
    for (let m = p * p; m <= lim; m += p) comp[m] = true;
  }
  const mark = new Array(hi - lo + 1).fill(true);
  for (const p of small) {
    const start = Math.max(p * p, Math.ceil(lo / p) * p); // 區間內第一個 p 的倍數
    for (let m = start; m <= hi; m += p) mark[m - lo] = false;
  }
  return [small, mark.map((ok, i) => (ok && lo + i >= 2 ? lo + i : null)).filter((x) => x !== null)];
}

const [small, primes] = segmentedSieve(1000, 1060);
console.log('base primes <= sqrt(1060):', small.join(' '));
console.log('primes in [1000, 1060]:', primes.join(' '));
