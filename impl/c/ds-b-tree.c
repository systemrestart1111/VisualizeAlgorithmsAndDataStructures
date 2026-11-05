#include <stdio.h>
#include <stdlib.h>

/* 最小度數：每個節點 T-1 ~ 2T-1 個鍵（T = 2 即 2-3-4 樹） */
#define T 2
/* 所有葉節點在同一深度；往下插入時遇到滿節點就先分裂（預先分裂，不必回頭） */
typedef struct BNode { int keys[2 * T - 1], n, leaf; struct BNode *kids[2 * T]; } BNode;
BNode *root;

BNode *new_node(int leaf) { BNode *x = calloc(1, sizeof *x); x->leaf = leaf; return x; }

void split(BNode *x, int i) {
    BNode *y = x->kids[i], *z = new_node(y->leaf);
    int mid = y->keys[T - 1]; /* 中間鍵上移到父節點 */
    z->n = T - 1;
    for (int j = 0; j < T - 1; j++) z->keys[j] = y->keys[j + T];
    if (!y->leaf) for (int j = 0; j < T; j++) z->kids[j] = y->kids[j + T];
    y->n = T - 1;
    for (int j = x->n; j > i; j--) x->kids[j + 1] = x->kids[j];
    x->kids[i + 1] = z;
    for (int j = x->n - 1; j >= i; j--) x->keys[j + 1] = x->keys[j];
    x->keys[i] = mid;
    x->n++;
}

void insert(int k) {
    if (root->n == 2 * T - 1) { /* 根滿了：樹長高一層 */
        BNode *s = new_node(0);
        s->kids[0] = root;
        root = s;
        split(s, 0);
    }
    BNode *x = root;
    while (!x->leaf) {
        int i = 0;
        while (i < x->n && k > x->keys[i]) i++;
        if (x->kids[i]->n == 2 * T - 1) { split(x, i); if (k > x->keys[i]) i++; }
        x = x->kids[i];
    }
    int i = x->n - 1;
    while (i >= 0 && x->keys[i] > k) { x->keys[i + 1] = x->keys[i]; i--; }
    x->keys[i + 1] = k;
    x->n++;
}

void print_node(BNode *x) {
    printf("[");
    for (int j = 0; j < x->n; j++) printf(j ? " %d" : "%d", x->keys[j]);
    printf("]");
}

/* 逐層列出節點，層與層之間以 / 分隔；回傳層數 */
int show(void) {
    BNode *q[64];
    int dep[64], h = 0, t = 0, cur = 0;
    q[t] = root; dep[t++] = 0;
    while (h < t) {
        BNode *x = q[h];
        int d = dep[h++];
        printf(d != cur ? " / " : " ");
        cur = d;
        print_node(x);
        if (!x->leaf) for (int j = 0; j <= x->n; j++) { q[t] = x->kids[j]; dep[t++] = d + 1; }
    }
    return cur + 1;
}

int main(void) {
    root = new_node(1);
    int keys[] = {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 28};
    for (int i = 0; i < 11; i++) { insert(keys[i]); printf("insert %2d:", keys[i]); show(); printf("\n"); }
    int qs[] = {17, 13};
    for (int i = 0; i < 2; i++) {
        int k = qs[i], found = 0;
        printf("search %d: ", k);
        BNode *path[16];
        int len = 0;
        for (BNode *x = root;;) {
            path[len++] = x;
            int j = 0;
            while (j < x->n && k > x->keys[j]) j++;
            if (j < x->n && x->keys[j] == k) { found = 1; break; }
            if (x->leaf) break;
            x = x->kids[j];
        }
        printf("%s, path ", found ? "found" : "not found");
        for (int j = 0; j < len; j++) { if (j) printf(" -> "); print_node(path[j]); }
        printf("\n");
    }
    int height = 1;
    for (BNode *x = root; !x->leaf; x = x->kids[0]) height++;
    printf("height = %d\n", height);
    return 0;
}
