#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

vector<vector<int>> adj(26), radj(26);
vector<bool> seen(26);
vector<int> order;

void dfs1(int u) {  // 第一次 DFS：記錄完成順序
    seen[u] = true;
    for (int v : adj[u]) if (!seen[v]) dfs1(v);
    order.push_back(u);
}

void dfs2(int u, vector<int>& comp) {  // 第二次 DFS：在反向圖上，依完成時間由晚到早出發
    seen[u] = true;
    comp.push_back(u);
    for (int v : radj[u]) if (!seen[v]) dfs2(v, comp);
}

int main() {
    istringstream in("AB BC CA BD DE EF FD GF GH HI IG IJ");
    string e;
    int n = 0;
    while (in >> e) {
        adj[e[0] - 'A'].push_back(e[1] - 'A');
        radj[e[1] - 'A'].push_back(e[0] - 'A');  // 反向圖
        n = max(n, max(e[0], e[1]) - 'A' + 1);
    }
    for (int v = 0; v < n; v++) if (!seen[v]) dfs1(v);
    fill(seen.begin(), seen.end(), false);
    for (int i = (int)order.size() - 1; i >= 0; i--) {
        if (seen[order[i]]) continue;
        vector<int> comp;
        dfs2(order[i], comp);
        sort(comp.begin(), comp.end());
        cout << "SCC:";
        for (int v : comp) cout << " " << char('A' + v);
        cout << "\n";
    }
}
