#include <climits>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

vector<int> stones = {4, 1, 2, 3, 5, 2};
vector<vector<int>> cut;

string show(int i, int j) {
    if (i == j) return to_string(stones[i]);
    return "(" + show(i, cut[i][j]) + "+" + show(cut[i][j] + 1, j) + ")";
}

// 石子合併：每次合併相鄰兩堆，成本為兩堆重量和
// dp[i][j] = 把第 i..j 堆合成一堆的最小成本 = min(dp[i][k] + dp[k+1][j]) + sum(i..j)
int main() {
    int n = (int)stones.size();
    vector<int> pre(n + 1, 0);
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + stones[i];
    vector<vector<int>> dp(n, vector<int>(n, 0));
    cut.assign(n, vector<int>(n, 0));
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = INT_MAX;
            for (int k = i; k < j; k++)
                if (dp[i][k] + dp[k + 1][j] < dp[i][j]) { dp[i][j] = dp[i][k] + dp[k + 1][j]; cut[i][j] = k; }
            dp[i][j] += pre[j + 1] - pre[i];
        }
    cout << "min cost = " << dp[0][n - 1] << "\nmerge order: " << show(0, n - 1) << "\n";
}
