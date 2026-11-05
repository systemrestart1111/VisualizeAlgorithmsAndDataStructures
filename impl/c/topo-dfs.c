#include <stdio.h>

int adj[26][26], deg[26], seen[26], post[26], np, n;

/* 一個點在它所有後繼都處理完後才加入 post；post 反過來就是拓撲順序 */
void dfs(int u) {
    seen[u] = 1;
    for (int k = 0; k < deg[u]; k++)
        if (!seen[adj[u][k]]) dfs(adj[u][k]);
    post[np++] = u;
}

int main(void) {
    const char *E = "AC BC BD CE DF EF EG FH GH";
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
        if (a + 1 > n) n = a + 1;
        if (b + 1 > n) n = b + 1;
    }
    for (int v = 0; v < n; v++) if (!seen[v]) dfs(v);
    printf("post-order:");
    for (int i = 0; i < np; i++) printf(" %c", 'A' + post[i]);
    printf("\ntopological:");
    for (int i = np - 1; i >= 0; i--) printf(" %c", 'A' + post[i]);
    printf("\n");
    return 0;
}
