#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

const string NAMES = "SACBDT";
const int N = 6;
int cap[N][N], S = 0, T = 5;

// 在殘餘網路上用 DFS 找一條 S→T 的增廣路徑
bool dfs(int u, vector<bool>& seen, vector<int>& path) {
    if (u == T) return true;
    seen[u] = true;
    for (int v = 0; v < N; v++)
        if (!seen[v] && cap[u][v] > 0) {
            path.push_back(v);
            if (dfs(v, seen, path)) return true;
            path.pop_back();
        }
    return false;
}

int main() {
    vector<pair<string, int>> edges = {{"SA", 10}, {"SC", 10}, {"AB", 4}, {"AC", 2}, {"AD", 8}, {"CD", 9}, {"DB", 6}, {"BT", 10}, {"DT", 10}};
    for (auto& e : edges) cap[NAMES.find(e.first[0])][NAMES.find(e.first[1])] += e.second;  // 殘餘容量
    int flow = 0;
    for (;;) {
        vector<bool> seen(N);
        vector<int> path = {S};
        if (!dfs(S, seen, path)) break;
        int b = 1 << 30;
        for (size_t i = 0; i + 1 < path.size(); i++) b = min(b, cap[path[i]][path[i + 1]]);  // 瓶頸
        for (size_t i = 0; i + 1 < path.size(); i++) {
            cap[path[i]][path[i + 1]] -= b;
            cap[path[i + 1]][path[i]] += b;  // 反向邊讓之後可以「退回」流量
        }
        flow += b;
        for (size_t i = 0; i < path.size(); i++) cout << (i ? " -> " : "") << NAMES[path[i]];
        cout << " (+" << b << ")\n";
    }
    cout << "max flow = " << flow << "\n";
    // 最後在殘餘網路上從 S 能到達的點就是最小割的 S 側
    vector<bool> reach(N);
    vector<int> st = {S};
    reach[S] = true;
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        for (int v = 0; v < N; v++) if (cap[u][v] > 0 && !reach[v]) { reach[v] = true; st.push_back(v); }
    }
    cout << "min cut S-side:";
    for (int v = 0; v < N; v++) if (reach[v]) cout << " " << NAMES[v];
    cout << "\n";
}
