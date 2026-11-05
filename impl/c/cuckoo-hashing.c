#include <stdio.h>

#define MAXN 64
static int N = 7, T[2][MAXN], used[2][MAXN];

static int is_prime(int n) { if (n < 2) return 0; for (int d = 2; d * d <= n; d++) if (n % d == 0) return 0; return 1; }
static int h(int i, int x) { return i == 0 ? x % N : (x / N) % N; }
static int find(int x) { return (used[0][h(0, x)] && T[0][h(0, x)] == x) || (used[1][h(1, x)] && T[1][h(1, x)] == x); }
static void reset(int n) { N = n; for (int i = 0; i < 2; i++) for (int j = 0; j < MAXN; j++) used[i][j] = 0; }

/* 兩張表；鍵只能在 T1[x mod N] 或 T2[(x / N) mod N]。成功回傳 1；循環時回傳 0 並把手上的鍵存到 *left */
static int place(int x, int *left) {
    int cur = x;
    for (int k = 0; k < 2 * N; k++)
        for (int i = 0; i < 2; i++) {
            int p = h(i, cur), old = T[i][p], had = used[i][p];
            T[i][p] = cur; used[i][p] = 1;
            if (!had) return 1;
            cur = old;
        }
    *left = cur;
    return 0;
}
static void insert(int x) {
    int left, items[2 * MAXN], m = 0;
    if (find(x)) return;
    if (place(x, &left)) return;
    for (int i = 0; i < 2; i++) for (int j = 0; j < N; j++) if (used[i][j]) items[m++] = T[i][j];
    items[m++] = left;
    for (;;) {
        int n = N + 1, ok = 1;
        while (!is_prime(n)) n++;
        reset(n);
        for (int i = 0; i < m && ok; i++) ok = place(items[i], &left);
        if (ok) break;
    }
    printf("  rehash -> N = %d\n", N);
}
static void del(int x) { for (int i = 0; i < 2; i++) if (used[i][h(i, x)] && T[i][h(i, x)] == x) used[i][h(i, x)] = 0; }
static void show(const char *label, int i) {
    printf("%s", label);
    for (int j = 0; j < N; j++) { if (used[i][j]) printf(" %d", T[i][j]); else printf(" ."); }
    printf("\n");
}

int main(void) {
    int xs[] = {20, 50, 53, 75, 100, 67, 105, 3, 36, 39, 6};
    for (int i = 0; i < 11; i++) { printf("insert %d\n", xs[i]); insert(xs[i]); }
    show("T1:", 0);
    show("T2:", 1);
    printf("find 36: %s | find 37: %s\n", find(36) ? "True" : "False", find(37) ? "True" : "False");
    del(36);
    printf("after delete 36, find 36: %s\n", find(36) ? "True" : "False");
    return 0;
}
