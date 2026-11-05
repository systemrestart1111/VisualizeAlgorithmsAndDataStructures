#include <algorithm>
#include <iostream>
using namespace std;

struct Node { int key, h = 1, size = 1; Node *left = nullptr, *right = nullptr; Node(int k) : key(k) {} };
int H(Node *n) { return n ? n->h : 0; }
int S(Node *n) { return n ? n->size : 0; }
void fix(Node *n) { n->h = 1 + max(H(n->left), H(n->right)); n->size = 1 + S(n->left) + S(n->right); }
Node *rotRight(Node *n) { Node *l = n->left; n->left = l->right; l->right = n; fix(n); fix(l); return l; }
Node *rotLeft(Node *n) { Node *r = n->right; n->right = r->left; r->left = n; fix(n); fix(r); return r; }

// AVL 平衡；旋轉後重新計算子樹大小
Node *balance(Node *n) {
    fix(n);
    if (H(n->left) - H(n->right) > 1) { if (H(n->left->left) < H(n->left->right)) n->left = rotLeft(n->left); return rotRight(n); }
    if (H(n->right) - H(n->left) > 1) { if (H(n->right->right) < H(n->right->left)) n->right = rotRight(n->right); return rotLeft(n); }
    return n;
}
Node *insert(Node *n, int k) {
    if (!n) return new Node(k);
    if (k < n->key) n->left = insert(n->left, k); else n->right = insert(n->right, k);
    return balance(n);
}
Node *erase(Node *n, int k) {
    if (!n) return nullptr;
    if (k < n->key) n->left = erase(n->left, k);
    else if (k > n->key) n->right = erase(n->right, k);
    else {
        if (!n->left || !n->right) { Node *c = n->left ? n->left : n->right; delete n; return c; }
        Node *m = n->right;
        while (m->left) m = m->left;
        n->key = m->key;
        n->right = erase(n->right, m->key);
    }
    return balance(n);
}
// 第 k 小（1 起算）：比較 k 與左子樹大小
int select(Node *n, int k) {
    while (n) {
        int ls = S(n->left);
        if (k == ls + 1) return n->key;
        if (k <= ls) n = n->left; else { k -= ls + 1; n = n->right; }
    }
    return -1;
}
// 比 x 小的個數 + 1
int rankOf(Node *n, int x) {
    int r = 0;
    while (n) { if (x <= n->key) n = n->left; else { r += S(n->left) + 1; n = n->right; } }
    return r + 1;
}
void all(const char *label, Node *root) { cout << label; for (int k = 1; k <= S(root); k++) cout << " " << select(root, k); cout << "\n"; }

int main() {
    Node *root = nullptr;
    for (int k : {20, 10, 30, 5, 15, 25, 40, 12, 35, 1}) root = insert(root, k);
    all("select 1..n:", root);
    cout << "rank 13 = " << rankOf(root, 13) << " | rank 26 = " << rankOf(root, 26) << " | rank 0 = " << rankOf(root, 0) << "\n";
    cout << "root: " << root->key << " size " << root->size << " height " << root->h << "\n";
    root = erase(root, 20);
    root = erase(root, 5);
    all("after delete 20, 5:", root);
    cout << "select 4 = " << select(root, 4) << " | rank 30 = " << rankOf(root, 30) << "\n";
}
