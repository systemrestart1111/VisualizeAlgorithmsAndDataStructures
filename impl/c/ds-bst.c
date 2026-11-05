#include <stdio.h>
#include <stdlib.h>

/* 左子樹 < 節點 < 右子樹；搜尋、插入、刪除都只沿一條路徑往下 */
typedef struct Node { int val; struct Node *left, *right; } Node;
Node *root;

Node *new_node(int v) { Node *n = calloc(1, sizeof *n); n->val = v; return n; }

void insert(int v) {
    Node **p = &root;
    while (*p && (*p)->val != v) p = v < (*p)->val ? &(*p)->left : &(*p)->right;
    if (!*p) *p = new_node(v);
}

int search(int v, int *path, int *len) {
    *len = 0;
    for (Node *c = root; c; c = v < c->val ? c->left : c->right) {
        path[(*len)++] = c->val;
        if (v == c->val) return 1;
    }
    return 0;
}

Node *delete_node(Node *n, int v) {
    if (!n) return NULL;
    if (v < n->val) n->left = delete_node(n->left, v);
    else if (v > n->val) n->right = delete_node(n->right, v);
    else {
        if (!n->left || !n->right) { /* 葉節點或只有一個子節點 */
            Node *child = n->left ? n->left : n->right;
            free(n);
            return child;
        }
        Node *s = n->right; /* 兩個子節點：以中序後繼（右子樹最小值）取代 */
        while (s->left) s = s->left;
        n->val = s->val;
        n->right = delete_node(n->right, s->val);
    }
    return n;
}

void inorder(Node *n) { if (n) { inorder(n->left); printf(" %d", n->val); inorder(n->right); } }

/* 括號表示法：值(左子樹,右子樹)，空子樹寫成 - */
void fmt(Node *n) {
    if (!n) { printf("-"); return; }
    printf("%d", n->val);
    if (n->left || n->right) { printf("("); fmt(n->left); printf(","); fmt(n->right); printf(")"); }
}

int main(void) {
    int vals[] = {50, 30, 70, 20, 40, 60, 80, 35, 65};
    for (int i = 0; i < 9; i++) insert(vals[i]);
    printf("build: "); fmt(root); printf("\n");
    printf("inorder:"); inorder(root); printf("\n");
    int qs[] = {65, 45}, path[16], len;
    for (int i = 0; i < 2; i++) {
        int found = search(qs[i], path, &len);
        printf("search %d: %s, path ", qs[i], found ? "found" : "not found");
        for (int j = 0; j < len; j++) printf(j ? " -> %d" : "%d", path[j]);
        printf("\n");
    }
    Node *lo = root, *hi = root;
    while (lo->left) lo = lo->left;
    while (hi->right) hi = hi->right;
    printf("min = %d, max = %d\n", lo->val, hi->val);
    int dels[] = {20, 30, 50};
    const char *kinds[] = {"leaf", "one child", "two children"};
    for (int i = 0; i < 3; i++) {
        root = delete_node(root, dels[i]);
        printf("delete %d (%s): ", dels[i], kinds[i]); fmt(root); printf("\n");
    }
    printf("inorder:"); inorder(root); printf("\n");
    return 0;
}
