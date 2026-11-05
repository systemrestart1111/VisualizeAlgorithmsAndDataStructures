#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef unsigned int u32;
typedef unsigned char u8;
static const u32 K[64] = {
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2};
#define ROR(x, n) (((x) >> (n)) | ((x) << (32 - (n))))

/* SHA-256（同 sha256.c） */
static void sha256(const u8 *msg, size_t n, u8 out[32]) {
    size_t L = ((n + 9 + 63) / 64) * 64;
    u8 *p = calloc(L, 1);
    memcpy(p, msg, n);
    p[n] = 0x80;
    unsigned long long bits = (unsigned long long)n * 8;
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

/* H((K0 ⊕ opad) ∥ H((K0 ⊕ ipad) ∥ m)) */
static void hmac_sha256(const u8 *key, size_t kn, const u8 *msg, size_t mn, u8 out[32]) {
    u8 k0[64] = {0}, buf[64 + 512], inner[32];
    if (kn > 64) sha256(key, kn, k0); else memcpy(k0, key, kn);
    for (int i = 0; i < 64; i++) buf[i] = k0[i] ^ 0x36;
    memcpy(buf + 64, msg, mn);
    sha256(buf, 64 + mn, inner);
    for (int i = 0; i < 64; i++) buf[i] = k0[i] ^ 0x5c;
    memcpy(buf + 64, inner, 32);
    sha256(buf, 96, out);
}
static void mac_of(const char *k, size_t kn, const char *m, u8 out[32]) { hmac_sha256((const u8 *)k, kn, (const u8 *)m, strlen(m), out); }

int main(void) {
    char longkey[100];
    memset(longkey, 'k', 100);
    const char *keys[3] = {"key", "Jefe", longkey};
    size_t kl[3] = {3, 4, 100};
    const char *msgs[3] = {"The quick brown fox jumps over the lazy dog", "what do ya want for nothing?", "long key is hashed first"};
    const char *known[2] = {"f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8", "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"};
    u8 mac[32], other[32];
    char hex[65];
    for (int t = 0; t < 3; t++) {
        mac_of(keys[t], kl[t], msgs[t], mac);
        for (int i = 0; i < 32; i++) sprintf(hex + 2 * i, "%02x", mac[i]);
        if (t < 2) printf("%s known vector: %s\n", hex, strcmp(hex, known[t]) == 0 ? "True" : "False");
        else printf("long key: %s\n", hex);
    }
    mac_of("key", 3, "transfer 100 to bob", mac);
    mac_of("key", 3, "transfer 100 to bob", other);
    printf("verify original: %s\n", memcmp(mac, other, 32) == 0 ? "True" : "False");
    mac_of("key", 3, "transfer 900 to bob", other);
    printf("verify tampered: %s\n", memcmp(mac, other, 32) == 0 ? "True" : "False");
    mac_of("kex", 3, "transfer 100 to bob", other);
    printf("verify wrong key: %s\n", memcmp(mac, other, 32) == 0 ? "True" : "False");
    return 0;
}
