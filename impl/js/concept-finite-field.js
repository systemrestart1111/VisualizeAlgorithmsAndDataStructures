// GF(2^8) 乘法：逐位相加（XOR），a 每次乘 x（xtime），溢出時對 0x11B 約化
function gfMul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p;
}

// a^254 = a^-1（a ≠ 0）；0 沒有反元素
function gfInv(a) {
  if (!a) return null;
  let r = 1;
  for (let e = 254; e; e >>= 1) {
    if (e & 1) r = gfMul(r, a);
    a = gfMul(a, a);
  }
  return r;
}

const h = (x) => '0x' + x.toString(16).toUpperCase().padStart(2, '0');
console.log(`0x57 + 0x83 = ${h(0x57 ^ 0x83)}`);
console.log(`0x57 * 0x83 = ${h(gfMul(0x57, 0x83))}`);
console.log(`0x57 * 0x13 = ${h(gfMul(0x57, 0x13))}`);
const inv = gfInv(0x57);
console.log(`inv(0x57) = ${h(inv)}, check = ${h(gfMul(0x57, inv))}`);
console.log(`inv(0x00) = ${gfInv(0) === null ? 'none' : '?'}`);
