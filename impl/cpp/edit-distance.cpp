#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

// dp[i][j] = a 前 i 字變成 b 前 j 字的最少操作數（插入、刪除、替換各算 1）
int main() {
    string a = "kitten", b = "sitting";
    int m = (int)a.size(), n = (int)b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1));
    for (int i = 0; i <= m; i++) dp[i][0] = i;
    for (int j = 0; j <= n; j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] : 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});
    vector<string> ops;
    for (int i = m, j = n; i || j;) {  // 倒推出一組操作
        if (i && j && a[i - 1] == b[j - 1]) { i--; j--; }
        else if (i && j && dp[i][j] == dp[i - 1][j - 1] + 1) { ops.push_back(string("replace ") + a[i - 1] + "->" + b[j - 1]); i--; j--; }
        else if (i && dp[i][j] == dp[i - 1][j] + 1) { ops.push_back(string("delete ") + a[i - 1]); i--; }
        else { ops.push_back(string("insert ") + b[j - 1]); j--; }
    }
    reverse(ops.begin(), ops.end());
    cout << "distance = " << dp[m][n] << "\nops:";
    for (size_t k = 0; k < ops.size(); k++) cout << (k ? ", " : " ") << ops[k];
    cout << "\n";
}
