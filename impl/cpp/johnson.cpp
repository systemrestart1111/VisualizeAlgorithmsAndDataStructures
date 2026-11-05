#include <cstdio>
#include <vector>
using namespace std;

const int INF = 1e9;

int main() {
    const int n = 5;
    int E[][3] = {{0, 1, -2}, {0, 2, 4}, {1, 2, 3}, {1, 3, 2}, {1, 4, 6}, {2, 4, -1}, {3, 0, 1}, {3, 4, 5}, {4, 3, 2}};
    vector<int> h(n, 0);
    // 1. 加一個虛擬點 q 連到所有點（權重 0），用 Bellman-Ford 求位能 h
    for (int it = 0; it < n; it++)
        for (auto& e : E)
            if (h[e[0]] + e[2] < h[e[1]]) h[e[1]] = h[e[0]] + e[2];
    for (auto& e : E)  // 再鬆弛一輪仍能變短：有負環
        if (h[e[0]] + e[2] < h[e[1]]) { printf("negative cycle detected\n"); return 0; }
    printf("h:");
    for (int x : h) printf(" %d", x);
    printf("\n");
    // 2. 重新加權 w'(u,v) = w + h[u] - h[v] >= 0，之後每個點各跑一次 Dijkstra
    vector<vector<int>> w2(n, vector<int>(n, INF));
    for (auto& e : E) w2[e[0]][e[1]] = e[2] + h[e[0]] - h[e[1]];
    printf("   ");
    for (int j = 0; j < n; j++) printf("%4c", 'A' + j);
    printf("\n");
    for (int s = 0; s < n; s++) {
        vector<int> dist(n, INF);
        vector<bool> done(n);
        dist[s] = 0;
        for (int it = 0; it < n; it++) {
            int u = -1;
            for (int v = 0; v < n; v++)
                if (!done[v] && dist[v] < INF && (u < 0 || dist[v] < dist[u])) u = v;
            if (u < 0) break;
            done[u] = true;
            for (int v = 0; v < n; v++)
                if (w2[u][v] < INF && dist[u] + w2[u][v] < dist[v]) dist[v] = dist[u] + w2[u][v];
        }
        // 3. 還原真實距離 d(u,v) = d'(u,v) - h[u] + h[v]
        printf("%3c", 'A' + s);
        for (int t = 0; t < n; t++) {
            if (dist[t] >= INF) printf("%4s", "inf");
            else printf("%4d", dist[t] - h[s] + h[t]);
        }
        printf("\n");
    }
}
