#include <stdio.h>
#include <stdlib.h>

static int cmp_int(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }
static int cmp_iv(const void *a, const void *b) {
    const int *p = a, *q = b;
    return p[0] != q[0] ? p[0] - q[0] : p[1] - q[1];
}

/* 掃描線：把所有矩形的左右邊 x 當成事件排序；相鄰兩個事件之間的直條內，覆蓋的 y 長度固定 */
int main(void) {
    int R[][4] = {{1, 1, 6, 5}, {3, 3, 9, 8}, {7, 1, 11, 4}, {2, 6, 5, 10}}, n = 4, xs[8], nx = 0;
    for (int i = 0; i < n; i++) { xs[nx++] = R[i][0]; xs[nx++] = R[i][2]; }
    qsort(xs, nx, sizeof(int), cmp_int);
    int m = 0;
    for (int i = 0; i < nx; i++) if (i == 0 || xs[i] != xs[i - 1]) xs[m++] = xs[i];
    long long total = 0;
    for (int k = 0; k + 1 < m; k++) {
        int xa = xs[k], xb = xs[k + 1], ivs[8][2], ni = 0;
        for (int i = 0; i < n; i++) /* 這一條內有效的 y 區間 */
            if (R[i][0] <= xa && R[i][2] >= xb) { ivs[ni][0] = R[i][1]; ivs[ni++][1] = R[i][3]; }
        qsort(ivs, ni, sizeof ivs[0], cmp_iv);
        int covered = 0, lo = 0, hi = 0, have = 0;
        for (int i = 0; i < ni; i++) { /* 合併重疊的 y 區間 */
            if (!have || ivs[i][0] > hi) {
                if (have) covered += hi - lo;
                lo = ivs[i][0]; hi = ivs[i][1]; have = 1;
            } else if (ivs[i][1] > hi) hi = ivs[i][1];
        }
        if (have) covered += hi - lo;
        total += (long long)covered * (xb - xa);
        printf("x in [%d, %d): covered y = %d, area += %d\n", xa, xb, covered, covered * (xb - xa));
    }
    printf("union area = %lld\n", total);
    return 0;
}
