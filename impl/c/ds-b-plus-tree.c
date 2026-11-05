#include <stdio.h>
#include <stdlib.h>

/* 階數：節點的鍵數達到 M 就分裂 */
#define M 4
/* 資料都在葉節點、內部節點只放索引鍵；葉節點以 next 串成串列，範圍查詢只需沿串列走 */
typedef struct BPNode { int keys[M + 1], n, leaf; struct BPNode *kids[M + 2], *next; } BPNode;
BPNode *root;

BPNode *new_node(int leaf) { BPNode *x = calloc(1, sizeof *x); x->leaf = leaf; return x; }

BPNode *find_leaf(int k, BPNode **path, int *depth) {
    BPNode *x = root;
    int d = 0;
    path[0] = x;
    while (!x->leaf) {
        int i = 0;
        while (i < x->n && k >= x->keys[i]) i++;
        x = x->kids[i];
        path[++d] = x;
    }
    *depth = d;
    return x;
}

void insert(int k) {
    BPNode *path[16];
    int d;
    BPNode *leaf = find_leaf(k, path, &d);
    for (int j = 0; j < leaf->n; j++) if (leaf->keys[j] == k) return;
    int i = leaf->n - 1;
    while (i >= 0 && leaf->keys[i] > k) { leaf->keys[i + 1] = leaf->keys[i]; i--; }
    leaf->keys[i + 1] = k;
    leaf->n++;
    BPNode *node = leaf;
    while (node->n >= M) {
        BPNode *nw = new_node(node->leaf);
        int mid = (node->n + 1) / 2, up;
        nw->n = node->n - mid;
        for (int j = 0; j < nw->n; j++) nw->keys[j] = node->keys[mid + j];
        if (node->leaf) { /* 葉分裂：右半第一個鍵「複製」到父節點 */
            node->n = mid;
            nw->next = node->next;
            node->next = nw;
            up = nw->keys[0];
        } else { /* 內部分裂：中間鍵「移動」到父節點 */
            up = node->keys[mid - 1];
            for (int j = 0; j <= nw->n; j++) nw->kids[j] = node->kids[mid + j];
            node->n = mid - 1;
        }
        if (d == 0) { /* 分裂到根：樹長高一層 */
            root = new_node(0);
            root->keys[0] = up;
            root->n = 1;
            root->kids[0] = node;
            root->kids[1] = nw;
            break;
        }
        BPNode *p = path[d - 1];
        int pi = 0;
        while (p->kids[pi] != node) pi++;
        for (int j = p->n; j > pi; j--) p->kids[j + 1] = p->kids[j];
        p->kids[pi + 1] = nw;
        for (int j = p->n - 1; j >= pi; j--) p->keys[j + 1] = p->keys[j];
        p->keys[pi] = up;
        p->n++;
        node = p;
        d--;
    }
}

int search(int k) {
    BPNode *path[16];
    int d;
    BPNode *leaf = find_leaf(k, path, &d);
    for (int j = 0; j < leaf->n; j++) if (leaf->keys[j] == k) return 1;
    return 0;
}

void print_node(BPNode *x) {
    printf("[");
    for (int j = 0; j < x->n; j++) printf(j ? " %d" : "%d", x->keys[j]);
    printf("]");
}

void show(void) {
    BPNode *q[64];
    int dep[64], h = 0, t = 0, cur = 0;
    q[t] = root; dep[t++] = 0;
    while (h < t) {
        BPNode *x = q[h];
        int d = dep[h++];
        printf(d != cur ? " / " : " ");
        cur = d;
        print_node(x);
        if (!x->leaf) for (int j = 0; j <= x->n; j++) { q[t] = x->kids[j]; dep[t++] = d + 1; }
    }
}

const char *b(int x) { return x ? "True" : "False"; }

int main(void) {
    root = new_node(1);
    int keys[] = {5, 15, 25, 35, 45, 10, 20, 30, 40, 50, 12, 28};
    for (int i = 0; i < 12; i++) { insert(keys[i]); printf("insert %2d:", keys[i]); show(); printf("\n"); }
    BPNode *x = root;
    while (!x->leaf) x = x->kids[0];
    printf("leaves: ");
    for (BPNode *l = x; l; l = l->next) { if (l != x) printf(" -> "); print_node(l); }
    printf("\n");
    printf("search 28 -> %s  search 33 -> %s\n", b(search(28)), b(search(33)));
    BPNode *path[16];
    int d, a = 12, bb = 35;
    printf("range [%d, %d]:", a, bb);
    for (BPNode *l = find_leaf(a, path, &d); l; l = l->next) {
        for (int j = 0; j < l->n; j++) if (l->keys[j] >= a && l->keys[j] <= bb) printf(" %d", l->keys[j]);
        if (l->n && l->keys[l->n - 1] > bb) break;
    }
    printf("\n");
    return 0;
}
