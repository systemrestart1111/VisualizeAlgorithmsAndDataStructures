#include <stdio.h>

#define N 8
static int p[N], d[N];   /* d[x] = val[x] − val[parent[x]] */

/* 回傳根，*w 為 val[x] − val[根]；路徑壓縮時把差值累加起來 */
static int find(int x, int *w) {
    if (p[x] == x) { *w = 0; return x; }
    int pw, r = find(p[x], &pw);
    d[x] += pw;
    p[x] = r;
    *w = d[x];
    return r;
}
/* 加入條件 val[x] − val[y] = w；與既有關係矛盾時回傳 0 */
static int relate(int x, int y, int w) {
    int dx, dy, rx = find(x, &dx), ry = find(y, &dy);
    if (rx == ry) return dx - dy == w;
    p[rx] = ry;
    d[rx] = w - dx + dy;
    return 1;
}
static int diff(int x, int y, int *out) {
    int dx, dy, rx = find(x, &dx), ry = find(y, &dy);
    if (rx != ry) return 0;
    *out = dx - dy;
    return 1;
}

int main(void) {
    for (int i = 0; i < N; i++) p[i] = i;
    int rel[4][3] = {{1, 0, 3}, {2, 1, 2}, {4, 3, -1}, {5, 4, 4}}, qs[4][2] = {{2, 0}, {5, 3}, {0, 2}, {2, 5}}, r;
    for (int i = 0; i < 4; i++) relate(rel[i][0], rel[i][1], rel[i][2]);
    for (int i = 0; i < 4; i++) {
        printf("val[%d] - val[%d] = ", qs[i][0], qs[i][1]);
        if (diff(qs[i][0], qs[i][1], &r)) printf("%d\n", r); else printf("unknown\n");
    }
    printf("relate(5, 2, 1): %s\n", relate(5, 2, 1) ? "True" : "False");
    diff(3, 0, &r);
    printf("val[3] - val[0] = %d\n", r);
    int a = relate(3, 0, 0), b = relate(3, 0, -4);
    printf("relate(3, 0, 0) consistent: %s | relate(3, 0, -4) consistent: %s\n", a ? "True" : "False", b ? "True" : "False");
    return 0;
}
