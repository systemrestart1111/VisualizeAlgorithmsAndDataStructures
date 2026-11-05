#include <iostream>
#include <vector>
using namespace std;

// dp[mask] = mask 這些工作已分配給前 popcount(mask) 位工人時的最小成本
int main() {
    vector<vector<int>> cost = {{9, 2, 7, 8}, {6, 4, 3, 7}, {5, 8, 1, 8}, {7, 6, 9, 4}};  // cost[工人][工作]
    int n = (int)cost.size(), INF = 1e9;
    vector<int> dp(1 << n, INF), choice(1 << n, -1);
    dp[0] = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        if (dp[mask] == INF) continue;
        int k = __builtin_popcount(mask);  // 下一位要分配的工人
        if (k == n) continue;
        for (int j = 0; j < n; j++)
            if (!(mask >> j & 1)) {
                int nm = mask | 1 << j;
                if (dp[mask] + cost[k][j] < dp[nm]) { dp[nm] = dp[mask] + cost[k][j]; choice[nm] = j; }
            }
    }
    int full = (1 << n) - 1, mask = full;
    vector<int> assign(n);
    for (int k = n - 1; k >= 0; k--) { assign[k] = choice[mask]; mask ^= 1 << choice[mask]; }  // 倒推每位工人分到的工作
    for (int k = 0; k < n; k++) cout << "worker " << k << " -> job " << assign[k] << " (cost " << cost[k][assign[k]] << ")\n";
    cout << "min total cost = " << dp[full] << "\n";
}
