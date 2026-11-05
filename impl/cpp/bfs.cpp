#include <iostream>
#include <queue>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

// 佇列先進先出：先處理完距離 d 的所有點，才輪到距離 d+1
int main() {
    istringstream in("AB AC BD BE CF EF DG EG FH GH");  // 無向圖，每兩個字母是一條邊
    vector<vector<int>> adj(26);
    int n = 0;
    string e;
    while (in >> e) {
        int a = e[0] - 'A', b = e[1] - 'A';
        adj[a].push_back(b);
        adj[b].push_back(a);
        n = max(n, max(a, b) + 1);
    }
    vector<int> dist(n, -1);
    queue<int> q;
    dist[0] = 0;
    q.push(0);
    cout << "order:";
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << " " << char('A' + u);
        for (int v : adj[u])
            if (dist[v] < 0) { dist[v] = dist[u] + 1; q.push(v); }
    }
    cout << "\ndist:";
    for (int v = 0; v < n; v++) cout << " " << char('A' + v) << "=" << dist[v];
    cout << "\n";
}
