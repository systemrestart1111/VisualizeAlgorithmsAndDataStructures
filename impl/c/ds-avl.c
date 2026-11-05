#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Node { int val, h; struct Node *left, *right; } Node;
char logbuf[256]; /* 本次操作發生的旋轉 */

int height(Node *n) { return n ? n->h : 0; }
void update(Node *n) { int a = height(n->left), b = height(n->right); n->h = 1 + (a > b ? a : b); }
/* 平衡因子 = 左子樹高 − 右子樹高，AVL 要求它在 −1..1 之間 */
int balance(Node *n) { return height(n->left) - height(n->right); }

Node *rotate_right(Node *y) {
    Node *x = y->left;
    y->left = x->right; x->right = y;
    update(y); update(x);
    return x;
}

Node *rotate_left(Node *x) {
    Node *y = x->right;
    x->right = y->left; y->left = x;
    update(x); update(y);
    return y;
}

void log_rot(const char *kind, int v) {
    char s[32];
    sprintf(s, "%s%s at %d", logbuf[0] ? ", " : "", kind, v);
    strcat(logbuf, s);
}

Node *rebalance(Node *n) {
    update(n);
    int b = balance(n);
    if (b > 1) {
        if (balance(n->left) < 0) { log_rot("LR", n->val); n->left = rotate_left(n->left); }
        else log_rot("LL", n->val);
        return rotate_right(n);
    }
    if (b < -1) {
        if (balance(n->right) > 0) { log_rot("RL", n->val); n->right = rotate_right(n->right); }
        else log_rot("RR", n->val);
        return rotate_left(n);
    }
    return n;
}

Node *insert(Node *n, int v) {
    if (!n) { n = calloc(1, sizeof *n); n->val = v; n->h = 1; return n; }
    if (v < n->val) n->left = insert(n->left, v);
    else if (v > n->val) n->right = insert(n->right, v);
    else return n;
    return rebalance(n); /* 遞迴返回時就是「沿路往上」檢查 */
}

Node *delete_node(Node *n, int v) {
    if (!n) return NULL;
    if (v < n->val) n->left = delete_node(n->left, v);
    else if (v > n->val) n->right = delete_node(n->right, v);
    else {
        if (!n->left || !n->right) {
            Node *child = n->left ? n->left : n->right;
            free(n);
            return child;
        }
        Node *s = n->right;
        while (s->left) s = s->left;
        n->val = s->val;
        n->right = delete_node(n->right, s->val);
    }
    return rebalance(n);
}

/* 括號表示法：值(左子樹,右子樹)，空子樹寫成 - */
void fmt(Node *n) {
    if (!n) { printf("-"); return; }
    printf("%d", n->val);
    if (n->left || n->right) { printf("("); fmt(n->left); printf(","); fmt(n->right); printf(")"); }
}

void report(const char *op, int v, Node *root) {
    printf("%s %2d: ", op, v);
    fmt(root);
    if (logbuf[0]) printf("   [%s]", logbuf);
    printf("\n");
}

int main(void) {
    Node *root = NULL;
    int ins[] = {40, 20, 60, 10, 30, 50, 70, 25, 27, 5, 4}, dels[] = {50, 70, 60};
    for (int i = 0; i < 11; i++) { logbuf[0] = 0; root = insert(root, ins[i]); report("insert", ins[i], root); }
    for (int i = 0; i < 3; i++) { logbuf[0] = 0; root = delete_node(root, dels[i]); report("delete", dels[i], root); }
    printf("height = %d\n", height(root));
    return 0;
}
