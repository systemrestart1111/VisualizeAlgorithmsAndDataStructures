#include <stdio.h>

#define N 7
typedef struct { int s, e, w; } Iv;

int main(void) {
    Iv a[N] = {{0, 3, 2}, {2, 9, 20}, {3, 5, 3}, {5, 7, 4}, {7, 10, 3}, {9, 12, 6}, {10, 14, 2}};
    /* 依結束時間排序（插入排序，穩定） */
    for (int i = 1; i < N; i++) for (int j = i; j > 0 && (a[j - 1].e > a[j].e || (a[j - 1].e == a[j].e && a[j - 1].s > a[j].s)); j--) { Iv t = a[j]; a[j] = a[j - 1]; a[j - 1] = t; }
    /* p[j] = 結束 ≤ s_j 的活動個數（二分搜尋） */
    int p[N], dp[N + 1] = {0};
    for (int j = 0; j < N; j++) { int lo = 0, hi = N; while (lo < hi) { int m = (lo + hi) / 2; if (a[m].e <= a[j].s) lo = m + 1; else hi = m; } p[j] = lo; }
    for (int j = 1; j <= N; j++) { int take = a[j - 1].w + dp[p[j - 1]]; dp[j] = dp[j - 1] > take ? dp[j - 1] : take; }
    int pick[N], np = 0;
    for (int j = N; j > 0;) { if (dp[j] != dp[j - 1]) { pick[np++] = j - 1; j = p[j - 1]; } else j--; }
    printf("best total: %d chosen:", dp[N]);
    for (int k = np - 1; k >= 0; k--) printf(" [%d,%d)w%d", a[pick[k]].s, a[pick[k]].e, a[pick[k]].w);
    int last = -1000, greedy = 0;
    for (int j = 0; j < N; j++) if (a[j].s >= last) { greedy += a[j].w; last = a[j].e; }
    printf("\nearliest-finish greedy: %d\n", greedy);
    return 0;
}
