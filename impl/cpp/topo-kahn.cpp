#include <iostream>
#include <queue>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    istringstream in("AC BC BD CE DF EF EG FH GH");  // 有向無環圖
    vector<vector<int>> adj(26);
    vector<int> indeg(26, 0), order;
    int n = 0;
    string e;
    while (in >> e) {
        adj[e[0] - 'A'].push_back(e[1] - 'A');
        indeg[e[1] - 'A']++;
        n = max(n, max(e[0], e[1]) - 'A' + 1);
    }
    // 反覆取出入度為 0 的點，並把它的出邊刪掉（讓鄰居入度減 1）
    queue<int> q;
    for (int v = 0; v < n; v++) if (indeg[v] == 0) q.push(v);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);
        for (int v : adj[u]) if (--indeg[v] == 0) q.push(v);
    }
    if ((int)order.size() < n) { cout << "graph has a cycle\n"; return 0; }
    cout << "order:";
    for (int v : order) cout << " " << char('A' + v);
    cout << "\n";
}
