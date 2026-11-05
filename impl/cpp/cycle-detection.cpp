#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

vector<vector<int>> adj(26);
vector<int> color(26), parent(26);

// 三色 DFS：遇到灰色（仍在遞迴堆疊上）的點就是一條回邊，代表有環
bool dfs(int u) {
    color[u] = 1;
    for (int v : adj[u]) {
        if (color[v] == 1) {
            vector<int> path;
            for (int x = u; x != v; x = parent[x]) path.push_back(x);
            reverse(path.begin(), path.end());
            cout << "cycle: " << char('A' + v);
            for (int x : path) cout << " -> " << char('A' + x);
            cout << " -> " << char('A' + v) << "\n";
            return true;
        }
        if (color[v] == 0) {
            parent[v] = u;
            if (dfs(v)) return true;
        }
    }
    color[u] = 2;
    return false;
}

int main() {
    istringstream in("AB BC CD DB AE EF");  // 有向圖
    string e;
    int n = 0;
    while (in >> e) {
        adj[e[0] - 'A'].push_back(e[1] - 'A');
        n = max(n, max(e[0], e[1]) - 'A' + 1);
    }
    for (int s = 0; s < n; s++)
        if (color[s] == 0 && dfs(s)) return 0;
    cout << "no cycle\n";
}
