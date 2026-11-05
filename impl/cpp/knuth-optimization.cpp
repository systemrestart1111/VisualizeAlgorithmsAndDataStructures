#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// opt[i][j−1] ≤ opt[i][j] ≤ opt[i+1][j]：只在這個範圍內枚舉切點
void run(const vector<int> &a) {
    int n = a.size(), e1 = 0, e2 = 0;
    vector<int> S(n + 1);
    for (int i = 0; i < n; i++) S[i + 1] = S[i] + a[i];
    vector<vector<int>> dp(n, vector<int>(n)), opt(n, vector<int>(n)), nd = dp;
    for (int i = 0; i < n; i++) opt[i][i] = i;
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            dp[i][j] = 1 << 30;
            for (int m = opt[i][j - 1]; m <= min(opt[i + 1][j], j - 1); m++) { e1++; int t = dp[i][m] + dp[m + 1][j] + S[j + 1] - S[i]; if (t < dp[i][j]) { dp[i][j] = t; opt[i][j] = m; } }
            nd[i][j] = 1 << 30;
            for (int m = i; m < j; m++) { e2++; nd[i][j] = min(nd[i][j], nd[i][m] + nd[m + 1][j] + S[j + 1] - S[i]); }
        }
    cout << "[";
    for (int i = 0; i < n; i++) cout << (i ? ", " : "") << a[i];
    cout << "]: knuth " << dp[0][n - 1] << " (" << e1 << " evals), naive " << nd[0][n - 1] << " (" << e2 << " evals)\n";
}

int main() {
    run({4, 1, 7, 3, 9, 2, 6, 5});
    run({1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12});
}
