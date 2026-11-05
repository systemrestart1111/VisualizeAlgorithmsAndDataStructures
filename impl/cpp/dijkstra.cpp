#include <climits>
#include <cstdio>
#include <functional>
#include <queue>
#include <vector>
using namespace std;

// 每次取出目前距離最小且尚未確定的點，確定它的距離並鬆弛所有出邊（邊權須非負）
int main() {
    const int N = 6;
    vector<vector<pair<int, int>>> adj(N);  // (鄰居, 權重)
    int edges[][3] = {{0, 1, 4}, {0, 2, 2}, {1, 2, 5}, {1, 3, 10}, {2, 4, 3}, {4, 3, 4}, {3, 5, 11}, {4, 5, 8}, {2, 5, 12}, {1, 4, 6}};
    for (auto& e : edges) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }  // 無向圖
    vector<int> dist(N, INT_MAX), parent(N, -1);
    vector<bool> done(N);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    dist[0] = 0;
    pq.push({0, 0});
    while (!pq.empty()) {
        int d = pq.top().first, u = pq.top().second;
        pq.pop();
        if (done[u]) continue;
        done[u] = true;
        for (auto& e : adj[u])
            if (d + e.second < dist[e.first]) {
                dist[e.first] = d + e.second;
                parent[e.first] = u;
                pq.push({dist[e.first], e.first});
            }
    }
    for (int v = 0; v < N; v++) {
        vector<int> path;
        for (int x = v; x >= 0; x = parent[x]) path.push_back(x);
        printf("%c: %2d  path ", 'A' + v, dist[v]);
        for (int i = (int)path.size() - 1; i >= 0; i--) printf(i ? "%c -> " : "%c\n", 'A' + path[i]);
    }
}
