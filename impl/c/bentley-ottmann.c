#include <math.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct { double ax, ay, bx, by; } Seg;
typedef struct { double x, y; int kind, s; } Ev;
static Seg L[16];
static int nseg, status[16], ns, nq, nfound, nkeys;
static Ev Q[256];
static double fx[64], fy[64], sortX, delta;
static int fseg[64][16], fcnt[64];
static long long keys[256][2];

static double y_at(int i, double x) { return L[i].ay + (L[i].by - L[i].ay) * (x - L[i].ax) / (L[i].bx - L[i].ax); }
static int seg_x(int i, int j, double *px, double *py) {
    double x1 = L[i].ax, y1 = L[i].ay, x2 = L[i].bx, y2 = L[i].by, x3 = L[j].ax, y3 = L[j].ay, x4 = L[j].bx, y4 = L[j].by;
    double d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
    if (fabs(d) < 1e-12) return 0;
    double u = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d, v = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
    if (u < -1e-9 || u > 1 + 1e-9 || v < -1e-9 || v > 1 + 1e-9) return 0;
    *px = x1 + u * (x2 - x1); *py = y1 + u * (y2 - y1);
    return 1;
}
static int rank_of(int k) { return k == 0 ? 1 : k == 1 ? 0 : 2; }
static int cmp_ev(const void *a, const void *b) {
    const Ev *p = a, *q = b;
    if (p->x != q->x) return p->x < q->x ? -1 : 1;
    if (p->y != q->y) return p->y < q->y ? -1 : 1;
    return rank_of(p->kind) - rank_of(q->kind);
}
static int cmp_status(const void *a, const void *b) { double u = y_at(*(const int *)a, sortX + delta), v = y_at(*(const int *)b, sortX + delta); return u < v ? -1 : u > v; }
static int was_adjacent(const int *bs, int nb, int a, int b) { for (int k = 0; k + 1 < nb; k++) if ((bs[k] == a && bs[k + 1] == b) || (bs[k] == b && bs[k + 1] == a)) return 1; return 0; }

/* 只檢查 status 中新相鄰的一對；在掃描線右側相交就加入事件佇列 */
static void check(double x, double y, const int *bs, int nb) {
    for (int k = 0; k + 1 < ns; k++) {
        int a = status[k], b = status[k + 1];
        if (was_adjacent(bs, nb, a, b)) continue;
        double px, py;
        if (!seg_x(a, b, &px, &py) || px < x - 1e-9 || (fabs(px - x) <= 1e-9 && py < y - 1e-9)) continue;
        long long kx = llround(px * 1e6), ky = llround(py * 1e6);
        int seen = 0;
        for (int t = 0; t < nkeys; t++) if (keys[t][0] == kx && keys[t][1] == ky) seen = 1;
        if (seen) continue;
        keys[nkeys][0] = kx; keys[nkeys][1] = ky; nkeys++;
        Q[nq].x = px; Q[nq].y = py; Q[nq].kind = 1; Q[nq].s = -1; nq++;
    }
    qsort(Q, nq, sizeof(Ev), cmp_ev);
}

