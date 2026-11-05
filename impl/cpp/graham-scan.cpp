#include <algorithm>
#include <cstdio>
#include <vector>
using namespace std;

struct P { long long x, y; };
long long cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
long long d2(P a, P b) { return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y); }

// 以最低點為基準依極角排序，依序加入；若形成右轉（非逆時針）就把堆疊頂端彈出
vector<P> grahamScan(vector<P> pts) {
    auto it = min_element(pts.begin(), pts.end(), [](P a, P b) { return a.y != b.y ? a.y < b.y : a.x < b.x; });
    swap(pts[0], *it);
    P p0 = pts[0];
    sort(pts.begin() + 1, pts.end(), [&](P a, P b) {
        long long c = cross(p0, a, b);
        if (c) return c > 0;
        return d2(p0, a) < d2(p0, b);  // 共線時近的在前
    });
    vector<P> st;
    for (P p : pts) {
        while (st.size() >= 2 && cross(st[st.size() - 2], st.back(), p) <= 0) st.pop_back();
        st.push_back(p);
    }
    return st;
}

int main() {
    vector<P> pts = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
    printf("hull (counter-clockwise):");
    for (P p : grahamScan(pts)) printf(" (%lld,%lld)", p.x, p.y);
    printf("\n");
}
