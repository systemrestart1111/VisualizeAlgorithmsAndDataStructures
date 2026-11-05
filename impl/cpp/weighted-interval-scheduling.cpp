#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

struct Iv { int s, e, w; };

int main() {
    vector<Iv> a = {{0, 3, 2}, {2, 9, 20}, {3, 5, 3}, {5, 7, 4}, {7, 10, 3}, {9, 12, 6}, {10, 14, 2}};
    stable_sort(a.begin(), a.end(), [](const Iv &x, const Iv &y) { return x.e != y.e ? x.e < y.e : x.s < y.s; });
    int n = a.size();
    // p[j] = 結束 ≤ s_j 的活動個數；dp[j] = max(dp[j−1], w_j + dp[p(j)])
    vector<int> p(n), dp(n + 1);
    for (int j = 0; j < n; j++) p[j] = upper_bound(a.begin(), a.end(), a[j].s, [](int v, const Iv &x) { return v < x.e; }) - a.begin();
    for (int j = 1; j <= n; j++) dp[j] = max(dp[j - 1], a[j - 1].w + dp[p[j - 1]]);
    vector<int> pick;
    for (int j = n; j > 0;) { if (dp[j] != dp[j - 1]) { pick.push_back(j - 1); j = p[j - 1]; } else j--; }
    reverse(pick.begin(), pick.end());
    cout << "best total: " << dp[n] << " chosen:";
    for (int j : pick) cout << " [" << a[j].s << "," << a[j].e << ")w" << a[j].w;
    int last = -1000, greedy = 0;
    for (auto &x : a) if (x.s >= last) { greedy += x.w; last = x.e; }
    cout << "\nearliest-finish greedy: " << greedy << "\n";
}
