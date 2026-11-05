#include <cstdio>
#include <utility>
#include <vector>
using namespace std;

typedef pair<long long, long long> P;

// 射線法：從點往右射一條水平線，與多邊形的邊相交奇數次就在內部
bool inside(P pt, const vector<P>& poly) {
    bool res = false;
    for (size_t i = 0; i < poly.size(); i++) {
        P a = poly[i], b = poly[(i + 1) % poly.size()];
        if ((a.second > pt.second) != (b.second > pt.second)) {  // 這條邊跨過水平線
            // 交點 x 座標 > x 才算在右側；改寫成乘法以避免除法誤差
            long long v = (b.first - a.first) * (pt.second - a.second) - (pt.first - a.first) * (b.second - a.second);
            if (b.second > a.second ? v > 0 : v < 0) res = !res;
        }
    }
    return res;
}

int main() {
    vector<P> poly = {{2, 1}, {9, 2}, {11, 7}, {7, 5}, {5, 10}, {1, 7}};
    for (P q : vector<P>{{5, 4}, {8, 7}, {3, 8}, {10, 3}}) printf("(%lld,%lld): %s\n", q.first, q.second, inside(q, poly) ? "inside" : "outside");
}
