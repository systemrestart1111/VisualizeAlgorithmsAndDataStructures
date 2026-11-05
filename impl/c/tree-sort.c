#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int key; struct Node *left, *right; } Node;

/* 插入二元搜尋樹：小於往左、其餘往右 */
Node *insert(Node *root, int key) {
    if (!root) {
        Node *n = malloc(sizeof *n);
        n->key = key; n->left = n->right = NULL;
        return n;
    }
    if (key < root->key) root->left = insert(root->left, key);
    else root->right = insert(root->right, key);
    return root;
}

/* 中序走訪 BST 會得到遞增序列 */
void inorder(Node *root, int *out, int *k) {
    if (!root) return;
    inorder(root->left, out, k);
    out[(*k)++] = root->key;
    inorder(root->right, out, k);
    free(root);
}

int main(void) {
    int a[] = {50, 30, 70, 20, 40, 60, 80, 35, 65, 10, 45}, out[11], k = 0;
    int n = sizeof a / sizeof a[0];
    Node *root = NULL;
    for (int i = 0; i < n; i++) root = insert(root, a[i]);
    inorder(root, out, &k);
    for (int i = 0; i < n; i++) printf("%d%c", out[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
