#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> coins = {1, 3, 4};
    int A = 10, INF = 1e6;
    // 最少硬幣數：dp[a] = min(dp[a - c] + 1)；記下每個金額最後用的硬幣以便還原
    vector<int> dp(A + 1, INF), last(A + 1, 0);
    dp[0] = 0;
    for (int a = 1; a <= A; a++)
        for (int c : coins)
            if (a >= c && dp[a - c] + 1 < dp[a]) { dp[a] = dp[a - c] + 1; last[a] = c; }
    cout << "min coins = " << dp[A] << " ->";
    for (int a = A; a > 0; a -= last[a]) cout << " " << last[a];
    cout << "\n";
    // 組合數：外層跑硬幣、內層跑金額，每種組合只會以固定的硬幣順序被數到一次
    vector<long long> ways(A + 1, 0);
    ways[0] = 1;
    for (int c : coins)
        for (int a = c; a <= A; a++) ways[a] += ways[a - c];
    cout << "ways = " << ways[A] << "\n";
}
