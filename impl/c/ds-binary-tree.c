#include <stdio.h>
#include <stdlib.h>

/* 依層序插入，形狀維持完全二元樹；刪除時以最深最右的節點補位 */
typedef struct Node { int val; struct Node *left, *right, *parent; } Node;
Node *root;

Node *new_node(int v, Node *p) {
    Node *n = calloc(1, sizeof *n);
    n->val = v; n->parent = p;
    return n;
}

int level_order(Node **out) {
    int h = 0, t = 0;
    if (root) out[t++] = root;
    while (h < t) {
        Node *n = out[h++];
        if (n->left) out[t++] = n->left;
        if (n->right) out[t++] = n->right;
    }
    return t;
}

void insert(int v) {
    if (!root) { root = new_node(v, NULL); return; }
    Node *q[64];
    int k = level_order(q);
    for (int i = 0; i < k; i++) { /* 第一個缺少子節點的位置 */
        if (!q[i]->left) { q[i]->left = new_node(v, q[i]); return; }
        if (!q[i]->right) { q[i]->right = new_node(v, q[i]); return; }
    }
}

int delete_val(int v) {
    Node *q[64], *target = NULL;
    int k = level_order(q);
    for (int i = 0; i < k && !target; i++) if (q[i]->val == v) target = q[i];
    if (!target) return 0;
    Node *deepest = q[k - 1], *p = deepest->parent;
    target->val = deepest->val;
    if (!p) root = NULL;
    else if (p->right == deepest) p->right = NULL;
    else p->left = NULL;
    free(deepest);
    return 1;
}

void preorder(Node *n) { if (n) { printf(" %d", n->val); preorder(n->left); preorder(n->right); } }
void inorder(Node *n) { if (n) { inorder(n->left); printf(" %d", n->val); inorder(n->right); } }
void postorder(Node *n) { if (n) { postorder(n->left); postorder(n->right); printf(" %d", n->val); } }

/* 括號表示法：值(左子樹,右子樹)，空子樹寫成 - */
void fmt(Node *n) {
    if (!n) { printf("-"); return; }
    printf("%d", n->val);
    if (n->left || n->right) { printf("("); fmt(n->left); printf(","); fmt(n->right); printf(")"); }
}

void show_level(void) {
    Node *q[64];
    int k = level_order(q);
    printf("%-10s", "level:");
    for (int i = 0; i < k; i++) printf(" %d", q[i]->val);
    printf("\n");
}

int main(void) {
    for (int v = 1; v <= 8; v++) insert(v);
    printf("insert 1..8: "); fmt(root); printf("\n");
    printf("%-10s", "preorder:"); preorder(root); printf("\n");
    printf("%-10s", "inorder:"); inorder(root); printf("\n");
    printf("%-10s", "postorder:"); postorder(root); printf("\n");
    show_level();
    delete_val(2);
    printf("delete 2: "); fmt(root); printf("\n");
    show_level();
    return 0;
}
