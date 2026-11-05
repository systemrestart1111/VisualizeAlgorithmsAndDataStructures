#include <stdio.h>
#include <stdlib.h>

#define CAP 1
#define MAXD 5
typedef struct { int x, y; } P;
typedef struct QT { int x0, y0, s, depth, np; P pts[16]; struct QT *kids[4]; } QT;

static QT *mk(int x0, int y0, int s, int depth) { QT *q = calloc(1, sizeof *q); q->x0 = x0; q->y0 = y0; q->s = s; q->depth = depth; return q; }
/* 葉格滿了且未達最大深度就分成四格，原本的點往下移 */
static void insert(QT *n, P p) {
    if (!n->kids[0]) {
        if (n->np < CAP || n->depth >= MAXD) { n->pts[n->np++] = p; return; }
        int h = n->s / 2;
        n->kids[0] = mk(n->x0, n->y0, h, n->depth + 1);
        n->kids[1] = mk(n->x0 + h, n->y0, h, n->depth + 1);
        n->kids[2] = mk(n->x0, n->y0 + h, h, n->depth + 1);
        n->kids[3] = mk(n->x0 + h, n->y0 + h, h, n->depth + 1);
        int k = n->np;
        n->np = 0;
        for (int i = 0; i < k; i++) insert(n, n->pts[i]);
    }
    int h = n->s / 2, k = (p.x >= n->x0 + h ? 1 : 0) + (p.y >= n->y0 + h ? 2 : 0);
    insert(n->kids[k], p);
}
static P found[64];
static int nf;
/* 只走進與查詢矩形相交的格子；回傳拜訪的格子數 */
static int range(QT *n, int x1, int y1, int x2, int y2) {
    if (n->x0 > x2 || n->x0 + n->s <= x1 || n->y0 > y2 || n->y0 + n->s <= y1) return 0;
    for (int i = 0; i < n->np; i++) if (n->pts[i].x >= x1 && n->pts[i].x <= x2 && n->pts[i].y >= y1 && n->pts[i].y <= y2) found[nf++] = n->pts[i];
    int v = 1;
    if (n->kids[0]) for (int k = 0; k < 4; k++) v += range(n->kids[k], x1, y1, x2, y2);
    return v;
}
static int count(QT *n) { int c = 1; if (n->kids[0]) for (int k = 0; k < 4; k++) c += count(n->kids[k]); return c; }
static int cmp(const void *a, const void *b) { const P *u = a, *v = b; return u->x != v->x ? u->x - v->x : u->y - v->y; }

int main(void) {
    QT *root = mk(0, 0, 64, 0);
    P pts[10] = {{10, 10}, {50, 12}, {20, 40}, {30, 35}, {55, 55}, {8, 52}, {40, 20}, {45, 22}, {45, 22}, {45, 22}};
    for (int i = 0; i < 10; i++) insert(root, pts[i]);
    printf("cells: %d\n", count(root));
    int rects[4][4] = {{10, 10, 40, 40}, {40, 10, 63, 30}, {0, 0, 63, 63}, {60, 0, 63, 5}};
    for (int r = 0; r < 4; r++) {
        nf = 0;
        int v = range(root, rects[r][0], rects[r][1], rects[r][2], rects[r][3]);
        qsort(found, nf, sizeof(P), cmp);
        printf("range (%d, %d, %d, %d): %d points [", rects[r][0], rects[r][1], rects[r][2], rects[r][3], nf);
        for (int i = 0; i < nf; i++) printf(i ? ", (%d, %d)" : "(%d, %d)", found[i].x, found[i].y);
        printf("] visited %d\n", v);
    }
    return 0;
}
