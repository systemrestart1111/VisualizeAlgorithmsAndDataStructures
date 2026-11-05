#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> adj = {{}, {1, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}};  // 左側 L1..L5 可以配對的右側點
vector<int> matchR(6, 0);
vector<bool> seen;

// 替 u 找右側點：若對方空著就直接配；若已被配走，嘗試讓原本的左側點改配別人（增廣路徑）
bool tryKuhn(int u) {
    for (int v : adj[u]) {
        if (seen[v]) continue;
        seen[v] = true;
        if (!matchR[v] || tryKuhn(matchR[v])) { matchR[v] = u; return true; }
    }
    return false;
}

int main() {
    int size = 0;
    for (int u = 1; u <= 5; u++) {
        seen.assign(6, false);
        size += tryKuhn(u);
    }
    cout << "matching size = " << size << "\n";
    for (int u = 1; u <= 5; u++)
        for (int v = 1; v <= 5; v++) if (matchR[v] == u) cout << "L" << u << " - R" << v << "\n";
}
