#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* CLRS 版本：以一個黑色哨兵 NIL 代替所有空指標，插入後以「變色 + 旋轉」修復 */
typedef struct Node { int val, red; struct Node *left, *right, *parent; } Node;
Node nil_node = {0, 0, &nil_node, &nil_node, &nil_node};
Node *NIL = &nil_node, *root = &nil_node;
char logbuf[128];

void log_case(int c) {
    char s[16];
    sprintf(s, "%scase %d", logbuf[0] ? ", " : "", c);
    strcat(logbuf, s);
}

void rotate_left(Node *x) {
    Node *y = x->right;
    x->right = y->left;
    if (y->left != NIL) y->left->parent = x;
    y->parent = x->parent;
    if (x->parent == NIL) root = y;
    else if (x == x->parent->left) x->parent->left = y;
    else x->parent->right = y;
    y->left = x; x->parent = y;
}

void rotate_right(Node *x) {
    Node *y = x->left;
    x->left = y->right;
    if (y->right != NIL) y->right->parent = x;
    y->parent = x->parent;
    if (x->parent == NIL) root = y;
    else if (x == x->parent->right) x->parent->right = y;
    else x->parent->left = y;
    y->right = x; x->parent = y;
}

void fix(Node *z) {
    while (z->parent->red) { /* 違反「紅節點的子節點必為黑」 */
        Node *g = z->parent->parent;
        int left = z->parent == g->left;
        Node *u = left ? g->right : g->left;
        if (u->red) { /* Case 1：叔叔紅 → 父、叔變黑，祖父變紅，往上繼續 */
            z->parent->red = u->red = 0;
            g->red = 1;
            z = g;
            log_case(1);
            continue;
        }
        if (z == (left ? z->parent->right : z->parent->left)) { /* Case 2：內側 → 轉成外側 */
            z = z->parent;
            if (left) rotate_left(z); else rotate_right(z);
            log_case(2);
        }
        z->parent->red = 0; g->red = 1; /* Case 3：外側 → 變色後旋轉祖父 */
        if (left) rotate_right(g); else rotate_left(g);
        log_case(3);
    }
    root->red = 0;
}

void insert(int v) {
    Node *z = malloc(sizeof *z);
    z->val = v; z->red = 1; /* 新節點一律為紅色 */
    z->left = z->right = NIL;
    Node *y = NIL, *x = root;
    while (x != NIL) { y = x; x = v < x->val ? x->left : x->right; }
    z->parent = y;
    if (y == NIL) root = z;
    else if (v < y->val) y->left = z;
    else y->right = z;
    logbuf[0] = 0;
    fix(z);
}

/* 回傳黑高（含 NIL）；若違反紅黑性質則回傳 -1 */
int black_height(Node *n) {
    if (n == NIL) return 1;
    if (n->red && (n->left->red || n->right->red)) return -1;
    int l = black_height(n->left), r = black_height(n->right);
    if (l < 0 || l != r) return -1;
    return l + (n->red ? 0 : 1);
}

/* 值後面標 R／B 表示紅／黑；括號內為 (左子樹,右子樹) */
void fmt(Node *n) {
    if (n == NIL) { printf("-"); return; }
    printf("%d%c", n->val, n->red ? 'R' : 'B');
    if (n->left != NIL || n->right != NIL) { printf("("); fmt(n->left); printf(","); fmt(n->right); printf(")"); }
}

int main(void) {
    int vals[] = {41, 38, 31, 12, 19, 8, 45, 50, 55};
    for (int i = 0; i < 9; i++) {
        insert(vals[i]);
        printf("insert %d: ", vals[i]); fmt(root);
        if (logbuf[0]) printf("   [%s]", logbuf);
        printf("\n");
    }
    int qs[] = {19, 40};
    for (int i = 0; i < 2; i++) {
        int found = 0, first = 1;
        printf("search %d: ", qs[i]);
        char path[128] = "";
        for (Node *c = root; c != NIL; c = qs[i] < c->val ? c->left : c->right) {
            char s[16];
            sprintf(s, first ? "%d" : " -> %d", c->val);
            strcat(path, s);
            first = 0;
            if (c->val == qs[i]) { found = 1; break; }
        }
        printf("%s, path %s\n", found ? "found" : "not found", path);
    }
    printf("black height = %d (-1 means invalid)\n", black_height(root));
    return 0;
}
