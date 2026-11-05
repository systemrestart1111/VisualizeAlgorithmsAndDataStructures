#include <stdio.h>
#include <string.h>

int adj[26][26], deg[26], radj[26][26], rdeg[26], seen[26], order[26], no, n, in_comp[26];

void dfs1(int u) { /* 第一次 DFS：記錄完成順序 */
    seen[u] = 1;
    for (int k = 0; k < deg[u]; k++) if (!seen[adj[u][k]]) dfs1(adj[u][k]);
    order[no++] = u;
}

void dfs2(int u) { /* 第二次 DFS：在反向圖上，依完成時間由晚到早出發 */
    seen[u] = 1;
    in_comp[u] = 1;
    for (int k = 0; k < rdeg[u]; k++) if (!seen[radj[u][k]]) dfs2(radj[u][k]);
}

int main(void) {
    const char *E = "AB BC CA BD DE EF FD GF GH HI IG IJ";
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
        radj[b][rdeg[b]++] = a; /* 反向圖 */
        if (a + 1 > n) n = a + 1;
        if (b + 1 > n) n = b + 1;
    }
    for (int v = 0; v < n; v++) if (!seen[v]) dfs1(v);
    memset(seen, 0, sizeof seen);
    for (int i = no - 1; i >= 0; i--) {
        if (seen[order[i]]) continue;
        memset(in_comp, 0, sizeof in_comp);
        dfs2(order[i]);
        printf("SCC:");
        for (int v = 0; v < n; v++) if (in_comp[v]) printf(" %c", 'A' + v);
        printf("\n");
    }
    return 0;
}
