#include <limits.h>
#include <stdio.h>

int adjv[26][26], adjw[26][26], deg[26];

int main(void) {
    int E[][3] = {{0, 1, 0}, {0, 2, 1}, {1, 3, 1}, {1, 2, 0}, {2, 4, 1}, {3, 4, 0}, {3, 5, 1}, {4, 6, 0}, {5, 6, 1}, {4, 5, 1}};
    int n = 7;
    for (int i = 0; i < 10; i++) { /* 無向圖，邊權只有 0 或 1 */
        int a = E[i][0], b = E[i][1], w = E[i][2];
        adjv[a][deg[a]] = b; adjw[a][deg[a]++] = w;
        adjv[b][deg[b]] = a; adjw[b][deg[b]++] = w;
    }
    /* 雙端佇列：權重 0 的鄰居放前面、權重 1 的放後面，佇列始終依距離排序，效果等同 Dijkstra 但只需 O(V+E) */
    int dq[256], head = 128, tail = 128, dist[26];
    for (int v = 0; v < n; v++) dist[v] = INT_MAX;
    dist[0] = 0;
    dq[tail++] = 0;
    while (head < tail) {
        int u = dq[head++];
        for (int k = 0; k < deg[u]; k++) {
            int v = adjv[u][k], w = adjw[u][k];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq[--head] = v;
                else dq[tail++] = v;
            }
        }
    }
    printf("dist:");
    for (int v = 0; v < n; v++) printf(" %c=%d", 'A' + v, dist[v]);
    printf("\n");
    return 0;
}
