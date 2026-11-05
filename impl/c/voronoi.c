#include <math.h>
#include <stdio.h>

typedef struct { double x, y; } P;

/* 保留滿足 a·x + b·y <= c 的部分（凸多邊形與半平面的交集） */
int clip_halfplane(P *poly, int n, double a, double b, double c, P *out) {
    int m = 0;
    for (int k = 0; k < n; k++) {
        P p = poly[k], q = poly[(k + 1) % n];
        double fp = a * p.x + b * p.y - c, fq = a * q.x + b * q.y - c;
        if (fp <= 0) out[m++] = p;
        if ((fp < 0 && fq > 0) || (fq < 0 && fp > 0)) {
            double t = fp / (fp - fq);
            out[m++] = (P){p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t};
        }
    }
    return m;
}

double area(P *poly, int n) {
    double s = 0;
    for (int i = 0; i < n; i++) s += poly[i].x * poly[(i + 1) % n].y - poly[(i + 1) % n].x * poly[i].y;
    return fabs(s) / 2;
}

/* 站點 i 的 Voronoi 區域 = 外框依序被「比站點 j 更靠近站點 i」的半平面（垂直平分線的一側）裁切後剩下的部分 */
int main(void) {
    double S[][2] = {{3, 3}, {12, 4}, {7, 9}, {2, 13}, {15, 12}, {10, 16}, {17, 7}};
    int n = 7;
    double x0 = S[0][0], x1 = S[0][0], y0 = S[0][1], y1 = S[0][1];
    for (int i = 1; i < n; i++) {
        if (S[i][0] < x0) x0 = S[i][0];
        if (S[i][0] > x1) x1 = S[i][0];
        if (S[i][1] < y0) y0 = S[i][1];
        if (S[i][1] > y1) y1 = S[i][1];
    }
    x0 -= 3; x1 += 3; y0 -= 3; y1 += 3;
    double total = 0;
    for (int i = 0; i < n; i++) {
        P cell[64] = {{x0, y0}, {x1, y0}, {x1, y1}, {x0, y1}}, tmp[64];
        int m = 4;
        for (int j = 0; j < n; j++) {
            if (i == j) continue;
            double sx = S[i][0], sy = S[i][1], tx = S[j][0], ty = S[j][1];
            /* |P - S|² <= |P - T|²  <=>  2(T - S)·P <= |T|² - |S|² */
            m = clip_halfplane(cell, m, 2 * (tx - sx), 2 * (ty - sy), tx * tx + ty * ty - sx * sx - sy * sy, tmp);
            for (int k = 0; k < m; k++) cell[k] = tmp[k];
        }
        total += area(cell, m);
        printf("site %d (%.0f,%.0f): %d vertices, area = %.4f\n", i, S[i][0], S[i][1], m, area(cell, m));
    }
    printf("sum of areas = %.4f (box area = %.0f)\n", total, (x1 - x0) * (y1 - y0));
    return 0;
}
