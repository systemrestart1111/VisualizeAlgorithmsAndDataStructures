#include <iostream>
#include <queue>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

vector<vector<int>> adj(26);
vector<int> color;
int n = 0;

// BFS 二著色：相鄰點必須不同色；若遇到同色的鄰居就不是二分圖
bool bipartite() {
    color.assign(n, -1);
    for (int s = 0; s < n; s++) {
        if (color[s] >= 0) continue;
        color[s] = 0;
        queue<int> q;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : adj[u]) {
                if (color[v] < 0) { color[v] = 1 - color[u]; q.push(v); }
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}

int main() {
    istringstream in("AB AD BC CD CF EF EB GH DG");
    string e;
    while (in >> e) {
        int a = e[0] - 'A', b = e[1] - 'A';
        adj[a].push_back(b);
        adj[b].push_back(a);
        n = max(n, max(a, b) + 1);
    }
    if (!bipartite()) { cout << "not bipartite\n"; return 0; }
    for (int c = 0; c < 2; c++) {
        cout << "set " << c << ":";
        for (int v = 0; v < n; v++) if (color[v] == c) cout << " " << char('A' + v);
        cout << "\n";
    }
}
