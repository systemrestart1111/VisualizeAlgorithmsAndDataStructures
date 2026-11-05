#include <stdio.h>

typedef unsigned long long u64;
u64 mod_pow(u64 b, u64 e, u64 m) {
    u64 r = 1;
    b %= m;
    while (e) { if (e & 1) r = r * b % m; b = b * b % m; e >>= 1; } /* m < 2^32，乘積不溢位 */
    return r;
}

int main(void) {
    u64 p = 23, g = 5, a = 6, b = 15;
    u64 A = mod_pow(g, a, p), B = mod_pow(g, b, p);
    u64 sa = mod_pow(B, a, p), sb = mod_pow(A, b, p);
    printf("public: p=%llu g=%llu A=%llu B=%llu\n", p, g, A, B);
    printf("Alice shared = %llu, Bob shared = %llu, equal = %s\n", sa, sb, sa == sb ? "True" : "False");
    p = 2147483647; g = 7; a = 123456789; b = 987654321;
    A = mod_pow(g, a, p); B = mod_pow(g, b, p);
    printf("p=%llu: A=%llu B=%llu shared=%llu %llu\n", p, A, B, mod_pow(B, a, p), mod_pow(A, b, p));
    return 0;
}
