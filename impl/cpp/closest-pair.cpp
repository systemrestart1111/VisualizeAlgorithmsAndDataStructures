#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;

struct P {
    long long x, y;
    bool operator<(const P& o) const { return x != o.x ? x < o.x : y < o.y; }
};
struct Best { long long d2; P a, b; };
long long d2(P a, P b) { return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y); }

// 分治：左右兩半各自求解，再檢查跨中線、寬度 < d 的帶狀區域（每點只需比較常數個鄰居）
Best closest(vector<P> p) {
    Best best{-1, {0, 0}, {0, 0}};
    int n = (int)p.size();
    if (n <= 3) {
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (best.d2 < 0 || d2(p[i], p[j]) < best.d2) best = {d2(p[i], p[j]), p[i], p[j]};
        return best;
    }
    int mid = n / 2;
    long long mx = p[mid].x;
    Best l = closest(vector<P>(p.begin(), p.begin() + mid)), r = closest(vector<P>(p.begin() + mid, p.end()));
    best = l.d2 <= r.d2 ? l : r;
    vector<P> strip;
    for (P q : p) if ((q.x - mx) * (q.x - mx) < best.d2) strip.push_back(q);
    sort(strip.begin(), strip.end(), [](P a, P b) { return a.y != b.y ? a.y < b.y : a.x < b.x; });
    for (size_t i = 0; i < strip.size(); i++)
        for (size_t j = i + 1; j < strip.size() && (strip[j].y - strip[i].y) * (strip[j].y - strip[i].y) < best.d2; j++)
            if (d2(strip[i], strip[j]) < best.d2) best = {d2(strip[i], strip[j]), strip[i], strip[j]};
    return best;
}

int main() {
    vector<P> pts = {{2, 3}, {12, 30}, {40, 50}, {5, 1}, {12, 10}, {3, 4}, {25, 18}, {33, 8}, {18, 25}, {45, 22}, {8, 40}, {30, 35}, {22, 5}};
    long long brute = -1;
    for (size_t i = 0; i < pts.size(); i++)
        for (size_t j = i + 1; j < pts.size(); j++) if (brute < 0 || d2(pts[i], pts[j]) < brute) brute = d2(pts[i], pts[j]);
    sort(pts.begin(), pts.end());
    Best b = closest(pts);
    if (b.b < b.a) swap(b.a, b.b);
    printf("closest pair: (%lld,%lld) (%lld,%lld)\ndistance = %.4f\nbrute force d^2 = %lld\n", b.a.x, b.a.y, b.b.x, b.b.y, sqrt((double)b.d2), brute);
}
