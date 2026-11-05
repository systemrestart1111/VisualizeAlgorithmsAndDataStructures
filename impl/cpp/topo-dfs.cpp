#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

vector<vector<int>> adj(26);
vector<bool> seen(26);
vector<int> post;

// 一個點在它所有後繼都處理完後才加入 post；post 反過來就是拓撲順序
void dfs(int u) {
    seen[u] = true;
    for (int v : adj[u])
        if (!seen[v]) dfs(v);
    post.push_back(u);
}

int main() {
    istringstream in("AC BC BD CE DF EF EG FH GH");
    string e;
    int n = 0;
    while (in >> e) {
        adj[e[0] - 'A'].push_back(e[1] - 'A');
        n = max(n, max(e[0], e[1]) - 'A' + 1);
    }
    for (int v = 0; v < n; v++) if (!seen[v]) dfs(v);
    cout << "post-order:";
    for (int v : post) cout << " " << char('A' + v);
    cout << "\ntopological:";
    for (int i = (int)post.size() - 1; i >= 0; i--) cout << " " << char('A' + post[i]);
    cout << "\n";
}
