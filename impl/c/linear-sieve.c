#include <stdio.h>

/* 線性篩：每個合數只被它的「最小質因數」劃掉一次，因此總共 O(n) */
int main(void) {
    int n = 60, spf[61] = {0}, primes[61], np = 0; /* spf[i] = i 的最小質因數 */
    for (int i = 2; i <= n; i++) {
        if (spf[i] == 0) { spf[i] = i; primes[np++] = i; }
        for (int k = 0; k < np && primes[k] <= spf[i] && i * primes[k] <= n; k++) spf[i * primes[k]] = primes[k];
    }
    printf("primes:");
    for (int k = 0; k < np; k++) printf(" %d", primes[k]);
    printf("\nsmallest prime factor of 2..20:");
    for (int i = 2; i <= 20; i++) printf(" %d", spf[i]);
    printf("\n");
    return 0;
}
