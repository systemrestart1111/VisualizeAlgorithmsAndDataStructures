#include <stdio.h>

/* 在較短陣列上二分切點，使左半共 (m+n+1)/2 個且左半最大 ≤ 右半最小 */
double median(const int *a, int m, const int *b, int n) {
    if (m > n) return median(b, n, a, m);
    int half = (m + n + 1) / 2, lo = 0, hi = m;
    const double INF = 1e18;
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i;
        double l1 = i > 0 ? a[i - 1] : -INF, r1 = i < m ? a[i] : INF;
        double l2 = j > 0 ? b[j - 1] : -INF, r2 = j < n ? b[j] : INF;
        if (l1 <= r2 && l2 <= r1) {
            double lmax = l1 > l2 ? l1 : l2, rmin = r1 < r2 ? r1 : r2;
            return (m + n) % 2 ? lmax : (lmax + rmin) / 2;
        }
        if (l1 > r2) hi = i - 1; else lo = i + 1;
    }
    return 0;
}

void show(const int *a, int n) { printf("["); for (int i = 0; i < n; i++) printf(i ? ", %d" : "%d", a[i]); printf("]"); }
void run(const int *a, int m, const int *b, int n) { show(a, m); printf(" "); show(b, n); printf(" median = %.1f\n", median(a, m, b, n)); }

int main(void) {
    int a1[] = {1, 3, 8, 9, 15}, b1[] = {7, 11, 18, 19, 21, 25}, b2[] = {2, 3}, a3[] = {1, 2}, b3[] = {3, 4}, a4[] = {5}, b4[] = {1, 2, 3, 4};
    run(a1, 5, b1, 6);
    run(NULL, 0, b2, 2);
    run(a3, 2, b3, 2);
    run(a4, 1, b4, 4);
    return 0;
}
