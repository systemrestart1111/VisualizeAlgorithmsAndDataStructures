#include <algorithm>
#include <cstdio>
#include <limits>
#include <vector>
using namespace std;

// 在較短陣列上二分切點，使左半共 (m+n+1)/2 個且左半最大 ≤ 右半最小
double median(vector<int> a, vector<int> b) {
    if (a.size() > b.size()) swap(a, b);
    int m = a.size(), n = b.size(), half = (m + n + 1) / 2, lo = 0, hi = m;
    const double INF = numeric_limits<double>::infinity();
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i;
        double l1 = i > 0 ? a[i - 1] : -INF, r1 = i < m ? a[i] : INF;
        double l2 = j > 0 ? b[j - 1] : -INF, r2 = j < n ? b[j] : INF;
        if (l1 <= r2 && l2 <= r1) return (m + n) % 2 ? max(l1, l2) : (max(l1, l2) + min(r1, r2)) / 2;
        if (l1 > r2) hi = i - 1; else lo = i + 1;
    }
    return 0;
}
void show(const vector<int> &a) { printf("["); for (size_t i = 0; i < a.size(); i++) printf(i ? ", %d" : "%d", a[i]); printf("]"); }

int main() {
    vector<pair<vector<int>, vector<int>>> tests = {{{1, 3, 8, 9, 15}, {7, 11, 18, 19, 21, 25}}, {{}, {2, 3}}, {{1, 2}, {3, 4}}, {{5}, {1, 2, 3, 4}}};
    for (auto &t : tests) { show(t.first); printf(" "); show(t.second); printf(" median = %.1f\n", median(t.first, t.second)); }
}
