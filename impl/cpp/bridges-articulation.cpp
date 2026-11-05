#include <algorithm>
#include <iostream>
#include <set>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

vector<vector<int>> adj(26);
vector<int> tin(26, -1), low(26);
vector<string> bridges;
set<int> cut;
int timer = 0;

// low[v] > tin[u]：v 的子樹回不到 u 以上，(u, v) 是橋；low[v] >= tin[u]：u 是割點（根需有兩個以上子樹）
void dfs(int u, int parent) {
    tin[u] = low[u] = timer++;
    int children = 0;
    for (int v : adj[u]) {
        if (v == parent) continue;
        if (tin[v] >= 0) low[u] = min(low[u], tin[v]);
        else {
            dfs(v, u);
            low[u] = min(low[u], low[v]);
            children++;
            if (low[v] > tin[u]) bridges.push_back(string(1, 'A' + min(u, v)) + "-" + char('A' + max(u, v)));
            if (parent >= 0 && low[v] >= tin[u]) cut.insert(u);
        }
    }
    if (parent < 0 && children > 1) cut.insert(u);
}

int main() {
    istringstream in("AB BC CA CD DE EF FD FG GH BI");
    string e;
    while (in >> e) {
        adj[e[0] - 'A'].push_back(e[1] - 'A');
        adj[e[1] - 'A'].push_back(e[0] - 'A');
    }
    dfs(0, -1);
    sort(bridges.begin(), bridges.end());
    cout << "bridges:";
    for (auto& b : bridges) cout << " " << b;
    cout << "\narticulation points:";
    for (int v : cut) cout << " " << char('A' + v);
    cout << "\n";
}
