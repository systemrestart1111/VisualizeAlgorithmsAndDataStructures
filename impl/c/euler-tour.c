#include <stdio.h>

int child[16][16], nch[16], tour[64], len, tin[16], tout[16];

/* 進入節點時記錄一次，每從一個子節點返回再記錄一次；子樹 u 對應 tour[tin[u]..tout[u]] */
void dfs(int u) {
    tin[u] = len;
    tour[len++] = u;
    for (int k = 0; k < nch[u]; k++) {
        dfs(child[u][k]);
        tour[len++] = u;
    }
    tout[u] = len - 1;
}

int main(void) {
    int e[][2] = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {5, 7}, {6, 8}};
    for (int i = 0; i < 7; i++) child[e[i][0]][nch[e[i][0]]++] = e[i][1];
    dfs(1);
    printf("tour:");
    for (int i = 0; i < len; i++) printf(" %d", tour[i]);
    printf("\n");
    for (int u = 1; u <= 8; u++) printf("node %d: tin = %d, tout = %d\n", u, tin[u], tout[u]);
    return 0;
}
