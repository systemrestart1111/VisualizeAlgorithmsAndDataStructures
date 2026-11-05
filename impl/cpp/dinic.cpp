#include <algorithm>
#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

const string NAMES = "SACBDT";
const int N = 6;
int cap[N][N], level[N], it[N], S = 0, T = 5;

// 建立層次圖：level[v] = S 到 v 的最少邊數
bool bfsLevel() {
    fill(level, level + N, -1);
    level[S] = 0;
    queue<int> q;
    q.push(S);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v = 0; v < N; v++)
            if (level[v] < 0 && cap[u][v] > 0) { level[v] = level[u] + 1; q.push(v); }
    }
    return level[T] >= 0;
}

// 只沿 level 加一的邊前進（阻塞流）；it[u] 記錄 u 下一條要試的邊，走不通的邊不再重試
int dfs(int u, int pushed) {
    if (u == T) return pushed;
    for (; it[u] < N; it[u]++) {
        int v = it[u];
        if (cap[u][v] > 0 && level[v] == level[u] + 1) {
            int d = dfs(v, min(pushed, cap[u][v]));
            if (d) { cap[u][v] -= d; cap[v][u] += d; return d; }
        }
    }
    return 0;
}

int main() {
    vector<pair<string, int>> edges = {{"SA", 10}, {"SC", 10}, {"AB", 4}, {"AC", 2}, {"AD", 8}, {"CD", 9}, {"DB", 6}, {"BT", 10}, {"DT", 10}};
    for (auto& e : edges) cap[NAMES.find(e.first[0])][NAMES.find(e.first[1])] += e.second;
    int flow = 0, phase = 0;
    while (bfsLevel()) {
        int got = 0, d;
        fill(it, it + N, 0);
        while ((d = dfs(S, 1 << 30))) got += d;
        flow += got;
        cout << "phase " << ++phase << ": levels";
        for (int v = 0; v < N; v++) if (level[v] >= 0) cout << " " << NAMES[v] << "=" << level[v];
        cout << " blocking flow +" << got << "\n";
    }
    cout << "max flow = " << flow << "\n";
    vector<bool> reach(N);
    vector<int> st = {S};
    reach[S] = true;
    while (!st.empty()) {
        int u = st.back();
        st.pop_back();
        for (int v = 0; v < N; v++) if (cap[u][v] > 0 && !reach[v]) { reach[v] = true; st.push_back(v); }
    }
    cout << "min cut S-side:";
    for (int v = 0; v < N; v++) if (reach[v]) cout << " " << NAMES[v];
    cout << "\n";
}
