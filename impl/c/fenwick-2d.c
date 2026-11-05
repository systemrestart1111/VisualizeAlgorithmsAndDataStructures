#include <stdio.h>

#define N 6
static int t[N + 1][N + 1], a[N + 1][N + 1];

/* 兩個維度各自沿 lowbit 跳：更新往上、查詢往下（1 起算） */
static void add(int r, int c, int v) {
    for (int i = r; i <= N; i += i & -i)
        for (int j = c; j <= N; j += j & -j) t[i][j] += v;
}
static int prefix(int r, int c) {
    int s = 0;
    for (int i = r; i > 0; i -= i & -i)
        for (int j = c; j > 0; j -= j & -j) s += t[i][j];
    return s;
}
static int rect(int r1, int c1, int r2, int c2) { return prefix(r2, c2) - prefix(r1 - 1, c2) - prefix(r2, c1 - 1) + prefix(r1 - 1, c1 - 1); }

int main(void) {
    int ups[6][3] = {{1, 1, 3}, {2, 3, 5}, {4, 2, 2}, {3, 5, 4}, {6, 6, 1}, {5, 4, 6}}, qs[4][4] = {{1, 1, 6, 6}, {2, 2, 4, 5}, {3, 3, 3, 3}, {4, 1, 6, 4}};
    for (int k = 0; k < 6; k++) { add(ups[k][0], ups[k][1], ups[k][2]); a[ups[k][0]][ups[k][1]] += ups[k][2]; }
    for (int k = 0; k < 4; k++) {
        int *q = qs[k], brute = 0;
        for (int i = q[0]; i <= q[2]; i++) for (int j = q[1]; j <= q[3]; j++) brute += a[i][j];
        printf("sum(%d, %d, %d, %d) = %d (brute %d)\n", q[0], q[1], q[2], q[3], rect(q[0], q[1], q[2], q[3]), brute);
    }
    add(4, 4, 10);
    printf("after add(4, 4, 10): sum(2, 2, 4, 5) = %d\n", rect(2, 2, 4, 5));
    return 0;
}
