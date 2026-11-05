#include <math.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct { long long x, y; } P;
long long cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
long long d2(P a, P b) { return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y); }
long long labs_(long long v) { return v < 0 ? -v : v; }
static int cmp(const void *a, const void *b) {
    const P *p = a, *q = b;
    return p->x != q->x ? (p->x < q->x ? -1 : 1) : (p->y < q->y ? -1 : p->y > q->y);
}

int main(void) {
    P pts[] = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}}, h[32];
    int n = 13, k = 0;
    qsort(pts, n, sizeof(P), cmp);
    for (int i = 0; i < n; i++) { while (k >= 2 && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--; h[k++] = pts[i]; }
    for (int i = n - 2, t = k + 1; i >= 0; i--) { while (k >= t && cross(h[k - 2], h[k - 1], pts[i]) <= 0) k--; h[k++] = pts[i]; }
    int m = k - 1, j = 1;
    /* 旋轉卡尺：沿凸包每條邊，把對面的「最遠點」指標 j 單調往前推；最遠點對一定是某組對蹠點 */
    long long best = 0;
    P ba = h[0], bb = h[0];
    for (int i = 0; i < m; i++) {
        int ni = (i + 1) % m;
        while (labs_(cross(h[i], h[ni], h[(j + 1) % m])) > labs_(cross(h[i], h[ni], h[j]))) j = (j + 1) % m;
        P cand[2] = {h[i], h[ni]};
        for (int t = 0; t < 2; t++)
            if (d2(cand[t], h[j]) > best) { best = d2(cand[t], h[j]); ba = cand[t]; bb = h[j]; }
    }
    long long brute = 0;
    for (int a = 0; a < n; a++)
        for (int b = 0; b < n; b++) if (d2(pts[a], pts[b]) > brute) brute = d2(pts[a], pts[b]);
    printf("hull:");
    for (int i = 0; i < m; i++) printf(" (%lld,%lld)", h[i].x, h[i].y);
    printf("\nfarthest pair: (%lld,%lld) (%lld,%lld), distance = %.4f\nbrute force d^2 = %lld\n", ba.x, ba.y, bb.x, bb.y, sqrt((double)best), brute);
    return 0;
}
