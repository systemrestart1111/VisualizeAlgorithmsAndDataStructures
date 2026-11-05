#include <algorithm>
#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

const string NAMES = "SACBDT";
const int N = 6;
int cap[N][N], S = 0, T = 5;

// 用 BFS 找「邊數最少」的增廣路徑，保證總共只需 O(VE) 次增廣
bool bfs(vector<int>& parent) {
    parent.assign(N, -1);
    parent[S] = S;
    queue<int> q;
    q.push(S);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v = 0; v < N; v++)
            if (parent[v] < 0 && cap[u][v] > 0) { parent[v] = u; q.push(v); }
    }
    return parent[T] >= 0;
}

int main() {
    vector<pair<string, int>> edges = {{"SA", 10}, {"SC", 10}, {"AB", 4}, {"AC", 2}, {"AD", 8}, {"CD", 9}, {"DB", 6}, {"BT", 10}, {"DT", 10}};
    for (auto& e : edges) cap[NAMES.find(e.first[0])][NAMES.find(e.first[1])] += e.second;
    int flow = 0;
    vector<int> parent;
    while (bfs(parent)) {
        vector<int> path;
        for (int v = T; v != S; v = parent[v]) path.push_back(v);
        path.push_back(S);
        reverse(path.begin(), path.end());
        int b = 1 << 30;
        for (size_t i = 0; i + 1 < path.size(); i++) b = min(b, cap[path[i]][path[i + 1]]);
        for (size_t i = 0; i + 1 < path.size(); i++) { cap[path[i]][path[i + 1]] -= b; cap[path[i + 1]][path[i]] += b; }
        flow += b;
        for (size_t i = 0; i < path.size(); i++) cout << (i ? " -> " : "") << NAMES[path[i]];
        cout << " (+" << b << ")\n";
    }
    cout << "max flow = " << flow << "\n";
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
