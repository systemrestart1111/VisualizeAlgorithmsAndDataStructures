#include <iostream>
#include <vector>
using namespace std;

int main() {
    const int n = 10;
    vector<vector<int>> adj(n + 1);
    for (auto e : vector<pair<int, int>>{{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {5, 9}, {7, 10}}) { adj[e.first].push_back(e.second); adj[e.second].push_back(e.first); }
    vector<int> order = {1}, par(n + 1, 0), sz(n + 1), down(n + 1), ans(n + 1);
    par[1] = -1;
    for (size_t i = 0; i < order.size(); i++) for (int v : adj[order[i]]) if (!par[v] && v != 1) { par[v] = order[i]; order.push_back(v); }
    // 第一次：由下往上算子樹大小與子樹內距離和
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        sz[u] = 1; down[u] = 0;
        for (int v : adj[u]) if (par[v] == u) { sz[u] += sz[v]; down[u] += down[v] + sz[v]; }
    }
    // 第二次：換根 ans[v] = ans[u] − sz[v] + (n − sz[v])
    ans[1] = down[1];
    for (int u : order) for (int v : adj[u]) if (par[v] == u) ans[v] = ans[u] - sz[v] + (n - sz[v]);
    int best = 1;
    cout << "sum of distances:";
    for (int v = 1; v <= n; v++) { cout << " " << v << ":" << ans[v]; if (ans[v] < ans[best]) best = v; }
    cout << "\nbest center: " << best << " with " << ans[best] << "\n";
}
