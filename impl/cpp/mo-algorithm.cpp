#include <algorithm>
#include <cmath>
#include <iostream>
#include <map>
#include <numeric>
#include <set>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {1, 2, 1, 3, 2, 2, 4, 1, 5, 3, 4, 4};
    vector<pair<int, int>> Q = {{0, 4}, {2, 7}, {5, 11}, {1, 3}, {6, 9}, {0, 11}};
    int B = max(1, (int)ceil(sqrt((double)a.size())));
    // 查詢依 (l 所在塊, r) 排序，左右指標逐格移動並維護相異數
    vector<int> order(Q.size());
    iota(order.begin(), order.end(), 0);
    stable_sort(order.begin(), order.end(), [&](int i, int j) { return make_pair(Q[i].first / B, Q[i].second) < make_pair(Q[j].first / B, Q[j].second); });
    map<int, int> cnt;
    int distinct = 0, moves = 0, L = 0, R = -1;
    auto add = [&](int x) { if (++cnt[x] == 1) distinct++; moves++; };
    auto rem = [&](int x) { if (--cnt[x] == 0) distinct--; moves++; };
    vector<int> ans(Q.size());
    for (int i : order) {
        int l = Q[i].first, r = Q[i].second;
        while (R < r) add(a[++R]);
        while (L > l) add(a[--L]);
        while (R > r) rem(a[R--]);
        while (L < l) rem(a[L++]);
        ans[i] = distinct;
    }
    for (size_t i = 0; i < Q.size(); i++) cout << "distinct[" << Q[i].first << ", " << Q[i].second << "] = " << ans[i] << " (brute " << set<int>(a.begin() + Q[i].first, a.begin() + Q[i].second + 1).size() << ")\n";
    cout << "pointer moves: " << moves << "\n";
}
