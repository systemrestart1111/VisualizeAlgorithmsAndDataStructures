#include <stdio.h>
#include <stdlib.h>

#define N 9
long long PX[N + 3] = {3, 12, 7, 2, 15, 10, 17, 8, 5, -1000, 1000, 0}; /* 最後三點是包住所有點的超級三角形 */
long long PY[N + 3] = {3, 4, 9, 13, 12, 16, 7, 2, 6, -1000, -1000, 1000};
int tris[512][3], nt;

long long orient(int a, int b, int c) { return (PX[b] - PX[a]) * (PY[c] - PY[a]) - (PY[b] - PY[a]) * (PX[c] - PX[a]); }

/* 點 d 是否在三角形 t 的外接圓內（整數行列式，沒有浮點誤差） */
int in_circumcircle(int *t, int d) {
    int a = t[0], b = t[1], c = t[2];
    if (orient(a, b, c) < 0) { int tmp = b; b = c; c = tmp; } /* 調整成逆時針 */
    int v[3] = {a, b, c};
    long long r[3][3];
    for (int i = 0; i < 3; i++) {
        long long x = PX[v[i]] - PX[d], y = PY[v[i]] - PY[d];
        r[i][0] = x; r[i][1] = y; r[i][2] = x * x + y * y;
    }
    long long det = r[0][0] * (r[1][1] * r[2][2] - r[2][1] * r[1][2]) - r[0][1] * (r[1][0] * r[2][2] - r[2][0] * r[1][2]) +
                    r[0][2] * (r[1][0] * r[2][1] - r[2][0] * r[1][1]);
    return det > 0;
}

static int cmp_int(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }
static int cmp_tri(const void *a, const void *b) {
    const int *p = a, *q = b;
    for (int i = 0; i < 3; i++) if (p[i] != q[i]) return p[i] - q[i];
    return 0;
}

/* Bowyer–Watson：逐一加入點；刪掉外接圓包含新點的三角形，留下的多邊形空洞再與新點連成三角形 */
int main(void) {
    tris[0][0] = N; tris[0][1] = N + 1; tris[0][2] = N + 2;
    nt = 1;
    for (int p = 0; p < N; p++) {
        int eu[1024], ev[1024], ne = 0, keep = 0;
        static int kept[512][3];
        for (int i = 0; i < nt; i++) {
            if (!in_circumcircle(tris[i], p)) { kept[keep][0] = tris[i][0]; kept[keep][1] = tris[i][1]; kept[keep++][2] = tris[i][2]; continue; }
            for (int k = 0; k < 3; k++) {
                int u = tris[i][k], w = tris[i][(k + 1) % 3];
                eu[ne] = u < w ? u : w; ev[ne++] = u < w ? w : u;
            }
        }
        nt = 0;
        for (int i = 0; i < keep; i++) { tris[nt][0] = kept[i][0]; tris[nt][1] = kept[i][1]; tris[nt++][2] = kept[i][2]; }
        for (int i = 0; i < ne; i++) { /* 只出現一次的邊是空洞的邊界 */
            int c = 0;
            for (int j = 0; j < ne; j++) c += eu[j] == eu[i] && ev[j] == ev[i];
            if (c == 1) { tris[nt][0] = eu[i]; tris[nt][1] = ev[i]; tris[nt++][2] = p; }
        }
    }
    int res[512][3], nr = 0;
    for (int i = 0; i < nt; i++) {
        if (tris[i][0] >= N || tris[i][1] >= N || tris[i][2] >= N) continue; /* 去掉碰到超級三角形的三角形 */
        for (int k = 0; k < 3; k++) res[nr][k] = tris[i][k];
        qsort(res[nr++], 3, sizeof(int), cmp_int);
    }
    qsort(res, nr, sizeof res[0], cmp_tri);
    printf("triangles: %d\n", nr);
    for (int i = 0; i < nr; i++) {
        printf("  (%d, %d, %d)", res[i][0], res[i][1], res[i][2]);
        for (int k = 0; k < 3; k++) printf(" (%lld,%lld)", PX[res[i][k]], PY[res[i][k]]);
        printf("\n");
    }
    return 0;
}
