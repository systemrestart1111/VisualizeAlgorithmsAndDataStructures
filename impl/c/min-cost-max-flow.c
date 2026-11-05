#include <stdio.h>
#include <string.h>

#define N 5
#define INF 1000000000
const char *NAMES = "SABCT";
int cap[N][N], cost[N][N], dist[N], parent[N], S = 0, T = 4;

int idx(char c) { return (int)(strchr(NAMES, c) - NAMES); }

/* 在殘餘網路上找費用最小的 S→T 路徑（有負費用的反向邊，所以用 SPFA / Bellman-Ford） */
int spfa(void) {
    int q[1024], head = 0, tail = 0, inq[N] = {0};
    for (int v = 0; v < N; v++) { dist[v] = INF; parent[v] = -1; }
    dist[S] = 0;
    q[tail++] = S;
    while (head < tail) {
        int u = q[head++];
        inq[u] = 0;
        for (int v = 0; v < N; v++)
            if (cap[u][v] > 0 && dist[u] + cost[u][v] < dist[v]) {
                dist[v] = dist[u] + cost[u][v];
                parent[v] = u;
                if (!inq[v]) { inq[v] = 1; q[tail++] = v; }
            }
    }
    return dist[T] < INF;
}

int main(void) {
    const char *E[] = {"SA 4 1", "SB 2 2", "AB 2 1", "AC 2 3", "BC 5 1", "AT 1 6", "CT 4 2", "BT 1 5"}; /* 容量 單位費用 */
    for (int i = 0; i < 8; i++) {
        int u = idx(E[i][0]), v = idx(E[i][1]), c, w;
        sscanf(E[i] + 3, "%d %d", &c, &w);
        cap[u][v] = c; cost[u][v] = w; cost[v][u] = -w; /* 反向邊費用為負，退流時可以把費用扣回來 */
    }
    int flow = 0, total = 0;
    while (spfa()) {
        int path[N], len = 0, b = INF;
        for (int v = T; v != S; v = parent[v]) path[len++] = v;
        path[len++] = S;
        for (int i = len - 1; i > 0; i--) if (cap[path[i]][path[i - 1]] < b) b = cap[path[i]][path[i - 1]];
        for (int i = len - 1; i > 0; i--) { cap[path[i]][path[i - 1]] -= b; cap[path[i - 1]][path[i]] += b; }
        flow += b;
        total += b * dist[T];
        for (int i = len - 1; i >= 0; i--) printf(i == len - 1 ? "%c" : " -> %c", NAMES[path[i]]);
        printf(" flow %d x cost %d\n", b, dist[T]);
    }
    printf("max flow = %d min cost = %d\n", flow, total);
    return 0;
}
