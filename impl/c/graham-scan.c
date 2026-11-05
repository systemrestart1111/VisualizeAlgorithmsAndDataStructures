#include <stdio.h>
#include <stdlib.h>

typedef struct { long long x, y; } P;
P p0;

long long cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
long long d2(P a, P b) { return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y); }

static int by_angle(const void *x, const void *y) {
    P a = *(const P *)x, b = *(const P *)y;
    long long c = cross(p0, a, b);
    if (c) return c > 0 ? -1 : 1;
    long long d = d2(p0, a) - d2(p0, b); /* 共線時近的在前 */
    return d < 0 ? -1 : d > 0;
}

/* 以最低點為基準依極角排序，依序加入；若形成右轉（非逆時針）就把堆疊頂端彈出 */
int main(void) {
    P pts[] = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
    int n = 13, b = 0;
    for (int i = 1; i < n; i++)
        if (pts[i].y < pts[b].y || (pts[i].y == pts[b].y && pts[i].x < pts[b].x)) b = i;
    P t = pts[0]; pts[0] = pts[b]; pts[b] = t;
    p0 = pts[0];
    qsort(pts + 1, n - 1, sizeof(P), by_angle);
    P st[16];
    int top = 0;
    st[top++] = p0;
    for (int i = 1; i < n; i++) {
        while (top >= 2 && cross(st[top - 2], st[top - 1], pts[i]) <= 0) top--;
        st[top++] = pts[i];
    }
    printf("hull (counter-clockwise):");
    for (int i = 0; i < top; i++) printf(" (%lld,%lld)", st[i].x, st[i].y);
    printf("\n");
    return 0;
}
