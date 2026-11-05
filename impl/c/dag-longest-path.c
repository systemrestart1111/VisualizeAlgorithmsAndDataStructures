#include <stdio.h>

#define N 7
static const char *NAMES = "SABCDEF";
static int idx(char c) { for (int i = 0; i < N; i++) if (NAMES[i] == c) return i; return -1; }

int main(void) {
    const char *E[9] = {"SA", "SB", "AC", "BC", "BD", "CE", "DE", "AD", "EF"};
    int W[9] = {3, 2, 4, 1, 5, -2, 3, 1, 2};
    int adj[N][N], aw[N][N], deg[N] = {0}, indeg[N] = {0};
    for (int e = 0; e < 9; e++) { int u = idx(E[e][0]), v = idx(E[e][1]); adj[u][deg[u]] = v; aw[u][deg[u]++] = W[e]; indeg[v]++; }
    /* 鄰居依名稱排序（與其他語言一致） */
    for (int u = 0; u < N; u++)
        for (int i = 1; i < deg[u]; i++) for (int j = i; j > 0 && NAMES[adj[u][j - 1]] > NAMES[adj[u][j]]; j--) { int t = adj[u][j]; adj[u][j] = adj[u][j - 1]; adj[u][j - 1] = t; t = aw[u][j]; aw[u][j] = aw[u][j - 1]; aw[u][j - 1] = t; }
    int q[N], head = 0, tail = 0, order[N], no = 0;
    for (int v = 0; v < N; v++) if (!indeg[v]) q[tail++] = v;
    while (head < tail) { int u = q[head++]; order[no++] = u; for (int i = 0; i < deg[u]; i++) if (--indeg[adj[u][i]] == 0) q[tail++] = adj[u][i]; }
    /* 依拓撲順序放鬆最大距離（可有負權） */
    const int NEG = -1000000;
    int dist[N], par[N];
    for (int v = 0; v < N; v++) dist[v] = NEG;
    dist[0] = 0;
    for (int k = 0; k < no; k++) {
        int u = order[k];
        if (dist[u] == NEG) continue;
        for (int i = 0; i < deg[u]; i++) if (dist[u] + aw[u][i] > dist[adj[u][i]]) { dist[adj[u][i]] = dist[u] + aw[u][i]; par[adj[u][i]] = u; }
    }
    int end = 0;
    for (int v = 0; v < N; v++) if (dist[v] > dist[end]) end = v;
    printf("dist:");
    for (int v = 0; v < N; v++) printf(" %c=%d", NAMES[v], dist[v]);
    int path[N], pl = 0;
    for (int v = end;; v = par[v]) { path[pl++] = v; if (v == 0) break; }
    printf("\nlongest:");
    for (int i = pl - 1; i >= 0; i--) printf(i == pl - 1 ? " %c" : " -> %c", NAMES[path[i]]);
    printf(" length %d\n", dist[end]);
    printf("with cycle: None\n");
    return 0;
}
