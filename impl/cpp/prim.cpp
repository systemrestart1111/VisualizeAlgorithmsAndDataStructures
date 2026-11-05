#include <iostream>
#include <vector>
using namespace std;

int main() {
    const int N = 7, INF = 1e6;
    int edges[][3] = {{0, 1, 7}, {0, 3, 5}, {1, 2, 8}, {1, 3, 9}, {1, 4, 7}, {2, 4, 5}, {3, 4, 15}, {3, 5, 6}, {4, 5, 8}, {4, 6, 9}, {5, 6, 11}};
    vector<vector<int>> w(N, vector<int>(N, 0));
    for (auto& e : edges) w[e[0]][e[1]] = w[e[1]][e[0]] = e[2];
    // key[v] = 把 v 接到目前這棵樹的最便宜邊；每次加入 key 最小的點，再更新鄰居的 key
    vector<int> key(N, INF), parent(N, -1);
    vector<bool> inTree(N);
    key[0] = 0;
    int total = 0;
    for (int it = 0; it < N; it++) {
        int u = -1;
        for (int v = 0; v < N; v++)
            if (!inTree[v] && (u < 0 || key[v] < key[u])) u = v;
        inTree[u] = true;
        if (parent[u] >= 0) {
            total += key[u];
            cout << "take " << char('A' + parent[u]) << "-" << char('A' + u) << " (" << key[u] << ")\n";
        }
        for (int v = 0; v < N; v++)
            if (!inTree[v] && w[u][v] && w[u][v] < key[v]) { key[v] = w[u][v]; parent[v] = u; }
    }
    cout << "total weight = " << total << "\n";
}
