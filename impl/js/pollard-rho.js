const gcd = (a, b) => (b ? gcd(b, a % b) : a);
function isPrime(n) {
  if (n < 2n) return false;
  for (let d = 2n; d * d <= n; d++) if (n % d === 0n) return false;
  return true;
}
// f(x) = x² + c；龜兔賽跑找 gcd(|x − y|, n) > 1；d == n 時換 c 重試
function rho(n, log) {
  for (let c = 1n; ; c++) {
    let x = 2n, y = 2n, d = 1n, steps = 0;
    while (d === 1n) {
      x = (x * x + c) % n;
      y = (y * y + c) % n;
      y = (y * y + c) % n;
      d = gcd(x > y ? x - y : y - x, n);
      steps++;
    }
    log?.push(`c=${c} steps=${steps} d=${d}${d === n ? ' (failed, retry)' : ''}`);
    if (d !== n) return d;
  }
}
function factor(n, out) {
  if (n === 1n) return;
  if (isPrime(n)) out.push(n);
  else if (n % 2n === 0n) { out.push(2n); factor(n / 2n, out); }
  else { const d = rho(n); factor(d, out); factor(n / d, out); }
}

for (const n of [8051n, 25n]) { const log = []; rho(n, log); console.log(`rho(${n}): ${log.join('; ')}`); }
for (const n of [1n, 8051n, 201275n, 10403n, 1022117n, 1000003n, 600851475143n, 999985999949n]) {
  const fs = [];
  factor(n, fs);
  fs.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const prod = fs.reduce((a, b) => a * b, 1n);
  console.log(`${n} = ${fs.join(' * ') || '1'} (product ok ${prod === n ? 'True' : 'False'})`);
}
