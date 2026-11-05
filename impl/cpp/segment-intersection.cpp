#include <algorithm>
#include <cstdio>
using namespace std;

struct P { long long x, y; };

long long cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }

// 已知 p、q、r 共線：r 是否落在 pq 的範圍內
bool onSegment(P p, P q, P r) { return min(p.x, q.x) <= r.x && r.x <= max(p.x, q.x) && min(p.y, q.y) <= r.y && r.y <= max(p.y, q.y); }

// 兩條線段互相「跨立」（各自的兩端點分別在另一條線的兩側），或端點恰好落在另一條線段上
bool intersect(P p1, P p2, P p3, P p4) {
    long long d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4);
    if (((d1 > 0) != (d2 > 0)) && d1 && d2 && ((d3 > 0) != (d4 > 0)) && d3 && d4) return true;
    return (d1 == 0 && onSegment(p3, p4, p1)) || (d2 == 0 && onSegment(p3, p4, p2)) ||
           (d3 == 0 && onSegment(p1, p2, p3)) || (d4 == 0 && onSegment(p1, p2, p4));
}

int main() {
    long long s[][8] = {{1, 1, 9, 7, 2, 8, 8, 2}, {1, 1, 4, 4, 5, 5, 9, 2}, {2, 2, 8, 2, 5, 2, 5, 7}, {1, 6, 4, 9, 6, 1, 9, 4}};
    for (auto& r : s) {
        P a{r[0], r[1]}, b{r[2], r[3]}, c{r[4], r[5]}, d{r[6], r[7]};
        printf("(%lld,%lld)-(%lld,%lld) vs (%lld,%lld)-(%lld,%lld): %s\n", a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y, intersect(a, b, c, d) ? "intersect" : "no");
    }
}
