#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 一維 dp[w] 由小到大更新：dp[w - wi] 可能已經包含第 i 種，因此同一種能重複拿
int main() {
    vector<pair<int, int>> items = {{2, 3}, {3, 5}, {4, 7}, {5, 8}};  // (重量, 價值)，每種可拿無限次
    int W = 11;
    vector<int> dp(W + 1, 0);
    for (int w = 1; w <= W; w++)
        for (auto& it : items)
            if (w >= it.first) dp[w] = max(dp[w], dp[w - it.first] + it.second);
    cout << "best value = " << dp[W] << "\ndp:";
    for (int x : dp) cout << " " << x;
    cout << "\n";
}
