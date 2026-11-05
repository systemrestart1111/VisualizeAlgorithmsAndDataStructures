import crypto from 'node:crypto';
const sha256 = (b) => crypto.createHash('sha256').update(b).digest();

// H((K0 ⊕ opad) ∥ H((K0 ⊕ ipad) ∥ m))
function hmac(key, msg) {
  if (key.length > 64) key = sha256(key);
  const k0 = Buffer.alloc(64);
  key.copy(k0);
  const inner = sha256(Buffer.concat([k0.map((b) => b ^ 0x36), msg]));
  return sha256(Buffer.concat([k0.map((b) => b ^ 0x5c), inner]));
}

const B = (s) => Buffer.from(s);
const known = ['f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8', '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843'];
[['key', 'The quick brown fox jumps over the lazy dog'], ['Jefe', 'what do ya want for nothing?']].forEach(([k, m], t) => {
  const h = hmac(B(k), B(m)).toString('hex');
  console.log(h, 'known vector:', h === known[t] ? 'True' : 'False');
});
console.log('long key:', hmac(B('k'.repeat(100)), B('long key is hashed first')).toString('hex'));
const mac = hmac(B('key'), B('transfer 100 to bob'));
const same = (x) => (crypto.timingSafeEqual(mac, x) ? 'True' : 'False');
console.log('verify original:', same(hmac(B('key'), B('transfer 100 to bob'))));
console.log('verify tampered:', same(hmac(B('key'), B('transfer 900 to bob'))));
console.log('verify wrong key:', same(hmac(B('kex'), B('transfer 100 to bob'))));
