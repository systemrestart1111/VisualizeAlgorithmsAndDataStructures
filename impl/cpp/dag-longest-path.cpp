#include <algorithm>
#include <iostream>
#include <map>
#include <queue>
#include <string>
#include <tuple>
#include <vector>
using namespace std;

// 依拓撲順序放鬆最大距離（可有負權）；有環時回傳 false
bool longestPath(const string &nodes, const vector<tuple<char, char, int>> &edges, char s, map<char, int> &dist, string &path) {
    map<char, vector<pair<char, int>>> adj;
    map<char, int> indeg;
    for (char v : nodes) { adj[v]; indeg[v] = 0; }
    for (auto &e : edges) { adj[get<0>(e)].push_back({get<1>(e), get<2>(e)}); indeg[get<1>(e)]++; }
    for (auto &kv : adj) sort(kv.second.begin(), kv.second.end());
    queue<char> q;
    for (char v : nodes) if (!indeg[v]) q.push(v);
    string order;
    while (!q.empty()) { char u = q.front(); q.pop(); order += u; for (auto &p : adj[u]) if (--indeg[p.first] == 0) q.push(p.first); }
    if (order.size() != nodes.size()) return false;
    const int NEG = -1000000;
    map<char, char> par;
    for (char v : nodes) dist[v] = NEG;
    dist[s] = 0;
    for (char u : order) {
        if (dist[u] == NEG) continue;
        for (auto &p : adj[u]) if (dist[u] + p.second > dist[p.first]) { dist[p.first] = dist[u] + p.second; par[p.first] = u; }
    }
    char end = s;
    for (char v : nodes) if (dist[v] > dist[end]) end = v;
    path = string(1, end);
    while (path[0] != s) path = string(1, par[path[0]]) + path;
    return true;
}

int main() {
    string nodes = "SABCDEF", path;
    map<char, int> dist;
    longestPath(nodes, {{'S', 'A', 3}, {'S', 'B', 2}, {'A', 'C', 4}, {'B', 'C', 1}, {'B', 'D', 5}, {'C', 'E', -2}, {'D', 'E', 3}, {'A', 'D', 1}, {'E', 'F', 2}}, 'S', dist, path);
    cout << "dist:";
    for (char v : nodes) cout << " " << v << "=" << dist[v];
    cout << "\nlongest:";
    for (size_t i = 0; i < path.size(); i++) cout << (i ? " -> " : " ") << path[i];
    cout << " length " << dist[path.back()] << "\n";
    map<char, int> d2;
    string p2;
    cout << "with cycle: " << (longestPath("XY", {{'X', 'Y', 1}, {'Y', 'X', 1}}, 'X', d2, p2) ? "?" : "None") << "\n";
}
