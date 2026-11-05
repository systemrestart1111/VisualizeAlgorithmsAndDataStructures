#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// dp[i][w] = 只考慮前 i 件、容量 w 時的最大價值；第 i 件「不拿」或「拿」（每件只能拿一次）
int main() {
    vector<pair<int, int>> items = {{1, 1}, {3, 4}, {4, 5}, {5, 7}};  // (重量, 價值)
    int n = (int)items.size(), W = 7;
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i - 1][w];
            if (w >= items[i - 1].first) dp[i][w] = max(dp[i][w], dp[i - 1][w - items[i - 1].first] + items[i - 1].second);
        }
    vector<int> chosen;
    for (int i = n, w = W; i >= 1; i--)  // 從表格倒推：值有變化就代表拿了第 i 件
        if (dp[i][w] != dp[i - 1][w]) { chosen.push_back(i); w -= items[i - 1].first; }
    reverse(chosen.begin(), chosen.end());
    cout << "best value = " << dp[n][W] << "\nitems (1-based):";
    for (int i : chosen) cout << " " << i;
    cout << "\nlast row:";
    for (int x : dp[n]) cout << " " << x;
    cout << "\n";
}
