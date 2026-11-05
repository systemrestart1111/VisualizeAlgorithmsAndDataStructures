const xt = (a) => ((a << 1) & 0xff) ^ (a & 0x80 ? 0x1b : 0);
const gm = (a, b) => { let p = 0; for (let i = 0; i < 8; i++) { if (b & 1) p ^= a; a = xt(a); b >>= 1; } return p; };

// S-box：GF(2^8) 反元素後做仿射轉換
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
const MIX = [[2, 3, 1, 1], [1, 2, 3, 1], [1, 1, 2, 3], [3, 1, 1, 2]];
const INV_MIX = [[14, 11, 13, 9], [9, 14, 11, 13], [13, 9, 14, 11], [11, 13, 9, 14]];
const mix = (s, m) => s.map((_, i) => { const c = i >> 2, r = i & 3; return m[r].reduce((acc, k, j) => acc ^ gm(s[4 * c + j], k), 0); });

function encrypt(block, rk) {
  let s = block.map((b, i) => b ^ rk[0][i]);
  for (let r = 1; r <= 10; r++) {
    s = s.map((b) => SBOX[b]);                                            // SubBytes
    s = s.map((_, i) => s[(i % 4) + 4 * (((i >> 2) + (i % 4)) % 4)]);      // ShiftRows
    if (r < 10) s = mix(s, MIX);                                          // MixColumns
    s = s.map((b, i) => b ^ rk[r][i]);                                    // AddRoundKey
  }
  return s;
}
function decrypt(block, rk) {
  let s = block.map((b, i) => b ^ rk[10][i]);
  for (let r = 9; r >= 0; r--) {
    s = s.map((_, i) => s[(i % 4) + 4 * (((i >> 2) - (i % 4) + 4) % 4)]);
    s = s.map((b, i) => INV[b] ^ rk[r][i]);
    if (r) s = mix(s, INV_MIX);
  }
  return s;
}
const parse = (h) => [...Buffer.from(h, 'hex')];
const hex = (b) => Buffer.from(b).toString('hex');

for (const [key, pt] of [['000102030405060708090a0b0c0d0e0f', '00112233445566778899aabbccddeeff'], ['2b7e151628aed2a6abf7158809cf4f3c', '6bc1bee22e409f96e93d7e117393172a']]) {
  const rk = expand(parse(key));
  const ct = encrypt(parse(pt), rk);
  console.log('key  :', key);
  console.log('rk10 :', hex(rk[10]));
  console.log('ct   :', hex(ct));
  console.log('back :', hex(decrypt(ct, rk)));
}
