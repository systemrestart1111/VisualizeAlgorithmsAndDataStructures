#include <iostream>
#include <vector>
using namespace std;

const int INF = 1e9;

// 匈牙利演算法 O(n^3)：以位能 u、v 維持「縮減成本 >= 0」，每次加入一列並沿零成本邊找增廣路徑
vector<int> hungarian(const vector<vector<int>>& a) {
    int n = (int)a.size();
    vector<int> u(n + 1), v(n + 1), p(n + 1), way(n + 1);  // p[j] = 第 j 欄配到的列（1 起算）
    for (int i = 1; i <= n; i++) {
        p[0] = i;
        int j0 = 0;
        vector<int> minv(n + 1, INF);
        vector<bool> used(n + 1, false);
        do {
            used[j0] = true;
            int i0 = p[j0], delta = INF, j1 = 0;
            for (int j = 1; j <= n; j++)
                if (!used[j]) {
                    int cur = a[i0 - 1][j - 1] - u[i0] - v[j];
                    if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
                    if (minv[j] < delta) { delta = minv[j]; j1 = j; }
                }
            for (int j = 0; j <= n; j++) {
                if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
                else minv[j] -= delta;
            }
            j0 = j1;
        } while (p[j0] != 0);
        do {  // 沿 way 回溯翻轉
            int j1 = way[j0];
            p[j0] = p[j1];
            j0 = j1;
        } while (j0);
    }
    vector<int> assign(n);
    for (int j = 1; j <= n; j++) assign[p[j] - 1] = j - 1;
    return assign;
}

int main() {
    vector<vector<int>> cost = {{9, 2, 7, 8}, {6, 4, 3, 7}, {5, 8, 1, 8}, {7, 6, 9, 4}};
    vector<int> assign = hungarian(cost);
    int total = 0;
    for (int i = 0; i < (int)assign.size(); i++) {
        cout << "row " << i << " -> col " << assign[i] << " (cost " << cost[i][assign[i]] << ")\n";
        total += cost[i][assign[i]];
    }
    cout << "total cost = " << total << "\n";
}
