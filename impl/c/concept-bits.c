#include <stdio.h>

#define W 8
#define MASK ((1u << W) - 1)

static const char *bin(unsigned x) {
    static char buf[4][W + 1];
    static int k = 0;
    char *s = buf[k++ & 3];
    for (int i = 0; i < W; i++) s[i] = ((x >> (W - 1 - i)) & 1) ? '1' : '0';
    s[W] = 0;
    return s;
}

int main(void) {
    unsigned a = 182, b = 109, k = 3;
    printf("a      = %s %u\n", bin(a), a);
    printf("b      = %s %u\n", bin(b), b);
    printf("a & b  = %s %u\n", bin(a & b), a & b);
    printf("a | b  = %s %u\n", bin(a | b), a | b);
    printf("a ^ b  = %s %u\n", bin(a ^ b), a ^ b);
    printf("~a     = %s %u\n", bin(~a & MASK), ~a & MASK);
    printf("a << 3 = %s %u (overflow bits: %u )\n", bin((a << k) & MASK), (a << k) & MASK, (a << k) >> W);
    printf("a >> 3 = %s %u\n", bin(a >> k), a >> k);
    printf("lowbit = %s %u\n", bin(a & (0u - a)), a & (0u - a));
    printf("bit 3 of a = %u ; set bit 3 -> %u ; clear bit 2 -> %u\n", (a >> k) & 1, a | (1u << k), a & ~(1u << 2) & MASK);
    printf("-3 in 8 bits = %s\n", bin((unsigned)-3 & MASK));
    return 0;
}
