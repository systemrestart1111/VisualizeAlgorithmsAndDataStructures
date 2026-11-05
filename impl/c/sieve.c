#include <stdio.h>
#include <string.h>

/* 埃拉托斯特尼篩法：從每個質數 p 的 p² 開始，把它的倍數全部劃掉 */
int main(void) {
    int n = 100, cnt = 0;
    char is_prime[101];
    memset(is_prime, 1, sizeof is_prime);
    is_prime[0] = is_prime[1] = 0;
    for (int p = 2; p * p <= n; p++)
        if (is_prime[p])
            for (int m = p * p; m <= n; m += p) is_prime[m] = 0;
    printf("primes <= %d:", n);
    for (int i = 2; i <= n; i++) if (is_prime[i]) { printf(" %d", i); cnt++; }
    printf("\ncount = %d\n", cnt);
    return 0;
}
