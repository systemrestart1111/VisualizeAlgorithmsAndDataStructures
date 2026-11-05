#include <stdio.h>

#define N 12
static int st[5][N], len[5], levels;

static int mn(int x, int y) { return x < y ? x : y; }
static int lg(int x) { int k = 0; while ((1 << (k + 1)) <= x) k++; return k; }

/* st[j][i] = min(a[i .. i + 2^j − 1]) */
static void build(const int *a) {
    for (int i = 0; i < N; i++) st[0][i] = a[i];
    len[0] = N; levels = 1;
    for (int j = 1; (1 << j) <= N; j++, levels++) {
        len[j] = N - (1 << j) + 1;
        for (int i = 0; i < len[j]; i++) st[j][i] = mn(st[j - 1][i], st[j - 1][i + (1 << (j - 1))]);
    }
}
/* 兩段長度 2^k 的區間可以重疊：只適用於 min／max／gcd 等冪等運算 */
static int query(int l, int r) { int k = lg(r - l + 1); return mn(st[k][l], st[k][r - (1 << k) + 1]); }

int main(void) {
    int a[N] = {5, 2, 8, 6, 3, 7, 1, 9, 4, 6, 2, 8};
    build(a);
    for (int j = 0; j < levels; j++) { printf("2^%d:", j); for (int i = 0; i < len[j]; i++) printf(" %d", st[j][i]); printf("\n"); }
    int qs[6][2] = {{0, 4}, {3, 9}, {6, 6}, {0, 11}, {8, 11}, {2, 5}};
    for (int q = 0; q < 6; q++) {
        int l = qs[q][0], r = qs[q][1], b = a[l];
        for (int i = l; i <= r; i++) b = mn(b, a[i]);
        printf("min[%d, %d] = %d (brute %d)\n", l, r, query(l, r), b);
    }
    return 0;
}
