#include <stdio.h>

static long long gcd(long long a, long long b) { return b ? gcd(b, a % b) : a; }

/* φ(n) = n·∏(1 − 1/p)，以 result −= result / p 實作 */
static long long phi(long long n) {
    long long result = n;
    for (long long p = 2; p * p <= n; p++)
        if (n % p == 0) {
            while (n % p == 0) n /= p;
            result -= result / p;
        }
    if (n > 1) result -= result / n;
    return result;
}

int main(void) {
    long long tests[9] = {1, 2, 36, 97, 100, 360, 1000000, 999999937, 600851475143LL};
    for (int t = 0; t < 9; t++) {
        long long n = tests[t];
        if (n <= 1000) {
            int brute = 0;
            for (long long x = 1; x <= n; x++) if (gcd(x, n) == 1) brute++;
            printf("phi(%lld) = %lld (gcd count %d)\n", n, phi(n), brute);
        } else printf("phi(%lld) = %lld\n", n, phi(n));
    }
    return 0;
}
