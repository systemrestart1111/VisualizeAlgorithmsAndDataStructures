#include <stdio.h>

typedef struct { long long x, y; } P;
long long cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }
long long d2(P a, P b) { return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y); }
int same(P a, P b) { return a.x == b.x && a.y == b.y; }

/* 禮物包裝法：從最左點出發，每次找「所有點都在它左側」的下一個點，O(nh) */
int main(void) {
    P pts[] = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}};
    int n = 13, s = 0;
    for (int i = 1; i < n; i++)
        if (pts[i].x < pts[s].x || (pts[i].x == pts[s].x && pts[i].y < pts[s].y)) s = i;
    P start = pts[s], p = start;
    printf("hull (counter-clockwise):");
    do {
        printf(" (%lld,%lld)", p.x, p.y);
        P q = same(pts[0], p) ? pts[1] : pts[0];
        for (int i = 0; i < n; i++) {
            long long c = cross(p, q, pts[i]);
            if (c < 0 || (c == 0 && d2(p, pts[i]) > d2(p, q))) q = pts[i]; /* r 在 p→q 右側，或共線但更遠 */
        }
        p = q;
    } while (!same(p, start));
    printf("\n");
    return 0;
}
