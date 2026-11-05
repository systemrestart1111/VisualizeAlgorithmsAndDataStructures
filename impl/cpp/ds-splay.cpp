#include <cstdio>
#include <string>
using namespace std;

struct Node {
    int val;
    Node *left = nullptr, *right = nullptr;
    explicit Node(int v) : val(v) {}
};

// 每次存取後都把該節點轉到根；不存任何平衡資訊，均攤 O(log n)
class SplayTree {
    static Node* rotateRight(Node* x) { Node* y = x->left; x->left = y->right; y->right = x; return y; }
    static Node* rotateLeft(Node* x) { Node* y = x->right; x->right = y->left; y->left = x; return y; }

    // 把 k 轉到根；k 不存在時，轉上來的是搜尋路徑上最後一個節點
    static Node* splay(Node* r, int k) {
        if (!r || r->val == k) return r;
        if (k < r->val) {
            if (!r->left) return r;
            if (k < r->left->val) {  // Zig-Zig（左左）：先轉祖父
                r->left->left = splay(r->left->left, k);
                r = rotateRight(r);
            } else if (k > r->left->val) {  // Zig-Zag（左右）
                r->left->right = splay(r->left->right, k);
                if (r->left->right) r->left = rotateLeft(r->left);
            }
            return r->left ? rotateRight(r) : r;
        }
        if (!r->right) return r;
        if (k > r->right->val) {  // Zig-Zig（右右）
            r->right->right = splay(r->right->right, k);
            r = rotateLeft(r);
        } else if (k < r->right->val) {  // Zig-Zag（右左）
            r->right->left = splay(r->right->left, k);
            if (r->right->left) r->right = rotateRight(r->right);
        }
        return r->right ? rotateLeft(r) : r;
    }

public:
    Node* root = nullptr;

    void insert(int k) {
        Node** p = &root;
        while (*p && (*p)->val != k) p = k < (*p)->val ? &(*p)->left : &(*p)->right;  // 先做一般 BST 插入
        if (!*p) *p = new Node(k);
        root = splay(root, k);
    }
    bool search(int k) {
        root = splay(root, k);
        return root && root->val == k;
    }
    bool remove(int k) {
        if (!search(k)) return false;
        Node* old = root;
        if (!root->left) root = root->right;
        else {
            Node* right = root->right;
            root = splay(root->left, k);  // 左子樹最大值轉到根，它沒有右子
            root->right = right;
        }
        delete old;
        return true;
    }
};

// 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
string fmt(Node* n) {
    if (!n) return "-";
    if (!n->left && !n->right) return to_string(n->val);
    return to_string(n->val) + "(" + fmt(n->left) + "," + fmt(n->right) + ")";
}

const char* b(bool x) { return x ? "True" : "False"; }

int main() {
    SplayTree t;
    for (int v : {50, 30, 70, 20, 40, 60, 80}) { t.insert(v); printf("insert %d: %s\n", v, fmt(t.root).c_str()); }
    for (int v : {40, 65}) { bool f = t.search(v); printf("search %d -> %s: %s\n", v, b(f), fmt(t.root).c_str()); }
    for (int v : {30, 99}) { bool ok = t.remove(v); printf("delete %d -> %s: %s\n", v, b(ok), fmt(t.root).c_str()); }
}
