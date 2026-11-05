#include <stdio.h>

typedef unsigned long long u64;

/* n < 2^32 時 a·b < 2^64，不會溢位 */
u64 mod_pow(u64 a, u64 e, u64 n) {
    u64 r = 1;
    for (a %= n; e; e >>= 1, a = a * a % n) if (e & 1) r = r * a % n;
    return r;
}

/* 寫成 n-1 = d·2^s；對每個底數 a，若 a^d ≢ 1 且平方 s 次都沒出現 -1，a 就是「合數的證人」 */
int is_probable_prime(u64 n, u64 *witness) {
    u64 bases[] = {2, 3, 5, 7, 11, 13, 17};
    if (n < 2) return 0;
    if (n % 2 == 0) { *witness = 2; return n == 2; }
    u64 d = n - 1;
    int s = 0;
    while (d % 2 == 0) { d /= 2; s++; }
    for (int i = 0; i < 7; i++) {
        u64 a = bases[i];
        if (a % n == 0) continue;
        u64 x = mod_pow(a, d, n);
        if (x == 1 || x == n - 1) continue;
        int ok = 0;
        for (int r = 1; r < s && !ok; r++) {
            x = x * x % n;
            if (x == n - 1) ok = 1;
        }
        if (!ok) { *witness = a; return 0; }
    }
    return 1;
}

int main(void) {
    u64 tests[] = {561, 7919, 1000003, 25326001, 2147483647}, w = 0;
    for (int i = 0; i < 5; i++) {
        if (is_probable_prime(tests[i], &w)) printf("%llu: prime\n", tests[i]);
        else printf("%llu: composite (witness %llu)\n", tests[i], w);
    }
    return 0;
}
