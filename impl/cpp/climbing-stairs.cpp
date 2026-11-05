#include <iostream>
#include <vector>
using namespace std;

// dp[i] = 爬到第 i 階的方法數 = Σ dp[i - s]（s 為每次可爬的階數）
vector<long long> climb(int n, const vector<int>& steps) {
    vector<long long> dp(n + 1, 0);
    dp[0] = 1;
    for (int i = 1; i <= n; i++)
        for (int s : steps)
            if (i >= s) dp[i] += dp[i - s];
    return dp;
}

int main() {
    vector<long long> dp = climb(8, {1, 2});
    cout << "ways(8) = " << dp[8] << "\ndp:";
    for (long long x : dp) cout << " " << x;
    cout << "\n";
}
