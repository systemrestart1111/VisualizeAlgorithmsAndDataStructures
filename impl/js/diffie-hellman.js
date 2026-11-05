function modPow(b, e, m) {
  let r = 1n;
  b %= m;
  while (e > 0n) {
    if (e & 1n) r = (r * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return r;
}

let [p, g, a, b] = [23n, 5n, 6n, 15n];
let A = modPow(g, a, p), B = modPow(g, b, p);
const sa = modPow(B, a, p), sb = modPow(A, b, p);
console.log(`public: p=${p} g=${g} A=${A} B=${B}`);
console.log(`Alice shared = ${sa}, Bob shared = ${sb}, equal = ${sa === sb ? 'True' : 'False'}`);
[p, g, a, b] = [2147483647n, 7n, 123456789n, 987654321n];
A = modPow(g, a, p); B = modPow(g, b, p);
console.log(`p=${p}: A=${A} B=${B} shared=${modPow(B, a, p)} ${modPow(A, b, p)}`);
