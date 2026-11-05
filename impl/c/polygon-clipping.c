#include <stdio.h>

typedef struct { double x, y; } P;
double cross(P o, P a, P b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }

/* 線段 pq 與直線 ab 的交點 */
P intersect(P p, P q, P a, P b) {
    double t = cross(a, b, p) / (cross(a, b, p) - cross(a, b, q));
    return (P){p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t};
}

/* Sutherland–Hodgman：依序用裁切窗的每一條邊去裁多邊形，只保留在邊左側（內側）的部分 */
int main(void) {
    P out[64] = {{1, 4}, {5, 11}, {9, 6}, {13, 10}, {12, 2}, {6, 0}}, win[] = {{3, 2}, {11, 2}, {11, 8}, {3, 8}}; /* 裁切窗：凸多邊形，逆時針 */
    int n = 6;
    for (int i = 0; i < 4; i++) {
        P a = win[i], b = win[(i + 1) % 4], in[64];
        int m = n;
        for (int k = 0; k < m; k++) in[k] = out[k];
        n = 0;
        for (int k = 0; k < m; k++) {
            P p = in[k], q = in[(k + 1) % m];
            int pin = cross(a, b, p) >= 0, qin = cross(a, b, q) >= 0;
            if (pin && qin) out[n++] = q;
            else if (pin && !qin) out[n++] = intersect(p, q, a, b);
            else if (!pin && qin) { out[n++] = intersect(p, q, a, b); out[n++] = q; }
        }
    }
    printf("clipped polygon: %d vertices\n", n);
    for (int k = 0; k < n; k++) printf("  (%.4f, %.4f)\n", out[k].x, out[k].y);
    return 0;
}
