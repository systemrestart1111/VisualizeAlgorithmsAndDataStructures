#include <stdio.h>

#define X 15
static int has[64], M[64], B[64];
static int f(int m, int b, int x) { return m * x + b; }

/* 每個節點保存在中點較小的直線；另一條只可能在某一半較小，遞迴進入那一半 */
static void insert(int m, int b, int o, int l, int r) {
    if (!has[o]) { has[o] = 1; M[o] = m; B[o] = b; return; }
    int mid = (l + r) / 2;
    if (f(m, b, mid) < f(M[o], B[o], mid)) { int tm = M[o], tb = B[o]; M[o] = m; B[o] = b; m = tm; b = tb; }
    if (l == r) return;
    if (f(m, b, l) < f(M[o], B[o], l)) insert(m, b, 2 * o, l, mid);
    else if (f(m, b, r) < f(M[o], B[o], r)) insert(m, b, 2 * o + 1, mid + 1, r);
}
static int query(int x) {
    int o = 1, l = 0, r = X, best = 1 << 30;
    while (has[o]) {
        int v = f(M[o], B[o], x);
        if (v < best) best = v;
        if (l == r) break;
        int mid = (l + r) / 2;
        if (x <= mid) { o = 2 * o; r = mid; } else { o = 2 * o + 1; l = mid + 1; }
    }
    return best;
}

int main(void) {
    int L[6][2] = {{1, 2}, {-1, 10}, {0, 6}, {2, -6}, {-2, 20}, {1, 3}};
    for (int i = 0; i < 6; i++) insert(L[i][0], L[i][1], 1, 0, X);
    for (int x = 0; x <= X; x += 3) {
        int brute = 1 << 30;
        for (int i = 0; i < 6; i++) if (f(L[i][0], L[i][1], x) < brute) brute = f(L[i][0], L[i][1], x);
        printf("x = %2d: li chao %d, brute %d\n", x, query(x), brute);
    }
    return 0;
}
