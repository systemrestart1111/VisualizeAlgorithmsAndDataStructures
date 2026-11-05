#include <algorithm>
#include <array>
#include <iostream>
#include <vector>
using namespace std;

// 二進位拆分：數量 c 拆成 1, 2, 4, …, 餘數 這幾包，任意 0..c 件都能由它們組合出來，之後當成 0/1 背包
int main() {
    vector<array<int, 3>> items = {{{2, 3, 3}}, {{3, 4, 2}}, {{4, 6, 4}}};  // (重量, 價值, 數量)
    int W = 12;
    vector<pair<int, int>> pieces;
    for (auto& it : items)
        for (int c = it[2], k = 1; c > 0; k *= 2) {
            int take = min(k, c);
            pieces.push_back({it[0] * take, it[1] * take});
            c -= take;
        }
    cout << "pieces:";
    for (auto& p : pieces) cout << " (" << p.first << "," << p.second << ")";
    cout << "\n";
    vector<int> dp(W + 1, 0);
    for (auto& p : pieces)
        for (int w = W; w >= p.first; w--) dp[w] = max(dp[w], dp[w - p.first] + p.second);  // 容量由大到小
    cout << "best value = " << dp[W] << "\n";
}
