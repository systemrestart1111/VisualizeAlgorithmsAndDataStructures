#include <math.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct { double px, py, dx, dy, ang; int box, ord; } HP;
typedef struct { double x, y; } Pt;

static int out(const HP *h, double x, double y) { return h->dx * (y - h->py) - h->dy * (x - h->px) < -1e-9; }
static Pt inter(const HP *s, const HP *t) {
    double al = ((t->px - s->px) * t->dy - (t->py - s->py) * t->dx) / (s->dx * t->dy - s->dy * t->dx);
    Pt p = {s->px + s->dx * al, s->py + s->dy * al};
    return p;
}
static int cmp(const void *a, const void *b) { const HP *p = a, *q = b; if (p->ang != q->ang) return p->ang < q->ang ? -1 : 1; return p->ord - q->ord; }
static double f3(double v) { return fabs(v) < 5e-4 ? 0.0 : v; }

/* 每個 a·x + b·y ≤ c 轉成有向線（可行側在左），加大方框，依角度排序後用雙端佇列 */
static void run(const double cons[][3], int m) {
    HP H[32], dq[64];
    int nh = 0, head = 0, tail = 0; /* dq[head..tail) */
    double M = 50;
    for (int i = 0; i < m; i++) {
        double a = cons[i][0], b = cons[i][1], c = cons[i][2], n2 = a * a + b * b;
        H[nh++] = (HP){a * c / n2, b * c / n2, -b, a, 0, 0, 0};
        M = fmax(M, fabs(c) / hypot(a, b));
    }
    M *= 4;
    H[nh++] = (HP){M, -M, 0, 1, 0, 1, 0};
    H[nh++] = (HP){M, M, -1, 0, 0, 1, 0};
    H[nh++] = (HP){-M, M, 0, -1, 0, 1, 0};
    H[nh++] = (HP){-M, -M, 1, 0, 0, 1, 0};
    for (int i = 0; i < nh; i++) { H[i].ang = atan2(H[i].dy, H[i].dx); H[i].ord = i; }
    qsort(H, nh, sizeof(HP), cmp);
    HP buf[64];
    head = tail = 32;
    for (int i = 0; i < nh; i++) {
        HP *h = &H[i];
        while (tail - head >= 2) { Pt x = inter(&buf[tail - 1], &buf[tail - 2]); if (!out(h, x.x, x.y)) break; tail--; }
        while (tail - head >= 2) { Pt x = inter(&buf[head], &buf[head + 1]); if (!out(h, x.x, x.y)) break; head++; }
        if (tail > head && fabs(h->dx * buf[tail - 1].dy - h->dy * buf[tail - 1].dx) < 1e-12) {
            if (h->dx * buf[tail - 1].dx + h->dy * buf[tail - 1].dy < 0) { printf("empty intersection\n"); return; }
            if (out(h, buf[tail - 1].px, buf[tail - 1].py)) tail--;
            else continue;
        }
        buf[tail++] = *h;
    }
    while (tail - head >= 3) { Pt x = inter(&buf[tail - 1], &buf[tail - 2]); if (!out(&buf[head], x.x, x.y)) break; tail--; }
    while (tail - head >= 3) { Pt x = inter(&buf[head], &buf[head + 1]); if (!out(&buf[tail - 1], x.x, x.y)) break; head++; }
    int k = tail - head, boxed = 0, np = 0;
    if (k < 3) { printf("empty intersection\n"); return; }
    for (int i = 0; i < k; i++) dq[i] = buf[head + i];
    Pt poly[64];
    for (int i = 0; i < k; i++) {
        if (dq[i].box) boxed = 1;
        Pt p = inter(&dq[i], &dq[(i + 1) % k]);
        if (!np || hypot(p.x - poly[np - 1].x, p.y - poly[np - 1].y) > 1e-9) poly[np++] = p;
    }
    if (np > 1 && hypot(poly[0].x - poly[np - 1].x, poly[0].y - poly[np - 1].y) <= 1e-9) np--;
    if (boxed) { printf("unbounded: clipped by the bounding box (%d vertices)\n", np); return; }
    int s = 0;
    for (int i = 1; i < np; i++) {
        long long xi = llround(poly[i].x * 1e6), xs = llround(poly[s].x * 1e6), yi = llround(poly[i].y * 1e6), ys = llround(poly[s].y * 1e6);
        if (xi < xs || (xi == xs && yi < ys)) s = i;
    }
    double area = 0;
    for (int i = 0; i < np; i++) { Pt p = poly[i], q = poly[(i + 1) % np]; area += p.x * q.y - q.x * p.y; }
    printf("%d-gon, area %.3f:", np, f3(fabs(area) / 2));
    for (int i = 0; i < np; i++) { Pt p = poly[(s + i) % np]; printf(" (%.3f, %.3f)", f3(p.x), f3(p.y)); }
    printf("\n");
}

int main(void) {
    double c1[][3] = {{1, 1, 10}, {-1, 0, 0}, {0, -1, 0}, {1, -2, 4}, {-2, 1, 6}, {1, 0, 7}};
    double c2[][3] = {{1, 0, 2}, {-1, 0, -5}, {0, 1, 5}, {0, -1, 0}};
    double c3[][3] = {{1, 1, 4}, {1, -1, 2}, {-1, 0, 1}, {1, 1, 6}};
    double c4[][3] = {{-1, 0, 0}, {0, -1, 0}};
    run(c1, 6);
    run(c2, 4);
    run(c3, 4);
    run(c4, 2);
    return 0;
}
