#include <stdio.h>
#include <stdlib.h>

static int cmp(const void *x, const void *y) { return *(const int *)x - *(const int *)y; }
static int sums(const int *xs, int n, int *out) {
    for (int m = 0; m < (1 << n); m++) { int s = 0; for (int i = 0; i < n; i++) if (m >> i & 1) s += xs[i]; out[m] = s; }
    return 1 << n;
}

/* 兩半各列舉子集合和；右半排序後，對每個左半和二分搜尋 ≤ T − s 的最大值 */
int best_at_most(const int *a, int n, int T) {
    static int L[1 << 8], R[1 << 8];
    int h = n / 2, nl = sums(a, h, L), nr = sums(a + h, n - h, R), best = -1;
    qsort(R, nr, sizeof(int), cmp);
    for (int i = 0; i < nl; i++) {
        if (L[i] > T) continue;
        int lo = 0, hi = nr - 1, idx = -1;
        while (lo <= hi) { int m = (lo + hi) / 2; if (R[m] <= T - L[i]) { idx = m; lo = m + 1; } else hi = m - 1; }
        if (L[i] + R[idx] > best) best = L[i] + R[idx];
    }
    return best;
}

int main(void) {
    int a[] = {7, 3, 12, 18, 5, 9, 14, 2}, Ts[] = {30, 10, 1, 1000}, all[1 << 8];
    int na = sums(a, 8, all);
    for (int k = 0; k < 4; k++) {
        int brute = 0;
        for (int i = 0; i < na; i++) if (all[i] <= Ts[k] && all[i] > brute) brute = all[i];
        printf("T = %d: best = %d brute = %d\n", Ts[k], best_at_most(a, 8, Ts[k]), brute);
    }
    return 0;
}
