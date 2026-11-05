#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int key, pri; struct Node *left, *right; } Node;
static long long seed = 2024;
/* 與網頁相同的 Park–Miller 亂數，固定種子讓結果可重現 */
static int rnd(int n) { seed = seed * 48271 % 2147483647; return (int)(seed % n); }

static Node *rot_right(Node *n) { Node *l = n->left; n->left = l->right; l->right = n; return l; }
static Node *rot_left(Node *n) { Node *r = n->right; n->right = r->left; r->left = n; return r; }

/* 依 BST 插到葉子，回溯時若子節點優先權較高就旋轉上來（最大堆積） */
static Node *insert(Node *n, int key) {
    if (!n) { n = malloc(sizeof *n); n->key = key; n->pri = rnd(100); n->left = n->right = NULL; return n; }
    if (key == n->key) return n;
    if (key < n->key) { n->left = insert(n->left, key); if (n->left->pri > n->pri) n = rot_right(n); }
    else { n->right = insert(n->right, key); if (n->right->pri > n->pri) n = rot_left(n); }
    return n;
}
/* 把節點往優先權較高的子節點方向轉下去，直到最多一個子節點再移除 */
static Node *delete_key(Node *n, int key) {
    if (!n) return NULL;
    if (key < n->key) n->left = delete_key(n->left, key);
    else if (key > n->key) n->right = delete_key(n->right, key);
    else {
        if (!n->left || !n->right) { Node *c = n->left ? n->left : n->right; free(n); return c; }
        if (n->left->pri > n->right->pri) { n = rot_right(n); n->right = delete_key(n->right, key); }
        else { n = rot_left(n); n->left = delete_key(n->left, key); }
    }
    return n;
}
static void pre(Node *n) { if (!n) return; printf(" %d(p%d)", n->key, n->pri); pre(n->left); pre(n->right); }
static void in(Node *n) { if (!n) return; in(n->left); printf(" %d", n->key); in(n->right); }

int main(void) {
    Node *root = NULL;
    int ks[] = {30, 15, 45, 8, 22, 37, 52};
    for (int i = 0; i < 7; i++) root = insert(root, ks[i]);
    printf("preorder:"); pre(root); printf("\n");
    printf("inorder :"); in(root); printf("\n");
    root = delete_key(root, 30);
    root = delete_key(root, 8);
    printf("after delete 30, 8:"); pre(root); printf("\n");
    printf("inorder :"); in(root); printf("\n");
    return 0;
}
