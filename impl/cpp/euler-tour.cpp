#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> children(9);
vector<int> tour, tin(9), tout(9);

// 進入節點時記錄一次，每從一個子節點返回再記錄一次；子樹 u 對應 tour[tin[u]..tout[u]]
void dfs(int u) {
    tin[u] = (int)tour.size();
    tour.push_back(u);
    for (int v : children[u]) {
        dfs(v);
        tour.push_back(u);
    }
    tout[u] = (int)tour.size() - 1;
}

int main() {
    vector<pair<int, int>> edges = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {5, 7}, {6, 8}};
    for (auto& e : edges) children[e.first].push_back(e.second);
    dfs(1);
    cout << "tour:";
    for (int u : tour) cout << " " << u;
    cout << "\n";
    for (int u = 1; u <= 8; u++) cout << "node " << u << ": tin = " << tin[u] << ", tout = " << tout[u] << "\n";
}
