#include <stdio.h>
#include <stdlib.h>

typedef struct { double x, y; } Pt;
static Pt S[64];
static int n, cw[64], ncw;
static double cross(Pt o, Pt a, Pt b) { return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x); }

/* 遞迴找離線段 PQ 最遠的點，三角形內的點丟掉；凸包點依序寫入 cw */
static void find(const int *pts, int m, int p, int q) {
    if (!m) return;
    int f = pts[0], s1[64], s2[64], n1 = 0, n2 = 0;
    for (int k = 0; k < m; k++) if (cross(S[p], S[q], S[pts[k]]) > cross(S[p], S[q], S[f]) + 1e-12) f = pts[k];
    for (int k = 0; k < m; k++) {
        if (cross(S[p], S[f], S[pts[k]]) > 1e-9) s1[n1++] = pts[k];
        if (cross(S[f], S[q], S[pts[k]]) > 1e-9) s2[n2++] = pts[k];
    }
    find(s1, n1, p, f);
    cw[ncw++] = f;
    find(s2, n2, f, q);
}
static int cmp(const void *a, const void *b) { const Pt *p = a, *q = b; return p->x != q->x ? (p->x < q->x ? -1 : 1) : (p->y < q->y ? -1 : p->y > q->y); }
/* 單調鏈凸包（對照用） */
static int monotone(Pt *out) {
    Pt p[64];
    int m = 0, k = 0;
    for (int i = 0; i < n; i++) p[m++] = S[i];
    qsort(p, m, sizeof(Pt), cmp);
    if (m < 3) { for (int i = 0; i < m; i++) out[i] = p[i]; return m; }
    for (int i = 0; i < m; i++) { while (k >= 2 && cross(out[k - 2], out[k - 1], p[i]) <= 1e-9) k--; out[k++] = p[i]; }
    for (int i = m - 2, t = k + 1; i >= 0; i--) { while (k >= t && cross(out[k - 2], out[k - 1], p[i]) <= 1e-9) k--; out[k++] = p[i]; }
    return k - 1;
}

static void run(const Pt *raw, int m) {
    n = 0;
    for (int i = 0; i < m; i++) { int dup = 0; for (int j = 0; j < n; j++) if (S[j].x == raw[i].x && S[j].y == raw[i].y) dup = 1; if (!dup) S[n++] = raw[i]; }
    int A = 0, B = 0, up[64], down[64], nu = 0, nd = 0;
    for (int i = 1; i < n; i++) {
        if (S[i].x < S[A].x || (S[i].x == S[A].x && S[i].y < S[A].y)) A = i;
        if (S[i].x > S[B].x || (S[i].x == S[B].x && S[i].y > S[B].y)) B = i;
    }
    for (int i = 0; i < n; i++) {
        if (i == A || i == B) continue;
        double c = cross(S[A], S[B], S[i]);
        if (c > 1e-9) up[nu++] = i; else if (c < -1e-9) down[nd++] = i;
    }
    ncw = 0;
    cw[ncw++] = A;
    find(up, nu, A, B);
    cw[ncw++] = B;
    find(down, nd, B, A);
    int h[64], nh = 0;
    h[nh++] = cw[0];
    for (int i = ncw - 1; i >= 1; i--) h[nh++] = cw[i];
    Pt ref[130], hs[64];
    int nr = monotone(ref);
    for (int i = 0; i < nh; i++) hs[i] = S[h[i]];
    qsort(hs, nh, sizeof(Pt), cmp);
    qsort(ref, nr, sizeof(Pt), cmp);
    int same = nr == nh;
    for (int i = 0; same && i < nh; i++) if (hs[i].x != ref[i].x || hs[i].y != ref[i].y) same = 0;
    printf("hull (%d):", nh);
    for (int i = 0; i < nh; i++) printf(" (%.0f,%.0f)", S[h[i]].x, S[h[i]].y);
    printf("; same as monotone chain %s\n", same ? "True" : "False");
}

int main(void) {
    Pt t1[] = {{3, 1}, {7, 2}, {10, 5}, {6, 4}, {2, 6}, {5, 7}, {8, 9}, {1, 3}, {4, 4}, {9, 7}, {6, 10}, {3, 9}, {7, 6}, {5, 5}};
    Pt t2[] = {{0, 0}, {4, 0}, {4, 4}, {0, 4}, {2, 0}, {2, 2}, {4, 2}, {0, 0}, {0, 2}};
    Pt t3[30];
    long long s = 7;
    for (int i = 0; i < 30; i++) { s = s * 48271 % 2147483647; t3[i].x = (double)(s % 100); s = s * 48271 % 2147483647; t3[i].y = (double)(s % 100); }
    run(t1, 14);
    run(t2, 9);
    run(t3, 30);
    return 0;
}
