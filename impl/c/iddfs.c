#include <stdio.h>
#include <string.h>

/* 節點 A..K 以 0..10 表示；鄰居依名稱排序 */
#define N 11
static int adj[N][N], deg[N], path[N], plen, visits;

static void add(char a, char b) { adj[a - 'A'][deg[a - 'A']++] = b - 'A'; adj[b - 'A'][deg[b - 'A']++] = a - 'A'; }
static int on_path(int v) { for (int i = 0; i < plen; i++) if (path[i] == v) return 1; return 0; }
static int dls(int u, int t, int lim) {
    visits++;
    path[plen++] = u;
    if (u == t) return 1;
    if (lim > 0)
        for (int i = 0; i < deg[u]; i++) if (!on_path(adj[u][i]) && dls(adj[u][i], t, lim - 1)) return 1;
    plen--;
    return 0;
}

int main(void) {
    const char *E[11] = {"AB", "AC", "BD", "BE", "CF", "CG", "DH", "EI", "FJ", "GK", "EF"};
    for (int i = 0; i < 11; i++) add(E[i][0], E[i][1]);
    for (int u = 0; u < N; u++)
        for (int i = 1; i < deg[u]; i++) for (int j = i; j > 0 && adj[u][j - 1] > adj[u][j]; j--) { int x = adj[u][j]; adj[u][j] = adj[u][j - 1]; adj[u][j - 1] = x; }
    const char ts[3] = {'J', 'H', 'A'};
    for (int k = 0; k < 3; k++) {
        int counts[N + 1], nc = 0, total = 0, found = 0;
        /* 深度上限 0、1、2…逐一做深度受限 DFS */
        for (int limit = 0; limit <= N && !found; limit++) {
            visits = 0; plen = 0;
            found = dls(0, ts[k] - 'A', limit);
            counts[nc++] = visits;
            total += visits;
        }
        printf("A -> %c: depth %d, path ", ts[k], plen - 1);
        for (int i = 0; i < plen; i++) printf(i ? " -> %c" : "%c", 'A' + path[i]);
        printf(", visits per limit [");
        for (int i = 0; i < nc; i++) printf(i ? ", %d" : "%d", counts[i]);
        printf("], total %d\n", total);
    }
    return 0;
}
