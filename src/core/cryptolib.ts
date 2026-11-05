// 密碼學頁共用：SHA-256（可記錄中間狀態）、HMAC、AES-128、MGF1 與位元組／BigInt 轉換

// ---------------- SHA-256 ----------------
export const SHA_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
export const SHA_H0 = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
const rotr = (x: number, n: number) => ((x >>> n) | (x << (32 - n))) >>> 0;

/** 補位：附加 0x80、補 0 到長度 ≡ 56 (mod 64)，最後 8 位元組是原始位元長度 */
export function shaPad(msg: number[]): number[] {
  const out = [...msg, 0x80];
  while (out.length % 64 !== 56) out.push(0);
  const bits = msg.length * 8;
  for (let i = 7; i >= 0; i--) out.push(Math.floor(bits / 2 ** (8 * i)) & 0xff);
  return out;
}

export interface ShaTrace {
  padded: number[];
  blocks: { W: number[]; rounds: number[][]; before: number[]; after: number[] }[];
}

export function sha256(msg: number[], trace?: ShaTrace): number[] {
  const p = shaPad(msg);
  const H = [...SHA_H0];
  if (trace) trace.padded = p;
  for (let off = 0; off < p.length; off += 64) {
    const W: number[] = [];
    for (let t = 0; t < 16; t++) W[t] = ((p[off + 4 * t] << 24) | (p[off + 4 * t + 1] << 16) | (p[off + 4 * t + 2] << 8) | p[off + 4 * t + 3]) >>> 0;
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    const rounds: number[][] = [];
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA_K[t] + W[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      rounds.push([a, b, c, d, e, f, g, h]);
    }
    const before = [...H];
    const add = [a, b, c, d, e, f, g, h];
    for (let i = 0; i < 8; i++) H[i] = (H[i] + add[i]) >>> 0;
    trace?.blocks.push({ W, rounds, before, after: [...H] });
  }
  return H.flatMap((x) => [x >>> 24, (x >>> 16) & 0xff, (x >>> 8) & 0xff, x & 0xff]);
}
export const w32 = (x: number) => (x >>> 0).toString(16).padStart(8, '0');

export function hmacSha256(key: number[], msg: number[]) {
  let k = key.length > 64 ? sha256(key) : [...key];
  while (k.length < 64) k.push(0);
  const ipad = k.map((b) => b ^ 0x36), opad = k.map((b) => b ^ 0x5c);
  const inner = sha256([...ipad, ...msg]);
  return { k0: k, ipad, opad, inner, mac: sha256([...opad, ...inner]) };
}

export function mgf1(seed: number[], len: number) {
  const out: number[] = [];
  for (let c = 0; out.length < len; c++) out.push(...sha256([...seed, (c >>> 24) & 255, (c >>> 16) & 255, (c >>> 8) & 255, c & 255]));
  return out.slice(0, len);
}

export const bytesToBig = (b: number[]) => b.reduce((s, x) => (s << 8n) | BigInt(x), 0n);
export function bigToBytes(x: bigint, len: number) {
  const out = new Array(len).fill(0);
  for (let i = len - 1; i >= 0; i--) { out[i] = Number(x & 255n); x >>= 8n; }
  return out;
}

// ---------------- AES-128 ----------------
const xtime = (a: number) => ((a << 1) & 0xff) ^ (a & 0x80 ? 0x1b : 0);
export const gmul = (a: number, b: number) => {
  let p = 0;
  for (let i = 0; i < 8; i++) { if (b & 1) p ^= a; a = xtime(a); b >>= 1; }
  return p;
};
/** S-box：GF(2⁸) 反元素後做仿射轉換 */
export const SBOX: number[] = (() => {
  const s: number[] = [];
  for (let x = 0; x < 256; x++) {
    let inv = 0;
    if (x) for (let y = 1; y < 256; y++) if (gmul(x, y) === 1) { inv = y; break; }
    let r = inv;
    for (let k = 1; k <= 4; k++) r ^= ((inv << k) | (inv >> (8 - k))) & 0xff;
    s.push(r ^ 0x63);
  }
  return s;
})();
export const INV_SBOX: number[] = (() => { const t: number[] = []; SBOX.forEach((v, i) => (t[v] = i)); return t; })();

