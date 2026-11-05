#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef unsigned int u32;
typedef unsigned char u8;
typedef unsigned long long u64;

/* ---------- SHA-256（同 sha256.c） ---------- */
static const u32 K[64] = {
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2};
#define ROR(x, n) (((x) >> (n)) | ((x) << (32 - (n))))
static void sha256(const u8 *msg, size_t n, u8 out[32]) {
    size_t L = ((n + 9 + 63) / 64) * 64;
    u8 *p = calloc(L, 1);
    memcpy(p, msg, n);
    p[n] = 0x80;
    u64 bits = (u64)n * 8;
    for (int i = 0; i < 8; i++) p[L - 1 - i] = (u8)(bits >> (8 * i));
    u32 H[8] = {0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19};
    for (size_t off = 0; off < L; off += 64) {
        u32 W[64], v[8];
        for (int t = 0; t < 16; t++) W[t] = (u32)p[off + 4 * t] << 24 | (u32)p[off + 4 * t + 1] << 16 | (u32)p[off + 4 * t + 2] << 8 | p[off + 4 * t + 3];
        for (int t = 16; t < 64; t++) W[t] = W[t - 16] + (ROR(W[t - 15], 7) ^ ROR(W[t - 15], 18) ^ (W[t - 15] >> 3)) + W[t - 7] + (ROR(W[t - 2], 17) ^ ROR(W[t - 2], 19) ^ (W[t - 2] >> 10));
        memcpy(v, H, sizeof v);
        for (int t = 0; t < 64; t++) {
            u32 t1 = v[7] + (ROR(v[4], 6) ^ ROR(v[4], 11) ^ ROR(v[4], 25)) + ((v[4] & v[5]) ^ (~v[4] & v[6])) + K[t] + W[t];
            u32 t2 = (ROR(v[0], 2) ^ ROR(v[0], 13) ^ ROR(v[0], 22)) + ((v[0] & v[1]) ^ (v[0] & v[2]) ^ (v[1] & v[2]));
            memmove(v + 1, v, 7 * sizeof(u32));
            v[4] += t1;
            v[0] = t1 + t2;
        }
        for (int i = 0; i < 8; i++) H[i] += v[i];
    }
    free(p);
    for (int i = 0; i < 8; i++) for (int j = 0; j < 4; j++) out[4 * i + j] = (u8)(H[i] >> (24 - 8 * j));
}

/* ---------- 512 位元大數（17 個 32 位元字，低位在前） ---------- */
#define NL 17
typedef struct { u32 v[NL]; } bn;
static void bn_hex(bn *a, const char *h) {
    int len = (int)strlen(h);
    memset(a, 0, sizeof *a);
    for (int i = 0; i < len; i++) {
        char c = h[len - 1 - i];
        u32 d = (u32)(c <= '9' ? c - '0' : c - 'a' + 10);
        a->v[i / 8] |= d << (4 * (i % 8));
    }
}
static void bn_from_bytes(bn *a, const u8 *b, int n) { memset(a, 0, sizeof *a); for (int i = 0; i < n; i++) a->v[i / 4] |= (u32)b[n - 1 - i] << (8 * (i % 4)); }
static void bn_to_bytes(const bn *a, u8 *b, int n) { for (int i = 0; i < n; i++) b[n - 1 - i] = (u8)(a->v[i / 4] >> (8 * (i % 4))); }
static int bn_cmp(const bn *a, const bn *b) { for (int i = NL - 1; i >= 0; i--) if (a->v[i] != b->v[i]) return a->v[i] > b->v[i] ? 1 : -1; return 0; }
static void bn_sub(bn *a, const bn *b) { u64 br = 0; for (int i = 0; i < NL; i++) { u64 t = (u64)a->v[i] - b->v[i] - br; a->v[i] = (u32)t; br = (t >> 32) & 1; } }
static void bn_add(bn *a, const bn *b) { u64 c = 0; for (int i = 0; i < NL; i++) { c += (u64)a->v[i] + b->v[i]; a->v[i] = (u32)c; c >>= 32; } }
static void bn_shl1(bn *a) { for (int i = NL - 1; i > 0; i--) a->v[i] = (a->v[i] << 1) | (a->v[i - 1] >> 31); a->v[0] <<= 1; }
static int bn_bit(const bn *a, int i) { return (a->v[i / 32] >> (i % 32)) & 1; }
/* r = a·b mod n：由高位到低位「加倍再加」，中間值始終 < 2n */
static void bn_mulmod(bn *r, const bn *a, const bn *b, const bn *n) {
    bn t;
    memset(&t, 0, sizeof t);
    for (int i = NL * 32 - 1; i >= 0; i--) {
        bn_shl1(&t);
        if (bn_cmp(&t, n) >= 0) bn_sub(&t, n);
        if (bn_bit(b, i)) { bn_add(&t, a); if (bn_cmp(&t, n) >= 0) bn_sub(&t, n); }
    }
    *r = t;
}
static void bn_powmod(bn *r, const bn *base, const bn *e, const bn *n) {
    bn x;
    int top = NL * 32 - 1;
    memset(&x, 0, sizeof x);
    x.v[0] = 1;
    while (top >= 0 && !bn_bit(e, top)) top--;
    for (int i = top; i >= 0; i--) {
        bn_mulmod(&x, &x, &x, n);
        if (bn_bit(e, i)) bn_mulmod(&x, &x, base, n);
    }
    *r = x;
}

