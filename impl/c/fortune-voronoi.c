#include <math.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct { double x, y; } Pt;
typedef struct { int site, ev, id; } Arc;
typedef struct { double y, cx, cy, r; int site, arc, valid, used; } Ev;
static Pt S[32];
static int n, nb, ne, nextId, nv;
static Arc beach[128];
static Ev ev[1024];
static double L, scale, VX[256], VY[256];

static int circum(Pt a, Pt b, Pt c, double *ux, double *uy, double *r) {
    double d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
    if (fabs(d) < 1e-12) return 0;
    double A = a.x * a.x + a.y * a.y, B = b.x * b.x + b.y * b.y, C = c.x * c.x + c.y * c.y;
    *ux = (A * (b.y - c.y) + B * (c.y - a.y) + C * (a.y - b.y)) / d;
    *uy = (A * (c.x - b.x) + B * (a.x - c.x) + C * (b.x - a.x)) / d;
    *r = hypot(a.x - *ux, a.y - *uy);
    return 1;
}
/* 焦點 s、準線 y = L 的拋物線在 x 的高度 */
static double parab(Pt s, double LL, double x) { return fabs(s.y - LL) < 1e-12 ? INFINITY : ((x - s.x) * (x - s.x) + s.y * s.y - LL * LL) / (2 * (s.y - LL)); }
/* 左弧 a 與右弧 b 的斷點：兩拋物線的交點中，左邊由 a 較低的那一個 */
static double break_x(Pt a, Pt b, double LL) {
    double da = 2 * (a.y - LL), db = 2 * (b.y - LL);
    if (fabs(da) < 1e-12) return a.x;
    if (fabs(db) < 1e-12) return b.x;
    double A = 1 / da - 1 / db, B = -2 * (a.x / da - b.x / db), C = (a.x * a.x + a.y * a.y - LL * LL) / da - (b.x * b.x + b.y * b.y - LL * LL) / db;
    if (fabs(A) < 1e-12) return -C / B;
    double disc = sqrt(fmax(0.0, B * B - 4 * A * C)), r0 = (-B - disc) / (2 * A), r1 = (-B + disc) / (2 * A);
    double eps = 1e-6 * (1 + fabs(r0) + fabs(r1));
    if (parab(a, LL, r0 - eps) < parab(b, LL, r0 - eps)) return r0;
    if (parab(a, LL, r1 - eps) < parab(b, LL, r1 - eps)) return r1;
    return r0;
}
static void check(int k) {
    if (k < 1 || k + 1 >= nb || beach[k - 1].site == beach[k + 1].site) return;
    Pt a = S[beach[k - 1].site], b = S[beach[k].site], c = S[beach[k + 1].site];
    double ux, uy, r;
    if (!circum(a, b, c, &ux, &uy, &r)) return;
    double yb = uy - r, tol = 1e-5 * scale;
    if (yb > L + 1e-9) return;
    if (fabs(break_x(a, b, yb) - ux) > tol || fabs(break_x(b, c, yb) - ux) > tol) return;
    ev[ne] = (Ev){yb, ux, uy, r, -1, beach[k].id, 1, 0};
    beach[k].ev = ne++;
}
static void kill(int k) { if (beach[k].ev >= 0) ev[beach[k].ev].valid = 0; beach[k].ev = -1; }
static Arc new_arc(int site) { Arc a = {site, -1, nextId++}; return a; }

