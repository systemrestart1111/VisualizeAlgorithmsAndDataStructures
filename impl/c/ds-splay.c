#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int val; struct Node *left, *right; } Node;
Node *root;

Node *rotate_right(Node *x) { Node *y = x->left; x->left = y->right; y->right = x; return y; }
Node *rotate_left(Node *x) { Node *y = x->right; x->right = y->left; y->left = x; return y; }

/* 把 k 轉到根；k 不存在時，轉上來的是搜尋路徑上最後一個節點 */
Node *splay(Node *r, int k) {
    if (!r || r->val == k) return r;
    if (k < r->val) {
        if (!r->left) return r;
        if (k < r->left->val) { /* Zig-Zig（左左）：先轉祖父 */
            r->left->left = splay(r->left->left, k);
            r = rotate_right(r);
        } else if (k > r->left->val) { /* Zig-Zag（左右） */
            r->left->right = splay(r->left->right, k);
            if (r->left->right) r->left = rotate_left(r->left);
        }
        return r->left ? rotate_right(r) : r;
    }
    if (!r->right) return r;
    if (k > r->right->val) { /* Zig-Zig（右右） */
        r->right->right = splay(r->right->right, k);
        r = rotate_left(r);
    } else if (k < r->right->val) { /* Zig-Zag（右左） */
        r->right->left = splay(r->right->left, k);
        if (r->right->left) r->right = rotate_right(r->right);
    }
    return r->right ? rotate_left(r) : r;
}

/* 每次存取後都把該節點轉到根；不存任何平衡資訊，均攤 O(log n) */
void insert(int k) {
    Node **p = &root;
    while (*p && (*p)->val != k) p = k < (*p)->val ? &(*p)->left : &(*p)->right; /* 先做一般 BST 插入 */
    if (!*p) { *p = calloc(1, sizeof(Node)); (*p)->val = k; }
    root = splay(root, k);
}

int search(int k) {
    root = splay(root, k);
    return root && root->val == k;
}

int delete_key(int k) {
    if (!search(k)) return 0;
    Node *old = root;
    if (!root->left) root = root->right;
    else {
        Node *right = root->right;
        root = splay(root->left, k); /* 左子樹最大值轉到根，它沒有右子 */
        root->right = right;
    }
    free(old);
    return 1;
}

/* 括號表示法：值(左子樹,右子樹)，空子樹寫成 - */
void fmt(Node *n) {
    if (!n) { printf("-"); return; }
    printf("%d", n->val);
    if (n->left || n->right) { printf("("); fmt(n->left); printf(","); fmt(n->right); printf(")"); }
}

const char *b(int x) { return x ? "True" : "False"; }

int main(void) {
    int vals[] = {50, 30, 70, 20, 40, 60, 80};
    for (int i = 0; i < 7; i++) { insert(vals[i]); printf("insert %d: ", vals[i]); fmt(root); printf("\n"); }
    int qs[] = {40, 65};
    for (int i = 0; i < 2; i++) { int f = search(qs[i]); printf("search %d -> %s: ", qs[i], b(f)); fmt(root); printf("\n"); }
    int ds[] = {30, 99};
    for (int i = 0; i < 2; i++) { int ok = delete_key(ds[i]); printf("delete %d -> %s: ", ds[i], b(ok)); fmt(root); printf("\n"); }
    return 0;
}
