#include <iostream>
using namespace std;

struct Node { int key, pri; Node *left = nullptr, *right = nullptr; Node(int k, int p) : key(k), pri(p) {} };
long long seed = 2024;
// 與網頁相同的 Park–Miller 亂數，固定種子讓結果可重現
int rnd(int n) { seed = seed * 48271 % 2147483647; return int(seed % n); }

Node *rotRight(Node *n) { Node *l = n->left; n->left = l->right; l->right = n; return l; }
Node *rotLeft(Node *n) { Node *r = n->right; n->right = r->left; r->left = n; return r; }

// 依 BST 插到葉子，回溯時若子節點優先權較高就旋轉上來（最大堆積）
Node *insert(Node *n, int key) {
    if (!n) return new Node(key, rnd(100));
    if (key == n->key) return n;
    if (key < n->key) { n->left = insert(n->left, key); if (n->left->pri > n->pri) n = rotRight(n); }
    else { n->right = insert(n->right, key); if (n->right->pri > n->pri) n = rotLeft(n); }
    return n;
}
// 把節點往優先權較高的子節點方向轉下去，直到最多一個子節點再移除
Node *erase(Node *n, int key) {
    if (!n) return nullptr;
    if (key < n->key) n->left = erase(n->left, key);
    else if (key > n->key) n->right = erase(n->right, key);
    else {
        if (!n->left || !n->right) { Node *c = n->left ? n->left : n->right; delete n; return c; }
        if (n->left->pri > n->right->pri) { n = rotRight(n); n->right = erase(n->right, key); }
        else { n = rotLeft(n); n->left = erase(n->left, key); }
    }
    return n;
}
void pre(Node *n) { if (!n) return; cout << " " << n->key << "(p" << n->pri << ")"; pre(n->left); pre(n->right); }
void in(Node *n) { if (!n) return; in(n->left); cout << " " << n->key; in(n->right); }

int main() {
    Node *root = nullptr;
    for (int k : {30, 15, 45, 8, 22, 37, 52}) root = insert(root, k);
    cout << "preorder:"; pre(root); cout << "\n";
    cout << "inorder :"; in(root); cout << "\n";
    root = erase(root, 30);
    root = erase(root, 8);
    cout << "after delete 30, 8:"; pre(root); cout << "\n";
    cout << "inorder :"; in(root); cout << "\n";
}
