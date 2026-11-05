#include <stdio.h>
#include <string.h>

#define N 13
static int adj[N][N], deg[N], removed[N], cpar[N], level[N], pr[N], sz[N];

static int strless(int a, int b) { char x[8], y[8]; sprintf(x, "%d", a); sprintf(y, "%d", b); return strcmp(x, y) < 0; }
static int component(int s, int *order) {
    int n = 1, seen[N] = {0};
    order[0] = s; seen[s] = 1;
    for (int i = 0; i < n; i++) for (int k = 0; k < deg[order[i]]; k++) { int v = adj[order[i]][k]; if (!removed[v] && !seen[v]) { seen[v] = 1; order[n++] = v; } }
    return n;
}
/* 找出塊的重心（刪除後最大塊 ≤ 一半），移除後對每一塊遞迴 */
static void decompose(int start, int par, int lv) {
    int order[N], n = component(start, order), c = start;
    for (int i = 0; i < n; i++) pr[order[i]] = -1;
    pr[start] = 0;
    for (int i = 0; i < n; i++) for (int k = 0; k < deg[order[i]]; k++) { int v = adj[order[i]][k]; if (!removed[v] && pr[v] == -1) pr[v] = order[i]; }
    for (int i = n - 1; i >= 0; i--) { int u = order[i]; sz[u] = 1; for (int k = 0; k < deg[u]; k++) { int v = adj[u][k]; if (!removed[v] && pr[v] == u) sz[u] += sz[v]; } }
    for (int i = 0; i < n; i++) {
        int u = order[i], big = n - sz[u];
        for (int k = 0; k < deg[u]; k++) { int v = adj[u][k]; if (!removed[v] && pr[v] == u && sz[v] > big) big = sz[v]; }
        if (2 * big <= n) { c = u; break; }
    }
    removed[c] = 1; cpar[c] = par; level[c] = lv;
    for (int k = 0; k < deg[c]; k++) if (!removed[adj[c][k]]) decompose(adj[c][k], c, lv + 1);
}

int main(void) {
    int E[11][2] = {{1, 2}, {2, 3}, {3, 4}, {4, 5}, {5, 6}, {6, 7}, {4, 8}, {8, 9}, {9, 10}, {2, 11}, {6, 12}}, depth = 0;
    for (int e = 0; e < 11; e++) { adj[E[e][0]][deg[E[e][0]]++] = E[e][1]; adj[E[e][1]][deg[E[e][1]]++] = E[e][0]; }
    /* 與網頁相同：鄰居依字串排序 */
    for (int u = 1; u < N; u++)
        for (int i = 1; i < deg[u]; i++) for (int j = i; j > 0 && strless(adj[u][j], adj[u][j - 1]); j--) { int t = adj[u][j]; adj[u][j] = adj[u][j - 1]; adj[u][j - 1] = t; }
    decompose(1, 0, 0);
    for (int v = 1; v < N; v++) {
        if (cpar[v]) printf("node %2d: level %d, centroid parent %d\n", v, level[v], cpar[v]);
        else printf("node %2d: level %d, centroid parent -\n", v, level[v]);
        if (level[v] + 1 > depth) depth = level[v] + 1;
    }
    printf("depth: %d\n", depth);
    return 0;
}
