#include <algorithm>
#include <cstdio>
#include <vector>
using namespace std;

struct P {
    long long x, y;
    bool operator<(const P& o) const { return x != o.x ? x < o.x : y < o.y; }
    bool operator==(const P& o) const { return x == o.x && y == o.y; }
};
long long cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
long long d2(P a, P b) { return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y); }

// 禮物包裝法：從最左點出發，每次找「所有點都在它左側」的下一個點，O(nh)
vector<P> jarvisMarch(const vector<P>& pts) {
    P start = *min_element(pts.begin(), pts.end()), p = start;
    vector<P> hull;
    do {
        hull.push_back(p);
        P q = pts[0] == p ? pts[1] : pts[0];
        for (P r : pts) {
            long long c = cross(p, q, r);
            if (c < 0 || (c == 0 && d2(p, r) > d2(p, q))) q = r;  // r 在 p→q 右側，或共線但更遠
        }
        p = q;
    } while (!(p == start));
    return hull;
}

int main() {
    vector<P> pts = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
    printf("hull (counter-clockwise):");
    for (P p : jarvisMarch(pts)) printf(" (%lld,%lld)", p.x, p.y);
    printf("\n");
}
