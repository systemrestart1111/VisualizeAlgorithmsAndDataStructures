import crypto from 'node:crypto';

// 教學用 512 位元金鑰（實務至少 2048 位元）
const N = BigInt('0xa65f7b022bd33ee0c5644be19caed71c0e691cc10d8a6f57576deda07e66082f64fe2af43a24e28ccbf95a14c9494a5182f48935586db21639efb855e79237fb');
const D = BigInt('0x5cadfbbc2de5b3b54ac0a074c1efb3ecf12a24d6765093cdb7ea88e14b0853ae0cf5f81b24b065ad8f8f4ab699525cc9f1d1bda8ed9d743d33bd50f22191bc61');
const N_OTHER = BigInt('0xb0d12b4fc3f44629d53fa2ea439095d3efee1a84c32ce57e0a9c921f42c935e9473b1c9f37efbe3b3e8ca504b8536e9123de2d6a38b71ee7092fb5cfb91af663');
const E = 65537n;
const EM_LEN = 64, H_LEN = 32, S_LEN = 16, PS_LEN = EM_LEN - S_LEN - H_LEN - 2;

const sha = (...parts) => { const h = crypto.createHash('sha256'); parts.forEach((p) => h.update(p)); return h.digest(); };
function mgf1(seed, n) {
  const out = [];
  for (let c = 0; out.length < n; c++) out.push(...sha(seed, Buffer.from([c >>> 24, (c >>> 16) & 255, (c >>> 8) & 255, c & 255])));
  return Buffer.from(out.slice(0, n));
}
function modPow(b, e, m) {
  let r = 1n;
  b %= m;
  for (; e > 0n; e >>= 1n) { if (e & 1n) r = (r * b) % m; b = (b * b) % m; }
  return r;
}
const toBig = (b) => BigInt('0x' + Buffer.from(b).toString('hex'));
const toBytes = (x, n) => Buffer.from(x.toString(16).padStart(2 * n, '0'), 'hex');

// H = SHA256(0^8 ∥ SHA256(M) ∥ salt)；EM = (DB ⊕ MGF1(H)) ∥ H ∥ 0xbc
function pssEncode(msg, salt) {
  const h = sha(Buffer.alloc(8), sha(msg), salt);
  const db = Buffer.concat([Buffer.alloc(PS_LEN), Buffer.from([1]), salt]);
  const mask = mgf1(h, db.length);
  const masked = db.map((b, i) => b ^ mask[i]);
  masked[0] &= 0x7f;
  return Buffer.concat([masked, h, Buffer.from([0xbc])]);
}
function verify(msg, s, n) {
  if (s >= n) return false;
  const em = toBytes(modPow(s, E, n), EM_LEN);
  if (em[EM_LEN - 1] !== 0xbc || em[0] & 0x80) return false;
  const h = em.subarray(EM_LEN - H_LEN - 1, EM_LEN - 1), mask = mgf1(h, EM_LEN - H_LEN - 1);
  const db = em.subarray(0, EM_LEN - H_LEN - 1).map((b, i) => b ^ mask[i]);
  db[0] &= 0x7f;
  if (db.subarray(0, PS_LEN).some((b) => b) || db[PS_LEN] !== 1) return false;
  return sha(Buffer.alloc(8), sha(msg), db.subarray(db.length - S_LEN)).equals(h);
}

let seed = 42;
const salt = Buffer.from(Array.from({ length: S_LEN }, () => { seed = (seed * 48271) % 2147483647; return seed % 256; }));
const msg = Buffer.from('Pay Bob 100 coins');
const em = pssEncode(msg, salt);
const sig = modPow(toBig(em), D, N);
console.log('mHash:', sha(msg).toString('hex'));
console.log('salt :', salt.toString('hex'));
console.log('EM   :', em.toString('hex'));
console.log('sig  :', sig.toString(16).padStart(128, '0'));
console.log('verify original :', verify(msg, sig, N) ? 'True' : 'False');
console.log('verify tampered :', verify(Buffer.from('Pay Bob 900 coins'), sig, N) ? 'True' : 'False');
console.log('verify wrong key:', verify(msg, sig, N_OTHER) ? 'True' : 'False');
