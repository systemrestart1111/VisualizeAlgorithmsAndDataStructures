#include <math.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct { long long x, y; } P;
typedef struct { long long d2; P a, b; } Best;

long long d2(P a, P b) { return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y); }
static int by_x(const void *p, const void *q) { const P *a = p, *b = q; return a->x != b->x ? (a->x < b->x ? -1 : 1) : (a->y < b->y ? -1 : a->y > b->y); }
static int by_y(const void *p, const void *q) { const P *a = p, *b = q; return a->y != b->y ? (a->y < b->y ? -1 : 1) : (a->x < b->x ? -1 : a->x > b->x); }

/* 分治：左右兩半各自求解，再檢查跨中線、寬度 < d 的帶狀區域（每點只需比較常數個鄰居） */
Best closest(P *p, int n) {
    Best best = {-1, {0, 0}, {0, 0}};
    if (n <= 3) {
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (best.d2 < 0 || d2(p[i], p[j]) < best.d2) best = (Best){d2(p[i], p[j]), p[i], p[j]};
        return best;
    }
    int mid = n / 2;
    long long mx = p[mid].x;
    Best l = closest(p, mid), r = closest(p + mid, n - mid);
    best = l.d2 <= r.d2 ? l : r;
    P strip[64];
    int m = 0;
    for (int i = 0; i < n; i++) if ((p[i].x - mx) * (p[i].x - mx) < best.d2) strip[m++] = p[i];
    qsort(strip, m, sizeof(P), by_y);
    for (int i = 0; i < m; i++)
        for (int j = i + 1; j < m && (strip[j].y - strip[i].y) * (strip[j].y - strip[i].y) < best.d2; j++)
            if (d2(strip[i], strip[j]) < best.d2) best = (Best){d2(strip[i], strip[j]), strip[i], strip[j]};
    return best;
}

int main(void) {
    P pts[] = {{2, 3}, {12, 30}, {40, 50}, {5, 1}, {12, 10}, {3, 4}, {25, 18}, {33, 8}, {18, 25}, {45, 22}, {8, 40}, {30, 35}, {22, 5}};
    int n = 13;
    long long brute = -1;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) if (brute < 0 || d2(pts[i], pts[j]) < brute) brute = d2(pts[i], pts[j]);
    qsort(pts, n, sizeof(P), by_x);
    Best b = closest(pts, n);
    if (by_x(&b.a, &b.b) > 0) { P t = b.a; b.a = b.b; b.b = t; }
    printf("closest pair: (%lld,%lld) (%lld,%lld)\ndistance = %.4f\nbrute force d^2 = %lld\n", b.a.x, b.a.y, b.b.x, b.b.y, sqrt((double)b.d2), brute);
    return 0;
}
