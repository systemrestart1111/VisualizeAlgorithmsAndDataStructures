#include <stdio.h>

int adj[16][16], deg[16], parent[16], dist[16];

/* 回傳距離最遠的點（距離相同時取最先被發現的點），並填好 parent / dist */
int bfs(int src) {
    int q[16], head = 0, tail = 0, far = src;
    for (int i = 0; i < 16; i++) dist[i] = -1;
    dist[src] = 0; parent[src] = -1; q[tail++] = src;
    while (head < tail) {
        int u = q[head++];
        if (dist[u] > dist[far]) far = u;
        for (int k = 0; k < deg[u]; k++) {
            int v = adj[u][k];
            if (dist[v] < 0) { dist[v] = dist[u] + 1; parent[v] = u; q[tail++] = v; }
        }
    }
    return far;
}

int main(void) {
    int e[][2] = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {5, 9}, {6, 10}, {9, 11}, {7, 12}};
    for (int i = 0; i < 11; i++) {
        adj[e[i][0]][deg[e[i][0]]++] = e[i][1];
        adj[e[i][1]][deg[e[i][1]]++] = e[i][0];
    }
    int u = bfs(1);  /* 第一次 BFS：任意點出發的最遠點 u 一定是直徑的端點 */
    int v = bfs(u);  /* 第二次 BFS：從 u 出發的最遠點 v */
    printf("diameter = %d\npath:", dist[v]);
    for (; v != -1; v = parent[v]) printf(" %d", v);
    printf("\n");
    return 0;
}
