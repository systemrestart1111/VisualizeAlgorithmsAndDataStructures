#include <stdio.h>
#include <string.h>

typedef unsigned char u8;
static u8 SBOX[256], INV[256];
static u8 xt(u8 a) { return (u8)((a << 1) ^ (a & 0x80 ? 0x1b : 0)); }
static u8 gm(u8 a, u8 b) { u8 p = 0; for (int i = 0; i < 8; i++) { if (b & 1) p ^= a; a = xt(a); b >>= 1; } return p; }

/* S-box：GF(2^8) 反元素後做仿射轉換 */
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
static void mix(u8 *s, const int m[4][4]) {
    u8 o[16];
    for (int c = 0; c < 4; c++)
        for (int r = 0; r < 4; r++) o[4 * c + r] = gm(s[4 * c], (u8)m[r][0]) ^ gm(s[4 * c + 1], (u8)m[r][1]) ^ gm(s[4 * c + 2], (u8)m[r][2]) ^ gm(s[4 * c + 3], (u8)m[r][3]);
    memcpy(s, o, 16);
}
static const int MIX[4][4] = {{2, 3, 1, 1}, {1, 2, 3, 1}, {1, 1, 2, 3}, {3, 1, 1, 2}};
static const int INV_MIX[4][4] = {{14, 11, 13, 9}, {9, 14, 11, 13}, {13, 9, 14, 11}, {11, 13, 9, 14}};

static void encrypt(u8 *s, const u8 *rk) {
    u8 t[16];
    for (int i = 0; i < 16; i++) s[i] ^= rk[i];
    for (int r = 1; r <= 10; r++) {
        for (int i = 0; i < 16; i++) s[i] = SBOX[s[i]];                                  /* SubBytes */
        for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 + i % 4) % 4)];         /* ShiftRows */
        memcpy(s, t, 16);
        if (r < 10) mix(s, MIX);                                                         /* MixColumns */
        for (int i = 0; i < 16; i++) s[i] ^= rk[16 * r + i];                             /* AddRoundKey */
    }
}
static void decrypt(u8 *s, const u8 *rk) {
    u8 t[16];
    for (int i = 0; i < 16; i++) s[i] ^= rk[160 + i];
    for (int r = 9; r >= 0; r--) {
        for (int i = 0; i < 16; i++) t[i] = s[i % 4 + 4 * ((i / 4 - i % 4 + 4) % 4)];
        for (int i = 0; i < 16; i++) s[i] = INV[t[i]] ^ rk[16 * r + i];
        if (r) mix(s, INV_MIX);
    }
}
static void hex2bytes(const char *h, u8 *b) { for (int i = 0; i < 16; i++) { unsigned v; sscanf(h + 2 * i, "%2x", &v); b[i] = (u8)v; } }
static void pr(const char *label, const u8 *b) { printf("%s", label); for (int i = 0; i < 16; i++) printf("%02x", b[i]); printf("\n"); }

int main(void) {
    const char *tests[2][2] = {{"000102030405060708090a0b0c0d0e0f", "00112233445566778899aabbccddeeff"}, {"2b7e151628aed2a6abf7158809cf4f3c", "6bc1bee22e409f96e93d7e117393172a"}};
    init();
    for (int t = 0; t < 2; t++) {
        u8 key[16], s[16], rk[176];
        hex2bytes(tests[t][0], key);
        hex2bytes(tests[t][1], s);
        expand(key, rk);
        printf("key  : %s\n", tests[t][0]);
        pr("rk10 : ", rk + 160);
        encrypt(s, rk);
        pr("ct   : ", s);
        decrypt(s, rk);
        pr("back : ", s);
    }
    return 0;
}
