#include <iostream>
#include <queue>
#include <vector>
using namespace std;

vector<vector<int>> adj(16);
vector<int> parent(16), dist(16);

// 回傳距離最遠的點（距離相同時取最先被發現的點），並填好 parent / dist
int bfs(int src) {
    fill(dist.begin(), dist.end(), -1);
    dist[src] = 0;
    parent[src] = -1;
    queue<int> q;
    q.push(src);
    int far = src;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        if (dist[u] > dist[far]) far = u;
        for (int v : adj[u])
            if (dist[v] < 0) { dist[v] = dist[u] + 1; parent[v] = u; q.push(v); }
    }
    return far;
}

int main() {
    vector<pair<int, int>> edges = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {5, 9}, {6, 10}, {9, 11}, {7, 12}};
    for (auto& e : edges) { adj[e.first].push_back(e.second); adj[e.second].push_back(e.first); }
    int u = bfs(1);  // 第一次 BFS：任意點出發的最遠點 u 一定是直徑的端點
    int v = bfs(u);  // 第二次 BFS：從 u 出發的最遠點 v
    cout << "diameter = " << dist[v] << "\npath:";
    for (; v != -1; v = parent[v]) cout << " " << v;
    cout << "\n";
}