static void run(const double raw[][4], int m) {
    nseg = m; ns = 0; nq = 0; nfound = 0; nkeys = 0;
    double xmin = 1e18, xmax = -1e18;
    for (int i = 0; i < m; i++) {
        if (raw[i][0] < raw[i][2]) { L[i].ax = raw[i][0]; L[i].ay = raw[i][1]; L[i].bx = raw[i][2]; L[i].by = raw[i][3]; }
        else { L[i].ax = raw[i][2]; L[i].ay = raw[i][3]; L[i].bx = raw[i][0]; L[i].by = raw[i][1]; }
        xmin = fmin(xmin, L[i].ax); xmax = fmax(xmax, L[i].bx);
        Q[nq].x = L[i].ax; Q[nq].y = L[i].ay; Q[nq].kind = 0; Q[nq].s = i; nq++;
        Q[nq].x = L[i].bx; Q[nq].y = L[i].by; Q[nq].kind = 2; Q[nq].s = i; nq++;
    }
    delta = (xmax - xmin + 2) * 1e-7;
    qsort(Q, nq, sizeof(Ev), cmp_ev);
    while (nq) {
        Ev e = Q[0];
        for (int k = 1; k < nq; k++) Q[k - 1] = Q[k];
        nq--;
        int bs[16], nb = ns;
        for (int k = 0; k < ns; k++) bs[k] = status[k];
        if (e.kind == 0) { status[ns++] = e.s; sortX = e.x; qsort(status, ns, sizeof(int), cmp_status); }
        else if (e.kind == 2) { int t = 0; for (int k = 0; k < ns; k++) if (status[k] != e.s) status[t++] = status[k]; ns = t; }
        else {
            fx[nfound] = e.x; fy[nfound] = e.y; fcnt[nfound] = 0;
            for (int i = 0; i < nseg; i++) if (L[i].ax - 1e-9 <= e.x && e.x <= L[i].bx + 1e-9 && fabs(y_at(i, e.x) - e.y) < 1e-7) fseg[nfound][fcnt[nfound]++] = i;
            nfound++;
            sortX = e.x;
            qsort(status, ns, sizeof(int), cmp_status);
        }
        check(e.x, e.y, bs, nb);
    }
    int nbrute = 0;
    long long bk[128][2];
    for (int i = 0; i < m; i++) for (int j = i + 1; j < m; j++) {
        double px, py;
        if (!seg_x(i, j, &px, &py)) continue;
        long long kx = llround(px * 1e6), ky = llround(py * 1e6);
        int seen = 0;
        for (int t = 0; t < nbrute; t++) if (bk[t][0] == kx && bk[t][1] == ky) seen = 1;
        if (!seen) { bk[nbrute][0] = kx; bk[nbrute][1] = ky; nbrute++; }
    }
    int ok = nbrute == nfound;
    for (int t = 0; ok && t < nbrute; t++) { int hit = 0; for (int f = 0; f < nfound; f++) if (llround(fx[f] * 1e6) == bk[t][0] && llround(fy[f] * 1e6) == bk[t][1]) hit = 1; if (!hit) ok = 0; }
    int ord[64];
    for (int i = 0; i < nfound; i++) ord[i] = i;
    for (int i = 1; i < nfound; i++) for (int j = i; j > 0 && (fx[ord[j - 1]] > fx[ord[j]] || (fx[ord[j - 1]] == fx[ord[j]] && fy[ord[j - 1]] > fy[ord[j]])); j--) { int t = ord[j]; ord[j] = ord[j - 1]; ord[j - 1] = t; }
    printf("%d intersections (brute force agrees %s)\n", nfound, ok ? "True" : "False");
    for (int i = 0; i < nfound; i++) {
        int f = ord[i];
        printf("  (%.3f, %.3f): segments", fabs(fx[f]) < 5e-4 ? 0.0 : fx[f], fabs(fy[f]) < 5e-4 ? 0.0 : fy[f]);
        for (int k = 0; k < fcnt[f]; k++) printf(" %d", fseg[f][k]);
        printf("\n");
    }
}

int main(void) {
    double t1[][4] = {{1, 2, 9, 8}, {1, 7, 8, 1}, {3, 1, 10, 6}, {2, 9, 11, 3}, {4, 5, 12, 5}, {6, 8, 12, 9}};
    double t2[][4] = {{0, 0, 10, 10}, {0, 10, 10, 0}, {0, 5, 10, 5}, {2, 8, 4, 9}};
    double t3[][4] = {{0, 0, 5, 5}, {5, 5, 10, 0}, {1, 4, 9, 4}};
    run(t1, 6);
    run(t2, 4);
    run(t3, 3);
    return 0;
}
