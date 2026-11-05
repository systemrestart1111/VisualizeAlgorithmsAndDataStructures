#include <climits>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    const int n = 6;
    int edges[][3] = {{0, 1, 5}, {0, 2, 3}, {1, 2, 2}, {1, 3, 6}, {2, 3, 7}, {2, 4, 4}, {2, 5, 2}, {3, 4, -1}, {3, 5, 1}, {4, 5, -2}};
    vector<vector<pair<int, int>>> adj(n);
    vector<int> indeg(n, 0), topo;
    for (auto& e : edges) { adj[e[0]].push_back({e[1], e[2]}); indeg[e[1]]++; }
    // 先求拓撲順序；依此順序鬆弛，處理到某點時它的所有前驅都已確定，因此負權也沒問題
    queue<int> q;
    for (int v = 0; v < n; v++) if (indeg[v] == 0) q.push(v);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        topo.push_back(u);
        for (auto& e : adj[u]) if (--indeg[e.first] == 0) q.push(e.first);
    }
    vector<int> dist(n, INT_MAX);
    dist[0] = 0;
    for (int u : topo) {
        if (dist[u] == INT_MAX) continue;
        for (auto& e : adj[u]) dist[e.first] = min(dist[e.first], dist[u] + e.second);
    }
    cout << "topological order:";
    for (int v : topo) cout << " " << char('A' + v);
    cout << "\ndist:";
    for (int v = 0; v < n; v++) cout << " " << char('A' + v) << "=" << dist[v];
    cout << "\n";
}
