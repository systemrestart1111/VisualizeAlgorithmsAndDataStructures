#include <stdio.h>

int adj[26][26], deg[26], idx[26], low[26], onst[26], st[26], top, counter, n;

/* low[u] = u 經由子樹與至多一條回邊能到達的最小編號；low == 編號時，u 是一個強連通分量的根 */
void dfs(int u) {
    idx[u] = low[u] = counter++;
    st[top++] = u;
    onst[u] = 1;
    for (int k = 0; k < deg[u]; k++) {
        int v = adj[u][k];
        if (idx[v] < 0) { dfs(v); if (low[v] < low[u]) low[u] = low[v]; }
        else if (onst[v] && idx[v] < low[u]) low[u] = idx[v];
    }
    if (low[u] == idx[u]) {
        int in[26] = {0}, v;
        do { v = st[--top]; onst[v] = 0; in[v] = 1; } while (v != u);
        printf("SCC:");
        for (int w = 0; w < n; w++) if (in[w]) printf(" %c", 'A' + w);
        printf("\n");
    }
}

int main(void) {
    const char *E = "AB BC CA BD DE EF FD GF GH HI IG IJ"; /* 有向圖 */
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
        if (a + 1 > n) n = a + 1;
        if (b + 1 > n) n = b + 1;
    }
    for (int v = 0; v < n; v++) idx[v] = -1;
    for (int v = 0; v < n; v++) if (idx[v] < 0) dfs(v);
    return 0;
}
