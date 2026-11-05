#include <stdio.h>

/* 區間加值 + 區間求和；lazy[o] 記錄「整段都要加、但還沒往下推」的值，兩種操作都是 O(log n) */
#define N 8
long long sum[4 * N], lazy[4 * N];

void build(int o, int l, int r, const int *a) {
    if (l == r) { sum[o] = a[l]; return; }
    int m = (l + r) / 2;
    build(2 * o, l, m, a);
    build(2 * o + 1, m + 1, r, a);
    sum[o] = sum[2 * o] + sum[2 * o + 1];
}

void apply(int o, int l, int r, long long v) {
    sum[o] += v * (r - l + 1);
    lazy[o] += v;
}

void push(int o, int l, int r) {
    if (lazy[o]) { /* 要往下走之前，才把延遲的加值交給兩個子節點 */
        int m = (l + r) / 2;
        apply(2 * o, l, m, lazy[o]);
        apply(2 * o + 1, m + 1, r, lazy[o]);
        lazy[o] = 0;
    }
}

void add(int o, int l, int r, int ql, int qr, long long v) {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { apply(o, l, r, v); return; } /* 整段被覆蓋：只更新這個節點並記下 lazy */
    push(o, l, r);
    int m = (l + r) / 2;
    add(2 * o, l, m, ql, qr, v);
    add(2 * o + 1, m + 1, r, ql, qr, v);
    sum[o] = sum[2 * o] + sum[2 * o + 1];
}

long long query(int o, int l, int r, int ql, int qr) {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return sum[o];
    push(o, l, r);
    int m = (l + r) / 2;
    return query(2 * o, l, m, ql, qr) + query(2 * o + 1, m + 1, r, ql, qr);
}

void show(void) {
    printf("array: [");
    for (int i = 0; i < N; i++) printf(i ? " %lld" : "%lld", query(1, 0, N - 1, i, i));
    printf("]\n");
}

int main(void) {
    int a[N] = {5, 8, 6, 3, 2, 7, 2, 6};
    build(1, 0, N - 1, a);
    show();
    printf("sum[2, 5] = %lld\n", query(1, 0, N - 1, 2, 5));
    add(1, 0, N - 1, 1, 4, 3); printf("add +3 on [1, 4]\n");
    printf("sum[0, 7] = %lld\n", query(1, 0, N - 1, 0, 7));
    printf("sum[3, 6] = %lld\n", query(1, 0, N - 1, 3, 6));
    add(1, 0, N - 1, 4, 7, -2); printf("add -2 on [4, 7]\n");
    show();
    printf("sum[0, 7] = %lld\n", query(1, 0, N - 1, 0, 7));
    return 0;
}
