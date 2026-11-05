#include <iostream>
#include <map>
#include <vector>
using namespace std;

map<int, vector<int>> children;
map<int, int> parent, ancestor, visited;
vector<pair<int, int>> Q = {{8, 9}, {4, 8}, {6, 10}, {9, 6}, {3, 3}};
map<int, int> ans;

int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
// 子樹 v 完成後併入 u 的集合；u 結束時回答所有另一端已拜訪的查詢
void dfs(int u) {
    ancestor[u] = u;
    for (int v : children[u]) {
        dfs(v);
        parent[find(v)] = find(u);
        ancestor[find(u)] = u;
    }
    visited[u] = 1;
    for (size_t i = 0; i < Q.size(); i++) {
        int w = Q[i].first == u ? Q[i].second : Q[i].second == u ? Q[i].first : -1;
        if (w >= 0 && visited[w] && !ans.count(i)) ans[i] = ancestor[find(w)];
    }
}

int main() {
    for (auto e : vector<pair<int, int>>{{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {3, 7}, {5, 8}, {5, 9}, {7, 10}}) {
        children[e.first].push_back(e.second);
        parent[e.first] = e.first; parent[e.second] = e.second;
    }
    dfs(1);
    for (size_t i = 0; i < Q.size(); i++) cout << "lca(" << Q[i].first << ", " << Q[i].second << ") = " << ans[i] << "\n";
}
