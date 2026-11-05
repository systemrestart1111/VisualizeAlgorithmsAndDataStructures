#include <limits.h>
#include <stdio.h>

#define N 6
int w[N][N]; /* 鄰接矩陣，0 表示沒有邊 */

/* 每次取出目前距離最小且尚未確定的點，確定它的距離並鬆弛所有出邊（邊權須非負）
   這裡用 O(V^2) 的陣列版本；邊多時改用二元堆積可降到 O((V+E) log V) */
void dijkstra(int src, int *dist, int *parent) {
    int done[N] = {0};
    for (int v = 0; v < N; v++) { dist[v] = INT_MAX; parent[v] = -1; }
    dist[src] = 0;
    for (int it = 0; it < N; it++) {
        int u = -1;
        for (int v = 0; v < N; v++)
            if (!done[v] && dist[v] != INT_MAX && (u < 0 || dist[v] < dist[u])) u = v;
        if (u < 0) break;
        done[u] = 1;
        for (int v = 0; v < N; v++)
            if (w[u][v] && dist[u] + w[u][v] < dist[v]) { dist[v] = dist[u] + w[u][v]; parent[v] = u; }
    }
}

int main(void) {
    const char *E[] = {"AB4", "AC2", "BC5", "BD10", "CE3", "ED4", "DF11", "EF8", "CF12", "BE6"};
    for (int i = 0; i < 10; i++) {
        int a = E[i][0] - 'A', b = E[i][1] - 'A', c;
        sscanf(E[i] + 2, "%d", &c);
        w[a][b] = w[b][a] = c; /* 無向圖 */
    }
    int dist[N], parent[N];
    dijkstra(0, dist, parent);
    for (int v = 0; v < N; v++) {
        int path[N], len = 0;
        for (int x = v; x >= 0; x = parent[x]) path[len++] = x;
        printf("%c: %2d  path ", 'A' + v, dist[v]);
        for (int i = len - 1; i >= 0; i--) printf(i ? "%c -> " : "%c\n", 'A' + path[i]);
    }
    return 0;
}
