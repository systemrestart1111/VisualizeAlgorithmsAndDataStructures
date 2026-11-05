#include <stdio.h>

#define INF 1000000000
#define N 5

int main(void) {
    int E[][3] = {{0, 1, -2}, {0, 2, 4}, {1, 2, 3}, {1, 3, 2}, {1, 4, 6}, {2, 4, -1}, {3, 0, 1}, {3, 4, 5}, {4, 3, 2}};
    int m = 9, h[N] = {0}, w2[N][N];
    /* 1. 加一個虛擬點 q 連到所有點（權重 0），用 Bellman-Ford 求位能 h */
    for (int it = 0; it < N; it++)
        for (int i = 0; i < m; i++)
            if (h[E[i][0]] + E[i][2] < h[E[i][1]]) h[E[i][1]] = h[E[i][0]] + E[i][2];
    for (int i = 0; i < m; i++) /* 再鬆弛一輪仍能變短：有負環 */
        if (h[E[i][0]] + E[i][2] < h[E[i][1]]) { printf("negative cycle detected\n"); return 0; }
    printf("h:");
    for (int v = 0; v < N; v++) printf(" %d", h[v]);
    printf("\n");
    /* 2. 重新加權 w'(u,v) = w + h[u] - h[v] >= 0，之後每個點各跑一次 Dijkstra */
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) w2[i][j] = INF;
    for (int i = 0; i < m; i++) w2[E[i][0]][E[i][1]] = E[i][2] + h[E[i][0]] - h[E[i][1]];
    printf("   ");
    for (int j = 0; j < N; j++) printf("%4c", 'A' + j);
    printf("\n");
    for (int s = 0; s < N; s++) {
        int dist[N], done[N] = {0};
        for (int v = 0; v < N; v++) dist[v] = INF;
        dist[s] = 0;
        for (int it = 0; it < N; it++) {
            int u = -1;
            for (int v = 0; v < N; v++)
                if (!done[v] && dist[v] < INF && (u < 0 || dist[v] < dist[u])) u = v;
            if (u < 0) break;
            done[u] = 1;
            for (int v = 0; v < N; v++)
                if (w2[u][v] < INF && dist[u] + w2[u][v] < dist[v]) dist[v] = dist[u] + w2[u][v];
        }
        /* 3. 還原真實距離 d(u,v) = d'(u,v) - h[u] + h[v] */
        printf("%3c", 'A' + s);
        for (int t = 0; t < N; t++) {
            if (dist[t] >= INF) printf("%4s", "inf");
            else printf("%4d", dist[t] - h[s] + h[t]);
        }
        printf("\n");
    }
    return 0;
}
