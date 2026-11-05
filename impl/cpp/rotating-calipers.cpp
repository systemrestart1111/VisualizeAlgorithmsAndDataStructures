#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;

struct P {
    long long x, y;
    bool operator<(const P& o) const { return x != o.x ? x < o.x : y < o.y; }
};
long long cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
long long d2(P a, P b) { return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y); }

vector<P> convexHull(vector<P> pts) {
    sort(pts.begin(), pts.end());
    int n = (int)pts.size(), k = 0;
    vector<P> h(2 * n);
    for (int i = 0; i < n; i++) { while (k >= 2 && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--; h[k++] = pts[i]; }
    for (int i = n - 2, t = k + 1; i >= 0; i--) { while (k >= t && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--; h[k++] = pts[i]; }
    h.resize(k - 1);
    return h;
}

int main() {
    vector<P> pts = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
    vector<P> h = convexHull(pts);
    int m = (int)h.size(), j = 1;
    // 旋轉卡尺：沿凸包每條邊，把對面的「最遠點」指標 j 單調往前推；最遠點對一定是某組對蹠點
    long long best = 0;
    P ba = h[0], bb = h[0];
    for (int i = 0; i < m; i++) {
        int ni = (i + 1) % m;
        while (llabs(cross(h[i], h[ni], h[(j + 1) % m])) > llabs(cross(h[i], h[ni], h[j]))) j = (j + 1) % m;
        for (P a : {h[i], h[ni]})
            if (d2(a, h[j]) > best) { best = d2(a, h[j]); ba = a; bb = h[j]; }
    }
    long long brute = 0;
    for (P a : pts) for (P b : pts) brute = max(brute, d2(a, b));
    printf("hull:");
    for (P p : h) printf(" (%lld,%lld)", p.x, p.y);
    printf("\nfarthest pair: (%lld,%lld) (%lld,%lld), distance = %.4f\nbrute force d^2 = %lld\n", ba.x, ba.y, bb.x, bb.y, sqrt((double)best), brute);
}
