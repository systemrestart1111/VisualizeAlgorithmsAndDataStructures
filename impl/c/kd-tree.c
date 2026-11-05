#include <math.h>
#include <stdio.h>
#include <stdlib.h>

typedef struct { int x, y; } P;
typedef struct KD { P p; int axis; struct KD *left, *right; } KD;
static int cur_axis;
static int key(P a, int axis) { return axis ? a.y : a.x; }
static int cmp(const void *a, const void *b) {
    P u = *(const P *)a, v = *(const P *)b;
    int d = key(u, cur_axis) - key(v, cur_axis);
    return d ? d : key(u, 1 - cur_axis) - key(v, 1 - cur_axis);
}
/* 交替以 x、y 的中位數切分 */
static KD *build(P *pts, int n, int depth) {
    if (n <= 0) return NULL;
    cur_axis = depth % 2;
    qsort(pts, n, sizeof(P), cmp);
    int m = n / 2;
    KD *node = malloc(sizeof *node);
    node->p = pts[m];
    node->axis = depth % 2;
    node->left = build(pts, m, depth + 1);
    node->right = build(pts + m + 1, n - m - 1, depth + 1);
    return node;
}
static P q, best;
static long long bd;
static int visited;
/* 先走查詢點所在的一側；到切分線的距離小於目前最近距離才檢查另一側 */
static void go(KD *n) {
    if (!n) return;
    visited++;
    long long d = (long long)(n->p.x - q.x) * (n->p.x - q.x) + (long long)(n->p.y - q.y) * (n->p.y - q.y);
    if (d < bd) { bd = d; best = n->p; }
    long long diff = key(q, n->axis) - key(n->p, n->axis);
    KD *near = diff < 0 ? n->left : n->right, *far = diff < 0 ? n->right : n->left;
    go(near);
    if (diff * diff < bd) go(far);
}

int main(void) {
    P pts[11] = {{30, 40}, {5, 25}, {70, 70}, {10, 12}, {50, 30}, {35, 45}, {80, 15}, {60, 85}, {20, 75}, {90, 55}, {45, 60}}, orig[11];
    for (int i = 0; i < 11; i++) orig[i] = pts[i];
    KD *root = build(pts, 11, 0);
    printf("root: (%d, %d) | left: (%d, %d) | right: (%d, %d)\n", root->p.x, root->p.y, root->left->p.x, root->left->p.y, root->right->p.x, root->right->p.y);
    P qs[4] = {{52, 52}, {12, 20}, {95, 95}, {0, 100}};
    for (int t = 0; t < 4; t++) {
        q = qs[t]; bd = (long long)1e18; visited = 0;
        go(root);
        long long brute = (long long)1e18;
        for (int i = 0; i < 11; i++) { long long d = (long long)(orig[i].x - q.x) * (orig[i].x - q.x) + (long long)(orig[i].y - q.y) * (orig[i].y - q.y); if (d < brute) brute = d; }
        printf("nearest to (%d, %d): (%d, %d) dist %.2f visited %d/11 brute %.2f\n", q.x, q.y, best.x, best.y, sqrt((double)bd), visited, sqrt((double)brute));
    }
    return 0;
}
