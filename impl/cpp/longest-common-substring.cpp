#include <iostream>
#include <string>
#include <vector>
using namespace std;

// 相同字元沿對角線延伸，不同就歸零；表中最大值即答案（必須連續）。L 為對照用的最長共同子序列
void run(const string &a, const string &b) {
    int n = a.size(), m = b.size(), best = 0, end = 0;
    vector<vector<int>> dp(n + 1, vector<int>(m + 1)), L = dp;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++) {
            if (a[i - 1] == b[j - 1]) { dp[i][j] = dp[i - 1][j - 1] + 1; if (dp[i][j] > best) { best = dp[i][j]; end = i; } }
            L[i][j] = a[i - 1] == b[j - 1] ? L[i - 1][j - 1] + 1 : max(L[i - 1][j], L[i][j - 1]);
        }
    cout << a << " / " << b << ": substring '" << a.substr(end - best, best) << "' (" << best << "), subsequence length " << L[n][m] << "\n";
}

int main() {
    run("ABABCABA", "BABCAACB");
    run("ABCDXYZ", "XYZABCD");
    run("ABC", "DEF");
}
