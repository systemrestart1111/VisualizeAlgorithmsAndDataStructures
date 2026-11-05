// 以自行實作的 AES-128 區塊加密為基礎（同 aes.js）
const xt = (a) => ((a << 1) & 0xff) ^ (a & 0x80 ? 0x1b : 0);
const gm = (a, b) => { let p = 0; for (let i = 0; i < 8; i++) { if (b & 1) p ^= a; a = xt(a); b >>= 1; } return p; };
const SBOX = [], INV = [];
for (let x = 0; x < 256; x++) {
  let v = 0;
  if (x) for (let y = 1; y < 256; y++) if (gm(x, y) === 1) { v = y; break; }
  let r = v;
  for (let k = 1; k <= 4; k++) r ^= ((v << k) | (v >> (8 - k))) & 0xff;
  SBOX[x] = r ^ 0x63;
  INV[SBOX[x]] = x;
}
function expand(key) {
  const w = [0, 1, 2, 3].map((i) => key.slice(4 * i, 4 * i + 4));
  let rc = 1;
  for (let i = 4; i < 44; i++) {
    let t = [...w[i - 1]];
    if (i % 4 === 0) { t = [SBOX[t[1]] ^ rc, SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]]; rc = xt(rc); }
    w.push(t.map((b, j) => b ^ w[i - 4][j]));
  }
  return Array.from({ length: 11 }, (_, r) => w.slice(4 * r, 4 * r + 4).flat());
}
const mix = (s, m) => s.map((_, i) => m[i & 3].reduce((acc, k, j) => acc ^ gm(s[4 * (i >> 2) + j], k), 0));
function enc(block, rk) {
  let s = block.map((b, i) => b ^ rk[0][i]);
  for (let r = 1; r <= 10; r++) {
    s = s.map((b) => SBOX[b]);
    s = s.map((_, i) => s[(i % 4) + 4 * (((i >> 2) + (i % 4)) % 4)]);
    if (r < 10) s = mix(s, [[2, 3, 1, 1], [1, 2, 3, 1], [1, 1, 2, 3], [3, 1, 1, 2]]);
    s = s.map((b, i) => b ^ rk[r][i]);
  }
  return s;
}
function dec(block, rk) {
  let s = block.map((b, i) => b ^ rk[10][i]);
  for (let r = 9; r >= 0; r--) {
    s = s.map((_, i) => s[(i % 4) + 4 * (((i >> 2) - (i % 4) + 4) % 4)]);
    s = s.map((b, i) => INV[b] ^ rk[r][i]);
    if (r) s = mix(s, [[14, 11, 13, 9], [9, 14, 11, 13], [13, 9, 14, 11], [11, 13, 9, 14]]);
  }
  return s;
}
// PKCS#7 填充後，每塊先與前一個密文區塊 XOR 再加密
function cbcEncrypt(pt, rk, iv, pad = true) {
  const buf = [...pt];
  if (pad) { const k = 16 - (buf.length % 16); for (let i = 0; i < k; i++) buf.push(k); }
  let prev = [...iv];
  const out = [];
  for (let i = 0; i < buf.length; i += 16) { prev = enc(buf.slice(i, i + 16).map((b, j) => b ^ prev[j]), rk); out.push(...prev); }
  return out;
}
function cbcDecrypt(ct, rk, iv) {
  let prev = [...iv];
  const out = [];
  for (let i = 0; i < ct.length; i += 16) { const blk = ct.slice(i, i + 16); out.push(...dec(blk, rk).map((b, j) => b ^ prev[j])); prev = blk; }
  return out.slice(0, out.length - out[out.length - 1]);
}
// 金鑰流 = AES(nonce ∥ 計數器)，與資料 XOR；加解密相同，不需填充
function ctr(data, rk, nonce) {
  const out = [];
  for (let i = 0; i < data.length; i += 16) {
    const cb = [...nonce.slice(0, 8)];
    for (let j = 7; j >= 0; j--) cb.push(Math.floor(i / 16 / 2 ** (8 * j)) & 0xff);
    const ks = enc(cb, rk);
    data.slice(i, i + 16).forEach((b, j) => out.push(b ^ ks[j]));
  }
  return out;
}
const parse = (h) => [...Buffer.from(h, 'hex')];
const hex = (b) => Buffer.from(b).toString('hex');

const rk = expand(parse('2b7e151628aed2a6abf7158809cf4f3c')), iv = parse('000102030405060708090a0b0c0d0e0f');
console.log('CBC SP800-38A:', hex(cbcEncrypt(parse('6bc1bee22e409f96e93d7e117393172a'), rk, iv, false)));
const pt = [...Buffer.from('Block modes chain AES blocks!')];
let c = cbcEncrypt(pt, rk, iv);
console.log('CBC:', hex(c));
console.log('CBC back:', Buffer.from(cbcDecrypt(c, rk, iv)).toString());
c = ctr(pt, rk, iv);
console.log('CTR:', hex(c));
console.log('CTR back:', Buffer.from(ctr(c, rk, iv)).toString());