/** 擴充金鑰：44 個 32 位元字，每 4 個組成一把輪金鑰 */
export function keyExpansion(key: number[]): number[][] {
  const w: number[][] = [];
  for (let i = 0; i < 4; i++) w.push(key.slice(4 * i, 4 * i + 4));
  let rcon = 1;
  for (let i = 4; i < 44; i++) {
    let t = [...w[i - 1]];
    if (i % 4 === 0) {
      t = [SBOX[t[1]] ^ rcon, SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]];
      rcon = xtime(rcon);
    }
    w.push(t.map((b, j) => b ^ w[i - 4][j]));
  }
  return Array.from({ length: 11 }, (_, r) => w.slice(4 * r, 4 * r + 4).flat());
}

// 狀態以欄為主序：s[r + 4c]
export const subBytes = (s: number[]) => s.map((b) => SBOX[b]);
export const shiftRows = (s: number[]) => s.map((_, i) => { const r = i % 4, c = Math.floor(i / 4); return s[r + 4 * ((c + r) % 4)]; });
export const mixColumns = (s: number[]) => {
  const o = [...s];
  for (let c = 0; c < 4; c++) {
    const [a0, a1, a2, a3] = s.slice(4 * c, 4 * c + 4);
    o[4 * c] = gmul(a0, 2) ^ gmul(a1, 3) ^ a2 ^ a3;
    o[4 * c + 1] = a0 ^ gmul(a1, 2) ^ gmul(a2, 3) ^ a3;
    o[4 * c + 2] = a0 ^ a1 ^ gmul(a2, 2) ^ gmul(a3, 3);
    o[4 * c + 3] = gmul(a0, 3) ^ a1 ^ a2 ^ gmul(a3, 2);
  }
  return o;
};
export const addRoundKey = (s: number[], k: number[]) => s.map((b, i) => b ^ k[i]);

export function aesEncrypt(block: number[], rk: number[][], trace?: { step: string; round: number; state: number[] }[]) {
  let s = addRoundKey(block, rk[0]);
  trace?.push({ step: 'AddRoundKey', round: 0, state: s });
  for (let r = 1; r <= 10; r++) {
    s = subBytes(s); trace?.push({ step: 'SubBytes', round: r, state: s });
    s = shiftRows(s); trace?.push({ step: 'ShiftRows', round: r, state: s });
    if (r < 10) { s = mixColumns(s); trace?.push({ step: 'MixColumns', round: r, state: s }); }
    s = addRoundKey(s, rk[r]); trace?.push({ step: 'AddRoundKey', round: r, state: s });
  }
  return s;
}

export function aesDecrypt(block: number[], rk: number[][]) {
  let s = addRoundKey(block, rk[10]);
  for (let r = 9; r >= 0; r--) {
    s = s.map((_, i) => { const row = i % 4, c = Math.floor(i / 4); return s[row + 4 * ((c - row + 4) % 4)]; });
    s = s.map((b) => INV_SBOX[b]);
    s = addRoundKey(s, rk[r]);
    if (r > 0) {
      const o = [...s];
      for (let c = 0; c < 4; c++) {
        const [a0, a1, a2, a3] = s.slice(4 * c, 4 * c + 4);
        o[4 * c] = gmul(a0, 14) ^ gmul(a1, 11) ^ gmul(a2, 13) ^ gmul(a3, 9);
        o[4 * c + 1] = gmul(a0, 9) ^ gmul(a1, 14) ^ gmul(a2, 11) ^ gmul(a3, 13);
        o[4 * c + 2] = gmul(a0, 13) ^ gmul(a1, 9) ^ gmul(a2, 14) ^ gmul(a3, 11);
        o[4 * c + 3] = gmul(a0, 11) ^ gmul(a1, 13) ^ gmul(a2, 9) ^ gmul(a3, 14);
      }
      s = o;
    }
  }
  return s;
}

/** 4×4 狀態轉成表格列（第 r 列 = s[r], s[r+4], ...） */
export const stateRows = (s: number[]) => [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => s[r + 4 * c].toString(16).padStart(2, '0')));

// 教學用 512 位元 RSA 金鑰（p、q 為 256 位元質數）。僅供示範，實務至少 2048 位元
export const DEMO_RSA = {
  p: 88494094867571305240952241389651622413765025194372159975889012403144098300989n,
  q: 98465999666333986588422126322352697318119207795834249128587460847635781572759n,
  e: 65537n,
  get n() { return this.p * this.q; },
  get d() {
    const phi = (this.p - 1n) * (this.q - 1n);
    let [r0, r1, s0, s1] = [this.e, phi, 1n, 0n];
    while (r1) { const k = r0 / r1; [r0, r1] = [r1, r0 - k * r1]; [s0, s1] = [s1, s0 - k * s1]; }
    return ((s0 % phi) + phi) % phi;
  },
};
