#include <stdio.h>
#include <string.h>

#define MAXN 1000
static int mu[MAXN + 1], comp[MAXN + 1], primes[MAXN], np;

/* 線性篩：質數 μ = −1；i % p == 0 時 i·p 含 p²，μ = 0；否則 μ(i·p) = −μ(i) */
static void sieve(int N) {
    memset(mu, 0, sizeof mu); memset(comp, 0, sizeof comp); np = 0;
    mu[1] = 1;
    for (int i = 2; i <= N; i++) {
        if (!comp[i]) { primes[np++] = i; mu[i] = -1; }
        for (int k = 0; k < np && i * primes[k] <= N; k++) {
            int p = primes[k];
            comp[i * p] = 1;
            if (i % p == 0) { mu[i * p] = 0; break; }
            mu[i * p] = -mu[i];
        }
    }
}
static int by_factoring(int x) {
    int k = 0;
    for (int d = 2; d * d <= x; d++)
        if (x % d == 0) { x /= d; if (x % d == 0) return 0; k++; }
    if (x > 1) k++;
    return k % 2 ? -1 : 1;
}

int main(void) {
    sieve(30);
    printf("mu(1..30):");
    for (int i = 1; i <= 30; i++) printf(" %d", mu[i]);
    printf("\n");
    sieve(MAXN);
    int pos = 0, neg = 0, zero = 0, sum = 0, ok = 1;
    for (int x = 1; x <= MAXN; x++) { pos += mu[x] == 1; neg += mu[x] == -1; zero += mu[x] == 0; sum += mu[x]; if (mu[x] != by_factoring(x)) ok = 0; }
    printf("N=%d: +1 %d, -1 %d, 0 %d, Mertens %d\n", MAXN, pos, neg, zero, sum);
    printf("check by factoring: %s\n", ok ? "True" : "False");
    return 0;
}
