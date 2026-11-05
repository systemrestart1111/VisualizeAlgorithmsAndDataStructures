#include <stdio.h>

#define N 10
static int adj[N + 1][N], deg[N + 1];

int main(void) {
    int E[9][2] = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {5, 9}, {7, 10}};
    for (int e = 0; e < 9; e++) { int a = E[e][0], b = E[e][1]; adj[a][deg[a]++] = b; adj[b][deg[b]++] = a; }
    int order[N], par[N + 1] = {0}, no = 1, sz[N + 1], down[N + 1], ans[N + 1];
    order[0] = 1; par[1] = -1;
    for (int i = 0; i < no; i++) { int u = order[i]; for (int k = 0; k < deg[u]; k++) { int v = adj[u][k]; if (!par[v] && v != 1) { par[v] = u; order[no++] = v; } } }
    /* 第一次：由下往上算子樹大小與子樹內距離和 */
    for (int i = no - 1; i >= 0; i--) {
        int u = order[i];
        sz[u] = 1; down[u] = 0;
        for (int k = 0; k < deg[u]; k++) { int v = adj[u][k]; if (par[v] == u) { sz[u] += sz[v]; down[u] += down[v] + sz[v]; } }
    }
    /* 第二次：換根 ans[v] = ans[u] − sz[v] + (n − sz[v]) */
    ans[1] = down[1];
    for (int i = 0; i < no; i++) { int u = order[i]; for (int k = 0; k < deg[u]; k++) { int v = adj[u][k]; if (par[v] == u) ans[v] = ans[u] - sz[v] + (N - sz[v]); } }
    int best = 1;
    printf("sum of distances:");
    for (int v = 1; v <= N; v++) { printf(" %d:%d", v, ans[v]); if (ans[v] < ans[best]) best = v; }
    printf("\nbest center: %d with %d\n", best, ans[best]);
    return 0;
}
