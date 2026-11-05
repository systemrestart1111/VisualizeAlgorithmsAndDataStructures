#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;

// dp[mask][j] = 從城市 0 出發、恰好走過 mask 中的城市、最後停在 j 的最短距離
int main() {
    vector<pair<double, double>> pts = {{0, 0}, {4, 1}, {6, 4}, {3, 6}, {1, 4}, {5, 7}};
    int n = (int)pts.size();
    const double INF = 1e18;
    const double EPS = 1e-9;  // 浮點數比較加上容許誤差：平手時固定選編號小的城市，不受各平台浮點運算細節影響
    vector<vector<double>> d(n, vector<double>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) d[i][j] = hypot(pts[i].first - pts[j].first, pts[i].second - pts[j].second);
    vector<vector<double>> dp(1 << n, vector<double>(n, INF));
    vector<vector<int>> par(1 << n, vector<int>(n, -1));
    dp[1][0] = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        if (!(mask & 1)) continue;
        for (int j = 0; j < n; j++) {
            if (dp[mask][j] >= INF || !(mask >> j & 1)) continue;
            for (int k = 0; k < n; k++) {
                if (mask >> k & 1) continue;
                int nm = mask | 1 << k;
                if (dp[mask][j] + d[j][k] < dp[nm][k] - EPS) { dp[nm][k] = dp[mask][j] + d[j][k]; par[nm][k] = j; }
            }
        }
    }
    int full = (1 << n) - 1, last = -1;
    double best = INF;
    for (int j = 1; j < n; j++)
        if (dp[full][j] + d[j][0] < best - EPS) { best = dp[full][j] + d[j][0]; last = j; }
    vector<int> tour;
    for (int mask = full; last != -1;) {  // 沿 par 倒推路線
        int p = par[mask][last];
        tour.push_back(last);
        mask ^= 1 << last;
        last = p;
    }
    printf("tour:");
    for (int i = (int)tour.size() - 1; i >= 0; i--) printf(i == (int)tour.size() - 1 ? " %d" : " -> %d", tour[i]);
    printf(" -> 0\nlength = %.4f\n", best);
}
