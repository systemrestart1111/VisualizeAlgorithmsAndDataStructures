#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

// dp[i][j] = a 前 i 字與 b 前 j 字的 LCS 長度；字元相同取左上 +1，否則取上方與左方較大者
int main() {
    string a = "ABCBDAB", b = "BDCABA";
    int m = (int)a.size(), n = (int)b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] + 1 : max(dp[i - 1][j], dp[i][j - 1]);
    string out;
    for (int i = m, j = n; i && j;) {  // 由右下角倒推還原一組 LCS
        if (a[i - 1] == b[j - 1]) { out += a[i - 1]; i--; j--; }
        else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
        else j--;
    }
    reverse(out.begin(), out.end());
    cout << "LCS length = " << dp[m][n] << "\none LCS = " << out << "\n";
}
