#include <math.h>
#include <stdio.h>

typedef unsigned int u32;
typedef unsigned long long u64;

static u64 poly(const char *s, u64 base, u64 mod) { u64 h = 0; for (; *s; s++) h = (h * base + (unsigned char)*s) % mod; return h; }
static u32 fmix32(u32 h) { h ^= h >> 16; h *= 0x85ebca6bu; h ^= h >> 13; h *= 0xc2b2ae35u; h ^= h >> 16; return h; }
static int clz32(u32 x) { int n = 0; if (!x) return 32; while (!(x & 0x80000000u)) { x <<= 1; n++; } return n; }

#define P 4
#define M (1 << P)
static int R[M];

static void add(const char *s) {
    u32 x = fmix32((u32)poly(s, 31, 4294967291ull));
    int j = (int)(x >> (32 - P));            /* 前 p 位選暫存器 */
    u32 w = x << P;                          /* 其餘位元 */
    int rho = clz32(w) + 1;
    if (rho > 32 - P + 1) rho = 32 - P + 1;
    if (rho > R[j]) R[j] = rho;
}
static double estimate(void) {
    double z = 0;
    int v = 0;
    for (int j = 0; j < M; j++) { z += pow(2.0, -R[j]); if (!R[j]) v++; }
    double e = 0.673 * M * M / z;
    if (e <= 2.5 * M && v > 0) e = M * log((double)M / v);   /* 小基數：線性計數校正 */
    return e;
}

int main(void) {
    int ns[] = {5, 50, 1000, 20000};
    char buf[32];
    for (int t = 0; t < 4; t++) {
        for (int j = 0; j < M; j++) R[j] = 0;
        for (int i = 1; i <= ns[t]; i++) { sprintf(buf, "item%d", i); add(buf); }
        for (int i = 1; i <= ns[t]; i += 2) { sprintf(buf, "item%d", i); add(buf); }
        printf("n = %d: estimate %.2f, registers", ns[t], estimate());
        for (int j = 0; j < M; j++) printf(" %d", R[j]);
        printf("\n");
    }
    return 0;
}
