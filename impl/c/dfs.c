#include <stdio.h>

int adj[26][26], deg[26], seen[26];

/* 沿著一條路一直走到底，無路可走才回溯（遞迴本身就是堆疊） */
void dfs(int u) {
    seen[u] = 1;
    printf(" %c", 'A' + u);
    for (int k = 0; k < deg[u]; k++)
        if (!seen[adj[u][k]]) dfs(adj[u][k]);
}

int main(void) {
    const char *E = "AB AC BD BE CF EF DG EG FH GH";
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
        adj[b][deg[b]++] = a;
    }
    printf("order:");
    dfs(0);
    printf("\n");
    return 0;
}
