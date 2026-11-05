// 輾轉相除：gcd(a, b) = gcd(b, a mod b)，直到餘數為 0
function gcd(a, b) {
  while (b) {
    console.log(`${a} = ${Math.floor(a / b)} x ${b} + ${a % b}`);
    [a, b] = [b, a % b];
  }
  return a;
}

console.log('gcd =', gcd(252, 105));
