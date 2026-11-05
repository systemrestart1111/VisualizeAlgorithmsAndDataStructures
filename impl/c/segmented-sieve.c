#include <math.h>
#include <stdio.h>

/* 先用普通篩法求出 √hi 以內的質數，再只在 [lo, hi] 這一段裡劃掉它們的倍數（記憶體只需區間長度） */
int main(void) {
    long long lo = 1000, hi = 1060;
    int lim = (int)sqrt((double)hi), small[64], ns = 0;
    char comp[64] = {0}, mark[128];
    for (int p = 2; p <= lim; p++) {
        if (comp[p]) continue;
        small[ns++] = p;
        for (int m = p * p; m <= lim; m += p) comp[m] = 1;
    }
    for (int i = 0; i <= hi - lo; i++) mark[i] = 1;
    for (int k = 0; k < ns; k++) {
        long long p = small[k], start = (lo + p - 1) / p * p; /* 區間內第一個 p 的倍數 */
        if (start < p * p) start = p * p;
        for (long long m = start; m <= hi; m += p) mark[m - lo] = 0;
    }
    printf("base primes <= sqrt(%lld):", hi);
    for (int k = 0; k < ns; k++) printf(" %d", small[k]);
    printf("\nprimes in [%lld, %lld]:", lo, hi);
    for (long long i = 0; i <= hi - lo; i++) if (mark[i] && lo + i >= 2) printf(" %lld", lo + i);
    printf("\n");
    return 0;
}
