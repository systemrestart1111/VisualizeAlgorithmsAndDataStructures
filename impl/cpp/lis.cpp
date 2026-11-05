#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {10, 9, 2, 5, 3, 7, 101, 18, 4, 20};
    int n = (int)a.size();
    // O(n²)：dp[i] = 以 a[i] 結尾的最長遞增子序列長度
    vector<int> dp(n, 1), parent(n, -1);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < i; j++)
            if (a[j] < a[i] && dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; parent[i] = j; }
    int end = (int)(max_element(dp.begin(), dp.end()) - dp.begin());  // 同長度取最先出現的結尾
    vector<int> seq;
    for (int e = end; e >= 0; e = parent[e]) seq.push_back(a[e]);
    reverse(seq.begin(), seq.end());
    cout << "LIS length = " << dp[end] << "\none LIS =";
    for (int x : seq) cout << " " << x;
    cout << "\n";
    // O(n log n)：tails[k] = 長度 k+1 的遞增子序列最小可能結尾，用二分搜尋更新
    vector<int> tails;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    cout << "tails:";
    for (int x : tails) cout << " " << x;
    cout << "\n";
}
