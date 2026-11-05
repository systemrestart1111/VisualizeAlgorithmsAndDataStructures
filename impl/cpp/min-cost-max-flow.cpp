#include <algorithm>
#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

const string NAMES = "SABCT";
const int N = 5, INF = 1e9;
int cap[N][N], cost[N][N], dist[N], parent[N], S = 0, T = 4;

// 在殘餘網路上找費用最小的 S→T 路徑（有負費用的反向邊，所以用 SPFA / Bellman-Ford）
bool spfa() {
    vector<bool> inq(N);
    fill(dist, dist + N, INF);
    fill(parent, parent + N, -1);
    dist[S] = 0;
    queue<int> q;
    q.push(S);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        inq[u] = false;
        for (int v = 0; v < N; v++)
            if (cap[u][v] > 0 && dist[u] + cost[u][v] < dist[v]) {
                dist[v] = dist[u] + cost[u][v];
                parent[v] = u;
                if (!inq[v]) { inq[v] = true; q.push(v); }
            }
    }
    return dist[T] < INF;
}

int main() {
    struct E { char a, b; int c, w; };
    vector<E> edges = {{'S', 'A', 4, 1}, {'S', 'B', 2, 2}, {'A', 'B', 2, 1}, {'A', 'C', 2, 3}, {'B', 'C', 5, 1}, {'A', 'T', 1, 6}, {'C', 'T', 4, 2}, {'B', 'T', 1, 5}};
    for (auto& e : edges) {
        int u = (int)NAMES.find(e.a), v = (int)NAMES.find(e.b);
        cap[u][v] = e.c; cost[u][v] = e.w; cost[v][u] = -e.w;  // 反向邊費用為負，退流時可以把費用扣回來
    }
    int flow = 0, total = 0;
    while (spfa()) {
        vector<int> path;
        for (int v = T; v != S; v = parent[v]) path.push_back(v);
        path.push_back(S);
        reverse(path.begin(), path.end());
        int b = INF;
        for (size_t i = 0; i + 1 < path.size(); i++) b = min(b, cap[path[i]][path[i + 1]]);
        for (size_t i = 0; i + 1 < path.size(); i++) { cap[path[i]][path[i + 1]] -= b; cap[path[i + 1]][path[i]] += b; }
        flow += b;
        total += b * dist[T];
        for (size_t i = 0; i < path.size(); i++) cout << (i ? " -> " : "") << NAMES[path[i]];
        cout << " flow " << b << " x cost " << dist[T] << "\n";
    }
    cout << "max flow = " << flow << " min cost = " << total << "\n";
}
