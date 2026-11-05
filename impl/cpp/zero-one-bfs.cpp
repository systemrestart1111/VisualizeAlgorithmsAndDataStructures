#include <climits>
#include <deque>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    const int n = 7;
    int edges[][3] = {{0, 1, 0}, {0, 2, 1}, {1, 3, 1}, {1, 2, 0}, {2, 4, 1}, {3, 4, 0}, {3, 5, 1}, {4, 6, 0}, {5, 6, 1}, {4, 5, 1}};
    vector<vector<pair<int, int>>> adj(n);
    for (auto& e : edges) { adj[e[0]].push_back({e[1], e[2]}); adj[e[1]].push_back({e[0], e[2]}); }  // 無向圖，邊權只有 0 或 1
    // 雙端佇列：權重 0 的鄰居放前面、權重 1 的放後面，佇列始終依距離排序，效果等同 Dijkstra 但只需 O(V+E)
    vector<int> dist(n, INT_MAX);
    deque<int> dq;
    dist[0] = 0;
    dq.push_back(0);
    while (!dq.empty()) {
        int u = dq.front();
        dq.pop_front();
        for (auto& e : adj[u])
            if (dist[u] + e.second < dist[e.first]) {
                dist[e.first] = dist[u] + e.second;
                if (e.second == 0) dq.push_front(e.first);
                else dq.push_back(e.first);
            }
    }
    cout << "dist:";
    for (int v = 0; v < n; v++) cout << " " << char('A' + v) << "=" << dist[v];
    cout << "\n";
}
