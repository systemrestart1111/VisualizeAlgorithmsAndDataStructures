#include <stdio.h>

/* 節點存在陣列中；更新只複製根到葉的路徑，其餘子樹共用 */
#define MAXN 256
static int sum[MAXN], lc[MAXN], rc[MAXN], cnt, roots[16], nver, n = 8;

static int mk(int s, int l, int r) { sum[cnt] = s; lc[cnt] = l; rc[cnt] = r; return cnt++; }
static int build(const int *a, int lo, int hi) {
    if (lo == hi) return mk(a[lo], -1, -1);
    int m = (lo + hi) / 2, L = build(a, lo, m), R = build(a, m + 1, hi);
    return mk(sum[L] + sum[R], L, R);
}
static int update(int node, int lo, int hi, int i, int v) {
    if (lo == hi) return mk(v, -1, -1);
    int m = (lo + hi) / 2, L = lc[node], R = rc[node];
    if (i <= m) L = update(L, lo, m, i, v); else R = update(R, m + 1, hi, i, v);
    return mk(sum[L] + sum[R], L, R);
}
static int query(int node, int lo, int hi, int l, int r) {
    if (r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return sum[node];
    int m = (lo + hi) / 2;
    return query(lc[node], lo, m, l, r) + query(rc[node], m + 1, hi, l, r);
}
/* 以最新版本為基礎建立新版本 */
static void set(int i, int v) { roots[nver] = update(roots[nver - 1], 0, n - 1, i, v); nver++; }

int main(void) {
    int a[8] = {4, 1, 3, 5, 2, 6, 1, 3};
    roots[nver++] = build(a, 0, n - 1);
    set(2, 7);
    set(5, 0);
    for (int v = 0; v < 3; v++) printf("version %d: sum[0,7] = %d, sum[2,5] = %d\n", v, query(roots[v], 0, n - 1, 0, 7), query(roots[v], 0, n - 1, 2, 5));
    printf("total nodes: %d (15 + 4 + 4)\n", cnt);
    return 0;
}
