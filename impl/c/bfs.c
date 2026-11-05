#include <stdio.h>
#include <string.h>

int adj[26][26], deg[26], n;

/* 佇列先進先出：先處理完距離 d 的所有點，才輪到距離 d+1 */
int main(void) {
    const char *E = "AB AC BD BE CF EF DG EG FH GH"; /* 無向圖，每兩個字母是一條邊 */
    for (const char *p = E; *p; p += p[2] ? 3 : 2) {
        int a = p[0] - 'A', b = p[1] - 'A';
        adj[a][deg[a]++] = b;
        adj[b][deg[b]++] = a;
        if (a + 1 > n) n = a + 1;
        if (b + 1 > n) n = b + 1;
    }
    int dist[26], q[26], head = 0, tail = 0;
    memset(dist, -1, sizeof dist);
    dist[0] = 0;
    q[tail++] = 0;
    printf("order:");
    while (head < tail) {
        int u = q[head++];
        printf(" %c", 'A' + u);
        for (int k = 0; k < deg[u]; k++) {
            int v = adj[u][k];
            if (dist[v] < 0) { dist[v] = dist[u] + 1; q[tail++] = v; }
        }
    }
    printf("\ndist:");
    for (int v = 0; v < n; v++) printf(" %c=%d", 'A' + v, dist[v]);
    printf("\n");
    return 0;
}
