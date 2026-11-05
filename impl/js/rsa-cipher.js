// 擴展歐幾里得求 e 在 mod φ 的反元素
function inverse(e, phi) {
  let [r0, r1, s0, s1] = [e, phi, 1, 0];
  while (r1) {
    const q = Math.floor(r0 / r1);
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
  }
  return ((s0 % phi) + phi) % phi;
}
// 平方乘法（BigInt 避免中間乘積超過安全整數）
function modPow(b, e, m) {
  let r = 1n;
  for (const bit of e.toString(2)) {
    r = (r * r) % m;
    if (bit === '1') r = (r * b) % m;
  }
  return r;
}

const p = 61, q = 53, e = 17, n = p * q, phi = (p - 1) * (q - 1), d = inverse(e, phi);
console.log(`n = ${n}, phi = ${phi}, e = ${e}, d = ${d}`);
const cs = [65, 66, 67].map((m) => modPow(BigInt(m), BigInt(e), BigInt(n)));
console.log(`cipher: [${cs.join(', ')}]`);
console.log(`plain : [${cs.map((c) => modPow(c, BigInt(d), BigInt(n))).join(', ')}]`);
