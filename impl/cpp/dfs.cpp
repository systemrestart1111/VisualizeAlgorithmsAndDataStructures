#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

vector<vector<int>> adj(26);
vector<bool> seen(26);

// 沿著一條路一直走到底，無路可走才回溯（遞迴本身就是堆疊）
void dfs(int u) {
    seen[u] = true;
    cout << " " << char('A' + u);
    for (int v : adj[u])
        if (!seen[v]) dfs(v);
}

int main() {
    istringstream in("AB AC BD BE CF EF DG EG FH GH");
    string e;
    while (in >> e) {
        adj[e[0] - 'A'].push_back(e[1] - 'A');
        adj[e[1] - 'A'].push_back(e[0] - 'A');
    }
    cout << "order:";
    dfs(0);
    cout << "\n";
}
