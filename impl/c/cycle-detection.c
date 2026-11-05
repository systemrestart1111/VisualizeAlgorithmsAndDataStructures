#include <stdio.h>

int adj[26][26], deg[26], color[26], parent[26], n;

/* 三色 DFS：遇到灰色（仍在遞迴堆疊上）的點就是一條回邊，代表有環 */
int dfs(int u) {
    color[u] = 1;
    for (int k = 0; k < deg[u]; k++) {
        int v = adj[u][k];
        if (color[v] == 1) {
            int path[26], len = 0;
            for (int x = u; x != v; x = parent[x]) path[len++] = x;
            printf("cycle: %c", 'A' + v);
            for (int i = len - 1; i >= 0; i--) printf(" -> %c", 'A' + path[i]);
            printf(" -> %c\n", 'A' + v);
            return 1;
        }
        if (color[v] == 0) {
            parent[v] = u;
            if (dfs(v)) return 1;
        }
    }
    color[u] = 2;
    return 0;
}

int main(void) {
    const char *E = "AB BC CD DB AE EF"; /* 有向圖 */
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
        if (a + 1 > n) n = a + 1;
        if (b + 1 > n) n = b + 1;
    }
    for (int s = 0; s < n; s++)
        if (color[s] == 0 && dfs(s)) return 0;
    printf("no cycle\n");
    return 0;
}
