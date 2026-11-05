#include <stdio.h>

#define N 8
static int p[N], sz[N], hist[64][2], top;

static int find(int x) { while (p[x] != x) x = p[x]; return x; }   /* 不做路徑壓縮 */
/* 依大小合併；每次合併推入紀錄 */
static int unite(int x, int y) {
    int rx = find(x), ry = find(y), t;
    if (rx == ry) return 0;
    if (sz[rx] > sz[ry]) { t = rx; rx = ry; ry = t; }
    p[rx] = ry;
    sz[ry] += sz[rx];
    hist[top][0] = rx; hist[top][1] = ry; top++;
    return 1;
}
static void rollback(int snap) {
    while (top > snap) { top--; int rx = hist[top][0], ry = hist[top][1]; p[rx] = rx; sz[ry] -= sz[rx]; }
}
static void show(const char *label) {
    printf("%s", label);
    for (int i = 0; i < N; i++) printf(" %d", p[i]);
    printf(" | sizes:");
    for (int i = 0; i < N; i++) printf(" %d", sz[i]);
    printf("\n");
}

int main(void) {
    for (int i = 0; i < N; i++) { p[i] = i; sz[i] = 1; }
    unite(0, 1); unite(2, 3);
    int s = top;
    unite(1, 3); unite(4, 5); unite(5, 0);
    show("parents:");
    printf("same(4, 2): %s\n", find(4) == find(2) ? "True" : "False");
    rollback(s);
    show("after rollback:");
    printf("same(4, 2): %s | same(0, 1): %s\n", find(4) == find(2) ? "True" : "False", find(0) == find(1) ? "True" : "False");
    return 0;
}
