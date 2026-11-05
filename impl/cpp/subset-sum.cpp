#include <iostream>
#include <vector>
using namespace std;

// dp[i][s] = 前 i 個數能否湊出 s = dp[i-1][s] or dp[i-1][s - a[i]]
int main() {
    vector<int> a = {3, 34, 4, 12, 5, 2};
    int n = (int)a.size(), T = 9;
    vector<vector<bool>> dp(n + 1, vector<bool>(T + 1, false));
    dp[0][0] = true;
    for (int i = 1; i <= n; i++)
        for (int s = 0; s <= T; s++)
            dp[i][s] = dp[i - 1][s] || (s >= a[i - 1] && dp[i - 1][s - a[i - 1]]);
    cout << "possible = " << (dp[n][T] ? "True" : "False") << "\n";
    if (dp[n][T]) {
        vector<int> pick;
        for (int i = n, s = T; i >= 1; i--)  // 若不用第 i 個就湊不出來，代表一定要用它
            if (!dp[i - 1][s]) { pick.push_back(a[i - 1]); s -= a[i - 1]; }
        cout << "subset:";
        for (int k = (int)pick.size() - 1; k >= 0; k--) cout << " " << pick[k];
        cout << "\n";
    }
}
