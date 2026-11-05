#include <stdio.h>

/* 用擴展歐幾里得解 a·x + m·y = 1，x 就是 a 在模 m 下的反元素（需 gcd(a, m) = 1） */
long long mod_inverse(long long a, long long m) {
    long long old_r = m, r = a, old_t = 0, t = 1;
    while (r) {
        long long q = old_r / r, tmp;
        tmp = r; r = old_r - q * r; old_r = tmp;
        tmp = t; t = old_t - q * t; old_t = tmp;
    }
    if (old_r != 1) return -1;
    return (old_t % m + m) % m;
}

long long mod_pow(long long a, long long n, long long m) {
    long long r = 1;
    for (a %= m; n; n >>= 1, a = a * a % m) if (n & 1) r = r * a % m;
    return r;
}

int main(void) {
    long long a = 17, m = 43, inv = mod_inverse(a, m);
    printf("%lld^-1 mod %lld = %lld\n", a, m, inv);
    printf("check: %lld x %lld mod %lld = %lld\n", a, inv, m, a * inv % m);
    printf("Fermat (m is prime): %lld^(%lld-2) mod %lld = %lld\n", a, m, m, mod_pow(a, m - 2, m));
    return 0;
}