/* ---------- RSA-PSS（SHA-256、MGF1、salt 16 位元組） ---------- */
#define EM_LEN 64
#define H_LEN 32
#define S_LEN 16
#define PS_LEN (EM_LEN - S_LEN - H_LEN - 2)
static void mgf1(const u8 *seed, int sn, u8 *out, int n) {
    u8 buf[64], h[32];
    for (int c = 0, k = 0; k < n; c++) {
        memcpy(buf, seed, sn);
        buf[sn] = (u8)(c >> 24); buf[sn + 1] = (u8)(c >> 16); buf[sn + 2] = (u8)(c >> 8); buf[sn + 3] = (u8)c;
        sha256(buf, sn + 4, h);
        for (int i = 0; i < 32 && k < n; i++) out[k++] = h[i];
    }
}
/* H = SHA256(0^8 ∥ SHA256(M) ∥ salt) */
static void pss_hash(const char *msg, const u8 *salt, u8 *h) {
    u8 buf[8 + H_LEN + S_LEN] = {0};
    sha256((const u8 *)msg, strlen(msg), buf + 8);
    memcpy(buf + 8 + H_LEN, salt, S_LEN);
    sha256(buf, sizeof buf, h);
}
static void pss_encode(const char *msg, const u8 *salt, u8 *em) {
    u8 h[H_LEN], db[EM_LEN - H_LEN - 1] = {0}, mask[EM_LEN - H_LEN - 1];
    pss_hash(msg, salt, h);
    db[PS_LEN] = 1;
    memcpy(db + PS_LEN + 1, salt, S_LEN);
    mgf1(h, H_LEN, mask, EM_LEN - H_LEN - 1);
    for (int i = 0; i < EM_LEN - H_LEN - 1; i++) em[i] = db[i] ^ mask[i];
    em[0] &= 0x7f;
    memcpy(em + EM_LEN - H_LEN - 1, h, H_LEN);
    em[EM_LEN - 1] = 0xbc;
}
static int verify(const char *msg, const bn *s, const bn *n, const bn *e) {
    bn m;
    u8 em[EM_LEN], db[EM_LEN - H_LEN - 1], h[H_LEN];
    if (bn_cmp(s, n) >= 0) return 0;
    bn_powmod(&m, s, e, n);
    bn_to_bytes(&m, em, EM_LEN);
    if (em[EM_LEN - 1] != 0xbc || (em[0] & 0x80)) return 0;
    mgf1(em + EM_LEN - H_LEN - 1, H_LEN, db, EM_LEN - H_LEN - 1);
    for (int i = 0; i < EM_LEN - H_LEN - 1; i++) db[i] ^= em[i];
    db[0] &= 0x7f;
    for (int i = 0; i < PS_LEN; i++) if (db[i]) return 0;
    if (db[PS_LEN] != 1) return 0;
    pss_hash(msg, db + PS_LEN + 1, h);
    return memcmp(h, em + EM_LEN - H_LEN - 1, H_LEN) == 0;
}
static void pr(const char *label, const u8 *b, int n) { printf("%s", label); for (int i = 0; i < n; i++) printf("%02x", b[i]); printf("\n"); }

int main(void) {
    bn N, D, N2, E, m, sig;
    bn_hex(&N, "a65f7b022bd33ee0c5644be19caed71c0e691cc10d8a6f57576deda07e66082f64fe2af43a24e28ccbf95a14c9494a5182f48935586db21639efb855e79237fb");
    bn_hex(&D, "5cadfbbc2de5b3b54ac0a074c1efb3ecf12a24d6765093cdb7ea88e14b0853ae0cf5f81b24b065ad8f8f4ab699525cc9f1d1bda8ed9d743d33bd50f22191bc61");
    bn_hex(&N2, "b0d12b4fc3f44629d53fa2ea439095d3efee1a84c32ce57e0a9c921f42c935e9473b1c9f37efbe3b3e8ca504b8536e9123de2d6a38b71ee7092fb5cfb91af663");
    bn_hex(&E, "10001");
    u8 salt[S_LEN], em[EM_LEN], mh[32], sb[EM_LEN];
    u64 seed = 42;
    for (int i = 0; i < S_LEN; i++) { seed = seed * 48271 % 2147483647; salt[i] = (u8)(seed % 256); }
    const char *msg = "Pay Bob 100 coins";
    pss_encode(msg, salt, em);
    bn_from_bytes(&m, em, EM_LEN);
    bn_powmod(&sig, &m, &D, &N);
    sha256((const u8 *)msg, strlen(msg), mh);
    pr("mHash: ", mh, 32);
    pr("salt : ", salt, S_LEN);
    pr("EM   : ", em, EM_LEN);
    bn_to_bytes(&sig, sb, EM_LEN);
    pr("sig  : ", sb, EM_LEN);
    printf("verify original : %s\n", verify(msg, &sig, &N, &E) ? "True" : "False");
    printf("verify tampered : %s\n", verify("Pay Bob 900 coins", &sig, &N, &E) ? "True" : "False");
    printf("verify wrong key: %s\n", verify(msg, &sig, &N2, &E) ? "True" : "False");
    return 0;
}
