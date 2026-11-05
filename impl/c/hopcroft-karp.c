#include <stdio.h>

#define NL 5
#define INF 1000000
int adj[NL + 1][2] = {{0}, {1, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}}; /* 左側 L1..L5 可以配對的右側點 */
int match_l[NL + 1], match_r[NL + 1], dist[NL + 1];

/* 從所有未配對的左側點同時 BFS，分層；回傳是否存在增廣路徑 */
int bfs(void) {
    int q[NL + 1], head = 0, tail = 0, found = 0;
    for (int u = 1; u <= NL; u++) {
        dist[u] = match_l[u] == 0 ? 0 : INF;
        if (match_l[u] == 0) q[tail++] = u;
    }
    while (head < tail) {
        int u = q[head++];
        for (int k = 0; k < 2; k++) {
            int w = match_r[adj[u][k]];
            if (w == 0) found = 1;
            else if (dist[w] == INF) { dist[w] = dist[u] + 1; q[tail++] = w; }
        }
    }
    return found;
}

/* 沿分層找一條最短增廣路徑並翻轉 */
int dfs(int u) {
    for (int k = 0; k < 2; k++) {
        int v = adj[u][k], w = match_r[v];
        if (w == 0 || (dist[w] == dist[u] + 1 && dfs(w))) { match_l[u] = v; match_r[v] = u; return 1; }
    }
    dist[u] = INF;
    return 0;
}

/* 每一階段找出一組互不相交的最短增廣路徑一起翻轉，總共只需 O(√V) 階段 */
int main(void) {
    int size = 0, phases = 0;
    while (bfs()) {
        phases++;
        for (int u = 1; u <= NL; u++)
            if (match_l[u] == 0 && dfs(u)) size++;
    }
    printf("phases = %d matching size = %d\n", phases, size);
    for (int u = 1; u <= NL; u++) printf("L%d - R%d\n", u, match_l[u]);
    return 0;
}
