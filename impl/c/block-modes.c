#include <stdio.h>
#include <string.h>

typedef unsigned char u8;
/* 以自行實作的 AES-128 區塊加密為基礎（同 aes.c） */
static u8 SBOX[256], INV[256];
static u8 xt(u8 a) { return (u8)((a << 1) ^ (a & 0x80 ? 0x1b : 0)); }
static u8 gm(u8 a, u8 b) { u8 p = 0; for (int i = 0; i < 8; i++) { if (b & 1) p ^= a; a = xt(a); b >>= 1; } return p; }
static void init(void) {
    for (int x = 0; x < 256; x++) {
        u8 v = 0, r;
        if (x) for (int y = 1; y < 256; y++) if (gm((u8)x, (u8)y) == 1) { v = (u8)y; break; }
        r = v;
        for (int k = 1; k <= 4; k++) r ^= (u8)((v << k) | (v >> (8 - k)));
        SBOX[x] = r ^ 0x63;
        INV[SBOX[x]] = (u8)x;
    }
}
static void expand(const u8 *key, u8 rk[176]) {
    u8 rc = 1;
    memcpy(rk, key, 16);
    for (int i = 4; i < 44; i++) {
        u8 t[4];
        memcpy(t, rk + 4 * (i - 1), 4);
        if (i % 4 == 0) { u8 a = t[0]; t[0] = SBOX[t[1]] ^ rc; t[1] = SBOX[t[2]]; t[2] = SBOX[t[3]]; t[3] = SBOX[a]; rc = xt(rc); }
        for (int j = 0; j < 4; j++) rk[4 * i + j] = rk[4 * (i - 4) + j] ^ t[j];
    }
}
static const int MIX[4][4] = {{2, 3, 1, 1}, {1, 2, 3, 1}, {1, 1, 2, 3}, {3, 1, 1, 2}};
static const int INV_MIX[4][4] = {{14, 11, 13, 9}, {9, 14, 11, 13}, {13, 9, 14, 11}, {11, 13, 9, 14}};
static void mix(u8 *s, const int m[4][4]) {
    u8 o[16];
    for (int c = 0; c < 4; c++)
        for (int r = 0; r < 4; r++) o[4 * c + r] = gm(s[4 * c], (u8)m[r][0]) ^ gm(s[4 * c + 1], (u8)m[r][1]) ^ gm(s[4 * c + 2], (u8)m[r][2]) ^ gm(s[4 * c + 3], (u8)m[r][3]);
    memcpy(s, o, 16);
}
static void enc(u8 *s, const u8 *rk) {
    u8 t[16];
    for (int i = 0; i < 16; i++) s[i] ^= rk[i];
    for (int r = 1; r <= 10; r++) {
        for (int i = 0; i < 16; i++) s[i] = SBOX[s[i]];
        for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 + i % 4) % 4)];
        memcpy(s, t, 16);
        if (r < 10) mix(s, MIX);
        for (int i = 0; i < 16; i++) s[i] ^= rk[16 * r + i];
    }
}
static void dec(u8 *s, const u8 *rk) {
    u8 t[16];
    for (int i = 0; i < 16; i++) s[i] ^= rk[160 + i];
    for (int r = 9; r >= 0; r--) {
        for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 - i % 4 + 4) % 4)];
        for (int i = 0; i < 16; i++) s[i] = INV[t[i]] ^ rk[16 * r + i];
        if (r) mix(s, INV_MIX);
    }
}

/* PKCS#7 填充後，每塊先與前一個密文區塊 XOR 再加密；回傳密文長度 */
static int cbc_encrypt(const u8 *pt, int n, const u8 *rk, const u8 *iv, int pad, u8 *out) {
    u8 buf[256], prev[16];
    memcpy(buf, pt, n);
    if (pad) { int k = 16 - n % 16; for (int i = 0; i < k; i++) buf[n + i] = (u8)k; n += k; }
    memcpy(prev, iv, 16);
    for (int i = 0; i < n; i += 16) {
        for (int j = 0; j < 16; j++) prev[j] ^= buf[i + j];
        enc(prev, rk);
        memcpy(out + i, prev, 16);
    }
    return n;
}
static int cbc_decrypt(const u8 *ct, int n, const u8 *rk, const u8 *iv, u8 *out) {
    const u8 *prev = iv;
    for (int i = 0; i < n; i += 16) {
        u8 b[16];
        memcpy(b, ct + i, 16);
        dec(b, rk);
        for (int j = 0; j < 16; j++) out[i + j] = b[j] ^ prev[j];
        prev = ct + i;
    }
    return n - out[n - 1];
}
/* 金鑰流 = AES(nonce ∥ 計數器)，與資料 XOR；加解密相同，不需填充 */
static void ctr(const u8 *in, int n, const u8 *rk, const u8 *nonce, u8 *out) {
    for (int i = 0; i < n; i += 16) {
        u8 ks[16] = {0};
        unsigned long long c = (unsigned long long)(i / 16);
        memcpy(ks, nonce, 8);
        for (int j = 0; j < 8; j++) ks[15 - j] = (u8)(c >> (8 * j));
        enc(ks, rk);
        for (int j = 0; j < 16 && i + j < n; j++) out[i + j] = in[i + j] ^ ks[j];
    }
}
static void parse(const char *h, u8 *b) { for (int i = 0; i < 16; i++) { unsigned v; sscanf(h + 2 * i, "%2x", &v); b[i] = (u8)v; } }
static void pr(const char *label, const u8 *b, int n) { printf("%s", label); for (int i = 0; i < n; i++) printf("%02x", b[i]); printf("\n"); }

int main(void) {
    u8 key[16], iv[16], rk[176], p1[16], out[256], back[256];
    init();
    parse("2b7e151628aed2a6abf7158809cf4f3c", key);
    parse("000102030405060708090a0b0c0d0e0f", iv);
    parse("6bc1bee22e409f96e93d7e117393172a", p1);
    expand(key, rk);
    cbc_encrypt(p1, 16, rk, iv, 0, out);
    pr("CBC SP800-38A: ", out, 16);
    const char *pt = "Block modes chain AES blocks!";
    int n = (int)strlen(pt);
    int cn = cbc_encrypt((const u8 *)pt, n, rk, iv, 1, out);
    pr("CBC: ", out, cn);
    int bn = cbc_decrypt(out, cn, rk, iv, back);
    printf("CBC back: %.*s\n", bn, back);
    ctr((const u8 *)pt, n, rk, iv, out);
    pr("CTR: ", out, n);
    ctr(out, n, rk, iv, back);
    printf("CTR back: %.*s\n", n, back);
    return 0;
}
