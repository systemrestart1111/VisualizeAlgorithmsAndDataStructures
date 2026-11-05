#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int key, h, size; struct Node *left, *right; } Node;
static int H(Node *n) { return n ? n->h : 0; }
static int S(Node *n) { return n ? n->size : 0; }
static void fix(Node *n) { n->h = 1 + (H(n->left) > H(n->right) ? H(n->left) : H(n->right)); n->size = 1 + S(n->left) + S(n->right); }
static Node *rot_right(Node *n) { Node *l = n->left; n->left = l->right; l->right = n; fix(n); fix(l); return l; }
static Node *rot_left(Node *n) { Node *r = n->right; n->right = r->left; r->left = n; fix(n); fix(r); return r; }

/* AVL 平衡；旋轉後重新計算子樹大小 */
static Node *balance(Node *n) {
    fix(n);
    if (H(n->left) - H(n->right) > 1) { if (H(n->left->left) < H(n->left->right)) n->left = rot_left(n->left); return rot_right(n); }
    if (H(n->right) - H(n->left) > 1) { if (H(n->right->right) < H(n->right->left)) n->right = rot_right(n->right); return rot_left(n); }
    return n;
}
static Node *insert(Node *n, int k) {
    if (!n) { n = malloc(sizeof *n); n->key = k; n->h = n->size = 1; n->left = n->right = NULL; return n; }
    if (k < n->key) n->left = insert(n->left, k); else n->right = insert(n->right, k);
    return balance(n);
}
static Node *delete_key(Node *n, int k) {
    if (!n) return NULL;
    if (k < n->key) n->left = delete_key(n->left, k);
    else if (k > n->key) n->right = delete_key(n->right, k);
    else {
        if (!n->left || !n->right) { Node *c = n->left ? n->left : n->right; free(n); return c; }
        Node *m = n->right;
        while (m->left) m = m->left;
        n->key = m->key;
        n->right = delete_key(n->right, m->key);
    }
    return balance(n);
}
/* 第 k 小（1 起算）：比較 k 與左子樹大小 */
static int select_k(Node *n, int k) {
    while (n) {
        int ls = S(n->left);
        if (k == ls + 1) return n->key;
        if (k <= ls) n = n->left; else { k -= ls + 1; n = n->right; }
    }
    return -1;
}
/* 比 x 小的個數 + 1 */
static int rank_of(Node *n, int x) {
    int r = 0;
    while (n) { if (x <= n->key) n = n->left; else { r += S(n->left) + 1; n = n->right; } }
    return r + 1;
}
static void all(const char *label, Node *root) { printf("%s", label); for (int k = 1; k <= S(root); k++) printf(" %d", select_k(root, k)); printf("\n"); }

int main(void) {
    Node *root = NULL;
    int ks[] = {20, 10, 30, 5, 15, 25, 40, 12, 35, 1};
    for (int i = 0; i < 10; i++) root = insert(root, ks[i]);
    all("select 1..n:", root);
    printf("rank 13 = %d | rank 26 = %d | rank 0 = %d\n", rank_of(root, 13), rank_of(root, 26), rank_of(root, 0));
    printf("root: %d size %d height %d\n", root->key, root->size, root->h);
    root = delete_key(root, 20);
    root = delete_key(root, 5);
    all("after delete 20, 5:", root);
    printf("select 4 = %d | rank 30 = %d\n", select_k(root, 4), rank_of(root, 30));
    return 0;
}
