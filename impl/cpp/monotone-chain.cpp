#include <algorithm>
#include <cstdio>
#include <vector>
using namespace std;

struct P {
    long long x, y;
    bool operator<(const P& o) const { return x != o.x ? x < o.x : y < o.y; }
};
long long cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }

// 依 (x, y) 排序後，左到右建下凸殼、右到左建上凸殼，兩者接起來就是凸包（不需算角度）
vector<P> monotoneChain(vector<P> pts) {
    sort(pts.begin(), pts.end());
    int n = (int)pts.size(), k = 0;
    vector<P> h(2 * n);
    for (int i = 0; i < n; i++) {  // 下凸殼
        while (k >= 2 && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) {  // 上凸殼
        while (k >= t && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }
    h.resize(k - 1);
    return h;
}

int main() {
    vector<P> pts = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
    printf("hull (counter-clockwise):");
    for (P p : monotoneChain(pts)) printf(" (%lld,%lld)", p.x, p.y);
    printf("\n");
}
