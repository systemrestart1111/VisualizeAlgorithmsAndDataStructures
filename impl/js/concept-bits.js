const W = 8, MASK = (1 << W) - 1;
const b = (x) => (x & MASK).toString(2).padStart(W, '0');

const a = 182, c = 109, k = 3;
console.log('a      =', b(a), a);
console.log('b      =', b(c), c);
console.log('a & b  =', b(a & c), a & c);
console.log('a | b  =', b(a | c), a | c);
console.log('a ^ b  =', b(a ^ c), a ^ c);
console.log('~a     =', b(~a), ~a & MASK);
console.log('a << 3 =', b(a << k), (a << k) & MASK, '(overflow bits:', (a << k) >> W, ')');
console.log('a >> 3 =', b(a >> k), a >> k);
console.log('lowbit =', b(a & -a), a & -a);
console.log('bit 3 of a =', (a >> k) & 1, '; set bit 3 ->', a | (1 << k), '; clear bit 2 ->', a & ~(1 << 2) & MASK);
console.log('-3 in 8 bits =', b(-3));
