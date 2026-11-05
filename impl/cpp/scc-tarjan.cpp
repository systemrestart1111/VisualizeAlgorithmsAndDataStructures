#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

vector<vector<int>> adj(26);
vector<int> idx(26, -1), low(26), st;
vector<bool> onStack(26);
int counter = 0;

// low[u] = u 經由子樹與至多一條回邊能到達的最小編號；low == 編號時，u 是一個強連通分量的根
void dfs(int u) {
    idx[u] = low[u] = counter++;
    st.push_back(u);
    onStack[u] = true;
    for (int v : adj[u]) {
        if (idx[v] < 0) { dfs(v); low[u] = min(low[u], low[v]); }
        else if (onStack[v]) low[u] = min(low[u], idx[v]);
    }
    if (low[u] == idx[u]) {
        vector<int> comp;
        int v;
        do { v = st.back(); st.pop_back(); onStack[v] = false; comp.push_back(v); } while (v != u);
        sort(comp.begin(), comp.end());
        cout << "SCC:";
        for (int w : comp) cout << " " << char('A' + w);
        cout << "\n";
    }
}

int main() {
    istringstream in("AB BC CA BD DE EF FD GF GH HI IG IJ");  // 有向圖
    string e;
    int n = 0;
    while (in >> e) {
        adj[e[0] - 'A'].push_back(e[1] - 'A');
        n = max(n, max(e[0], e[1]) - 'A' + 1);
    }
    for (int v = 0; v < n; v++) if (idx[v] < 0) dfs(v);
}
