#include <stdio.h>
#include <stdlib.h>

typedef struct { long long x, y; } P;
long long cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
static int cmp(const void *a, const void *b) {
    const P *p = a, *q = b;
    return p->x != q->x ? (p->x < q->x ? -1 : 1) : (p->y < q->y ? -1 : p->y > q->y);
}

/* 依 (x, y) 排序後，左到右建下凸殼、右到左建上凸殼，兩者接起來就是凸包（不需算角度） */
int main(void) {
    P pts[] = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
    int n = 13, k = 0;
    P h[32];
    qsort(pts, n, sizeof(P), cmp);
    for (int i = 0; i < n; i++) { /* 下凸殼 */
        while (k >= 2 && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }
    for (int i = n - 2, t = k + 1; i >= 0; i--) { /* 上凸殼 */
        while (k >= t && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--;
        h[k++] = pts[i];
    }
    printf("hull (counter-clockwise):");
    for (int i = 0; i < k - 1; i++) printf(" (%lld,%lld)", h[i].x, h[i].y);
    printf("\n");
    return 0;
}