/* 掃描線由上往下；站點事件切開弧，圓事件讓弧消失並產生 Voronoi 頂點 */
static void fortune(void) {
    double xmin = 1e18, xmax = -1e18, ymax = -1e18;
    for (int i = 0; i < n; i++) { xmin = fmin(xmin, S[i].x); xmax = fmax(xmax, S[i].x); ymax = fmax(ymax, S[i].y); }
    scale = xmax - xmin + 6;
    L = ymax + 3;
    nb = ne = nv = nextId = 0;
    for (int i = 0; i < n; i++) ev[ne++] = (Ev){S[i].y, 0, 0, 0, i, -1, 1, 0};
    for (;;) {
        int best = -1;
        for (int i = 0; i < ne; i++) {
            if (ev[i].used) continue;
            if (best < 0 || ev[i].y > ev[best].y || (ev[i].y == ev[best].y && ev[i].site >= 0 && ev[best].site < 0)) best = i;
        }
        if (best < 0) break;
        ev[best].used = 1;
        if (!ev[best].valid) continue;
        Ev e = ev[best];
        L = e.y;
        if (e.site >= 0) {
            int p = e.site;
            if (!nb) { beach[nb++] = new_arc(p); continue; }
            int k = 0;
            while (k + 1 < nb && break_x(S[beach[k].site], S[beach[k + 1].site], L) < S[p].x) k++;
            int old = beach[k].site;
            kill(k);
            for (int i = nb - 1; i > k; i--) beach[i + 2] = beach[i];
            beach[k] = new_arc(old);
            beach[k + 1] = new_arc(p);
            beach[k + 2] = new_arc(old);
            nb += 2;
            check(k);
            check(k + 2);
        } else {
            int k = -1;
            for (int i = 0; i < nb; i++) if (beach[i].id == e.arc) k = i;
            if (k < 1 || k + 1 >= nb) continue;
            VX[nv] = e.cx; VY[nv] = e.cy; nv++;
            for (int i = k; i + 1 < nb; i++) beach[i] = beach[i + 1];
            nb--;
            kill(k - 1);
            kill(k);
            check(k - 1);
            check(k);
        }
    }
}
static int cmp_pt(const void *a, const void *b) { const Pt *p = a, *q = b; return p->x != q->x ? (p->x < q->x ? -1 : 1) : (p->y < q->y ? -1 : p->y > q->y); }
static int uniq(const double *X, const double *Y, int m, Pt *out) {
    int k = 0;
    for (int i = 0; i < m; i++) { int dup = 0; for (int j = 0; j < k; j++) if (hypot(X[i] - out[j].x, Y[i] - out[j].y) <= 1e-6) dup = 1; if (!dup) { out[k].x = X[i]; out[k].y = Y[i]; k++; } }
    qsort(out, k, sizeof(Pt), cmp_pt);
    return k;
}
static double f3(double v) { return fabs(v) < 5e-4 ? 0.0 : v; }

static void run(void) {
    fortune();
    Pt V[256], B[256];
    int nvu = uniq(VX, VY, nv, V);
    double bx[1024], by[1024];
    int m = 0;
    for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) for (int k = j + 1; k < n; k++) {
        double ux, uy, r;
        if (!circum(S[i], S[j], S[k], &ux, &uy, &r)) continue;
        int empty = 1;
        for (int t = 0; t < n; t++) if (hypot(S[t].x - ux, S[t].y - uy) < r - 1e-7) empty = 0;
        if (empty) { bx[m] = ux; by[m] = uy; m++; }
    }
    int nbu = uniq(bx, by, m, B);
    int same = nbu == nvu;
    for (int i = 0; same && i < nvu; i++) if (hypot(V[i].x - B[i].x, V[i].y - B[i].y) >= 1e-6) same = 0;
    printf("%d sites: %d Voronoi vertices (brute force agrees %s)\n ", n, nvu, same ? "True" : "False");
    for (int i = 0; i < nvu; i++) printf(" (%.3f, %.3f)", f3(V[i].x), f3(V[i].y));
    printf("\n");
}

int main(void) {
    Pt t1[] = {{3, 3}, {12, 4}, {7, 9}, {2, 13}, {15, 12}, {10, 16}, {17, 7}};
    n = 7;
    for (int i = 0; i < n; i++) S[i] = t1[i];
    run();
    long long seed = 11;
    n = 12;
    for (int i = 0; i < n; i++) { seed = seed * 48271 % 2147483647; S[i].x = (seed % 100000) / 5000.0; seed = seed * 48271 % 2147483647; S[i].y = (seed % 100000) / 5000.0; }
    run();
    Pt t3[] = {{0, 0}, {10, 1}, {5, 9}};
    n = 3;
    for (int i = 0; i < n; i++) S[i] = t3[i];
    run();
    return 0;
}
