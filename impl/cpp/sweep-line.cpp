#include <algorithm>
#include <array>
#include <iostream>
#include <set>
#include <utility>
#include <vector>
using namespace std;

// 掃描線：把所有矩形的左右邊 x 當成事件排序；相鄰兩個事件之間的直條內，覆蓋的 y 長度固定
int main() {
    vector<array<int, 4>> rects = {{{1, 1, 6, 5}}, {{3, 3, 9, 8}}, {{7, 1, 11, 4}}, {{2, 6, 5, 10}}};  // (x1, y1, x2, y2)
    set<int> xset;
    for (auto& r : rects) { xset.insert(r[0]); xset.insert(r[2]); }
    vector<int> xs(xset.begin(), xset.end());
    long long total = 0;
    for (size_t k = 0; k + 1 < xs.size(); k++) {
        int xa = xs[k], xb = xs[k + 1];
        vector<pair<int, int>> ivs;  // 這一條內有效的 y 區間
        for (auto& r : rects) if (r[0] <= xa && r[2] >= xb) ivs.push_back({r[1], r[3]});
        sort(ivs.begin(), ivs.end());
        int covered = 0, lo = 0, hi = 0;
        bool have = false;
        for (auto& iv : ivs) {  // 合併重疊的 y 區間
            if (!have || iv.first > hi) {
                if (have) covered += hi - lo;
                lo = iv.first; hi = iv.second; have = true;
            } else hi = max(hi, iv.second);
        }
        if (have) covered += hi - lo;
        total += (long long)covered * (xb - xa);
        cout << "x in [" << xa << ", " << xb << "): covered y = " << covered << ", area += " << covered * (xb - xa) << "\n";
    }
    cout << "union area = " << total << "\n";
}
