#include <limits.h>
#include <stdio.h>

int adjv[26][26], adjw[26][26], deg[26], indeg[26];

int main(void) {
    int E[][3] = {{0, 1, 5}, {0, 2, 3}, {1, 2, 2}, {1, 3, 6}, {2, 3, 7}, {2, 4, 4}, {2, 5, 2}, {3, 4, -1}, {3, 5, 1}, {4, 5, -2}};
    int n = 6;
    for (int i = 0; i < 10; i++) {
        int a = E[i][0];
        adjv[a][deg[a]] = E[i][1];
        adjw[a][deg[a]++] = E[i][2];
        indeg[E[i][1]]++;
    }
    /* 先求拓撲順序；依此順序鬆弛，處理到某點時它的所有前驅都已確定，因此負權也沒問題 */
    int q[26], head = 0, tail = 0, dist[26];
    for (int v = 0; v < n; v++) if (indeg[v] == 0) q[tail++] = v;
    while (head < tail) {
        int u = q[head++];
        for (int k = 0; k < deg[u]; k++) if (--indeg[adjv[u][k]] == 0) q[tail++] = adjv[u][k];
    }
    for (int v = 0; v < n; v++) dist[v] = INT_MAX;
    dist[0] = 0;
    for (int i = 0; i < n; i++) {
        int u = q[i];
        if (dist[u] == INT_MAX) continue;
        for (int k = 0; k < deg[u]; k++)
            if (dist[u] + adjw[u][k] < dist[adjv[u][k]]) dist[adjv[u][k]] = dist[u] + adjw[u][k];
    }
    printf("topological order:");
    for (int i = 0; i < n; i++) printf(" %c", 'A' + q[i]);
    printf("\ndist:");
    for (int v = 0; v < n; v++) printf(" %c=%d", 'A' + v, dist[v]);
    printf("\n");
    return 0;
}
