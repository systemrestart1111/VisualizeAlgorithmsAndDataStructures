#include <limits.h>
#include <stdio.h>

/* 對所有邊做 V-1 輪鬆弛；第 V 輪若還能變短，代表有負環 */
int main(void) {
    int E[][3] = {{0, 1, 6}, {0, 2, 7}, {1, 3, 5}, {1, 2, 8}, {1, 4, -4}, {2, 3, -3}, {2, 4, 9}, {3, 1, -2}, {4, 3, 7}, {4, 0, 2}}; /* 有向圖，可含負權 */
    int m = 10, n = 5, dist[5];
    for (int v = 0; v < n; v++) dist[v] = INT_MAX;
    dist[0] = 0;
    for (int it = 0; it < n - 1; it++) {
        int changed = 0;
        for (int i = 0; i < m; i++) {
            int a = E[i][0], b = E[i][1], w = E[i][2];
            if (dist[a] != INT_MAX && dist[a] + w < dist[b]) { dist[b] = dist[a] + w; changed = 1; }
        }
        if (!changed) break;
    }
    int neg = 0;
    for (int i = 0; i < m; i++)
        if (dist[E[i][0]] != INT_MAX && dist[E[i][0]] + E[i][2] < dist[E[i][1]]) neg = 1;
    printf("dist:");
    for (int v = 0; v < n; v++) printf(" %c=%d", 'A' + v, dist[v]);
    printf("\nnegative cycle: %s\n", neg ? "True" : "False");
    return 0;
}
