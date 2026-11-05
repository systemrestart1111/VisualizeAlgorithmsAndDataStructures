#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> p = {1, 5, 8, 9, 10, 17, 17, 20};
    int n = p.size();
    vector<int> dp(n + 1), cut(n + 1);
    // dp[i] = max(p[k] + dp[i − k])，cut[i] 記錄最佳的第一段長度
    for (int i = 1; i <= n; i++) {
        dp[i] = -1;
        for (int k = 1; k <= i; k++) if (p[k - 1] + dp[i - k] > dp[i]) { dp[i] = p[k - 1] + dp[i - k]; cut[i] = k; }
    }
    cout << "dp:";
    for (int x : dp) cout << " " << x;
    cout << "\nbest: " << dp[n] << " cut into ";
    for (int m = n, first = 1; m; m -= cut[m], first = 0) cout << (first ? "" : " + ") << cut[m];
    int brute = 0;
    for (int mask = 0; mask < 1 << (n - 1); mask++) {
        int s = 0, len = 1;
        for (int i = 0; i < n - 1; i++) { if (mask >> i & 1) { s += p[len - 1]; len = 1; } else len++; }
        brute = max(brute, s + p[len - 1]);
    }
    cout << "\nbrute force: " << brute << "\n";
}
