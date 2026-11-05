#include <stdio.h>

static int mobius(int x) {
    int k = 0, sq = 0;
    for (int d = 2; d * d <= x; d++)
        if (x % d == 0) { x /= d; k++; if (x % d == 0) sq = 1; while (x % d == 0) x /= d; }
    if (x > 1) k++;
    return sq ? 0 : (k % 2 ? -1 : 1);
}

/* g(n) = Σ_{d|n} f(d)；再以 f(n) = Σ_{d|n} μ(n/d)·g(d) 還原 */
static void run(const int *f, int N) {
    int g[17], back[17], ok = 1;
    for (int n = 1; n <= N; n++) { g[n] = 0; for (int d = 1; d <= n; d++) if (n % d == 0) g[n] += f[d - 1]; }
    for (int n = 1; n <= N; n++) { back[n] = 0; for (int d = 1; d <= n; d++) if (n % d == 0) back[n] += mobius(n / d) * g[d]; if (back[n] != f[n - 1]) ok = 0; }
    printf("g:");
    for (int n = 1; n <= N; n++) printf(" %d", g[n]);
    printf("\nf recovered:");
    for (int n = 1; n <= N; n++) printf(" %d", back[n]);
    printf(" (match %s)\n", ok ? "True" : "False");
}

int main(void) {
    int f1[12] = {1, 1, 2, 2, 4, 2, 6, 4, 6, 4, 10, 4};
    int f2[16] = {3, -1, 4, 1, -5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3};
    int f3[12] = {1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1};
    run(f1, 12);
    run(f2, 16);
    run(f3, 12);
    return 0;
}
