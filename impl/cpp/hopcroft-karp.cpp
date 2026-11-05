#include <iostream>
#include <queue>
#include <vector>
using namespace std;

const int NL = 5, INF = 1e6;
vector<vector<int>> adj = {{}, {1, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}};  // 左側 L1..L5 可以配對的右側點
vector<int> matchL(NL + 1, 0), matchR(NL + 1, 0), dist(NL + 1);

// 從所有未配對的左側點同時 BFS，分層；回傳是否存在增廣路徑
bool bfs() {
    queue<int> q;
    for (int u = 1; u <= NL; u++) {
        dist[u] = matchL[u] == 0 ? 0 : INF;
        if (matchL[u] == 0) q.push(u);
    }
    bool found = false;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u]) {
            int w = matchR[v];
            if (w == 0) found = true;
            else if (dist[w] == INF) { dist[w] = dist[u] + 1; q.push(w); }
        }
    }
    return found;
}

// 沿分層找一條最短增廣路徑並翻轉
bool dfs(int u) {
    for (int v : adj[u]) {
        int w = matchR[v];
        if (w == 0 || (dist[w] == dist[u] + 1 && dfs(w))) { matchL[u] = v; matchR[v] = u; return true; }
    }
    dist[u] = INF;
    return false;
}

// 每一階段找出一組互不相交的最短增廣路徑一起翻轉，總共只需 O(√V) 階段
int main() {
    int size = 0, phases = 0;
    while (bfs()) {
        phases++;
        for (int u = 1; u <= NL; u++)
            if (matchL[u] == 0 && dfs(u)) size++;
    }
    cout << "phases = " << phases << " matching size = " << size << "\n";
    for (int u = 1; u <= NL; u++) cout << "L" << u << " - R" << matchL[u] << "\n";
}
