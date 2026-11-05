#include <stdio.h>

typedef struct { long long x, y; } P;

long long cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
long long mn(long long a, long long b) { return a < b ? a : b; }
long long mx(long long a, long long b) { return a > b ? a : b; }

/* 已知 p、q、r 共線：r 是否落在 pq 的範圍內 */
int on_segment(P p, P q, P r) { return mn(p.x, q.x) <= r.x && r.x <= mx(p.x, q.x) && mn(p.y, q.y) <= r.y && r.y <= mx(p.y, q.y); }

/* 兩條線段互相「跨立」（各自的兩端點分別在另一條線的兩側），或端點恰好落在另一條線段上 */
int intersect(P p1, P p2, P p3, P p4) {
    long long d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4);
    if (((d1 > 0) != (d2 > 0)) && d1 && d2 && ((d3 > 0) != (d4 > 0)) && d3 && d4) return 1;
    return (d1 == 0 && on_segment(p3, p4, p1)) || (d2 == 0 && on_segment(p3, p4, p2)) ||
           (d3 == 0 && on_segment(p1, p2, p3)) || (d4 == 0 && on_segment(p1, p2, p4));
}

int main(void) {
    long long s[][8] = {{1, 1, 9, 7, 2, 8, 8, 2}, {1, 1, 4, 4, 5, 5, 9, 2}, {2, 2, 8, 2, 5, 2, 5, 7}, {1, 6, 4, 9, 6, 1, 9, 4}};
    for (int i = 0; i < 4; i++) {
        P a = {s[i][0], s[i][1]}, b = {s[i][2], s[i][3]}, c = {s[i][4], s[i][5]}, d = {s[i][6], s[i][7]};
        printf("(%lld,%lld)-(%lld,%lld) vs (%lld,%lld)-(%lld,%lld): %s\n", a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y, intersect(a, b, c, d) ? "intersect" : "no");
    }
    return 0;
}
