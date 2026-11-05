#include <algorithm>
#include <cstdio>
#include <map>
#include <string>
#include <vector>
using namespace std;

map<int, vector<int>> adj;
map<int, int> removed, cpar, level;

vector<int> component(int s) {
    vector<int> order = {s};
    map<int, int> seen{{s, 1}};
    for (size_t i = 0; i < order.size(); i++) for (int v : adj[order[i]]) if (!removed[v] && !seen[v]) { seen[v] = 1; order.push_back(v); }
    return order;
}
// 找出塊的重心（刪除後最大塊 ≤ 一半），移除後對每一塊遞迴
void decompose(int start, int par, int lv) {
    vector<int> order = component(start);
    map<int, int> pr{{start, 0}}, sz;
    for (int u : order) for (int v : adj[u]) if (!removed[v] && !pr.count(v)) pr[v] = u;
    for (int i = order.size() - 1; i >= 0; i--) { int u = order[i]; sz[u] = 1; for (int v : adj[u]) if (!removed[v] && pr[v] == u) sz[u] += sz[v]; }
    int n = order.size(), c = start;
    for (int u : order) {
        int big = n - sz[u];
        for (int v : adj[u]) if (!removed[v] && pr[v] == u) big = max(big, sz[v]);
        if (2 * big <= n) { c = u; break; }
    }
    removed[c] = 1; cpar[c] = par; level[c] = lv;
    for (int v : adj[c]) if (!removed[v]) decompose(v, c, lv + 1);
}

int main() {
    for (auto e : vector<pair<int, int>>{{1, 2}, {2, 3}, {3, 4}, {4, 5}, {5, 6}, {6, 7}, {4, 8}, {8, 9}, {9, 10}, {2, 11}, {6, 12}}) { adj[e.first].push_back(e.second); adj[e.second].push_back(e.first); }
    for (auto &kv : adj) sort(kv.second.begin(), kv.second.end(), [](int a, int b) { return to_string(a) < to_string(b); });  // 鄰居依字串排序
    decompose(1, 0, 0);
    int depth = 0;
    for (auto &kv : adj) {
        int v = kv.first;
        if (cpar[v]) printf("node %2d: level %d, centroid parent %d\n", v, level[v], cpar[v]);
        else printf("node %2d: level %d, centroid parent -\n", v, level[v]);
        depth = max(depth, level[v] + 1);
    }
    printf("depth: %d\n", depth);
}
