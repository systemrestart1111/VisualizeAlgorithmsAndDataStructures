#include <stdio.h>

/* 試除法：從 2 開始除，能整除就一直除；試到 √n 為止，剩下的若大於 1 就是最後一個質因數 */
int main(void) {
    long long n = 360360, first = 1;
    printf("%lld =", n);
    for (long long d = 2; d * d <= n; d++) {
        int e = 0;
        while (n % d == 0) { n /= d; e++; }
        if (!e) continue;
        printf(first ? " " : " x ");
        first = 0;
        if (e > 1) printf("%lld^%d", d, e);
        else printf("%lld", d);
    }
    if (n > 1) printf(first ? " %lld" : " x %lld", n);
    printf("\n");
    return 0;
}
