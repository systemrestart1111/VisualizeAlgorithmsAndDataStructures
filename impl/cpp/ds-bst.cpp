#include <cstdio>
#include <string>
#include <utility>
#include <vector>
using namespace std;

struct Node {
    int val;
    Node *left = nullptr, *right = nullptr;
    explicit Node(int v) : val(v) {}
};

// 左子樹 < 節點 < 右子樹；搜尋、插入、刪除都只沿一條路徑往下
class BST {
    Node* removeAt(Node* n, int v) {
        if (!n) return nullptr;
        if (v < n->val) n->left = removeAt(n->left, v);
        else if (v > n->val) n->right = removeAt(n->right, v);
        else {
            if (!n->left || !n->right) {  // 葉節點或只有一個子節點
                Node* child = n->left ? n->left : n->right;
                delete n;
                return child;
            }
            Node* s = n->right;  // 兩個子節點：以中序後繼（右子樹最小值）取代
            while (s->left) s = s->left;
            n->val = s->val;
            n->right = removeAt(n->right, s->val);
        }
        return n;
    }

public:
    Node* root = nullptr;

    void insert(int v) {
        Node** p = &root;
        while (*p && (*p)->val != v) p = v < (*p)->val ? &(*p)->left : &(*p)->right;
        if (!*p) *p = new Node(v);
    }
    pair<bool, vector<int>> search(int v) const {
        vector<int> path;
        for (Node* c = root; c; c = v < c->val ? c->left : c->right) {
            path.push_back(c->val);
            if (v == c->val) return {true, path};
        }
        return {false, path};
    }
    pair<int, int> minMax() const {
        Node *lo = root, *hi = root;
        while (lo->left) lo = lo->left;
        while (hi->right) hi = hi->right;
        return {lo->val, hi->val};
    }
    void remove(int v) { root = removeAt(root, v); }
};

string inorder(Node* n) { return n ? inorder(n->left) + " " + to_string(n->val) + inorder(n->right) : ""; }

// 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
string fmt(Node* n) {
    if (!n) return "-";
    if (!n->left && !n->right) return to_string(n->val);
    return to_string(n->val) + "(" + fmt(n->left) + "," + fmt(n->right) + ")";
}

int main() {
    BST t;
    for (int v : {50, 30, 70, 20, 40, 60, 80, 35, 65}) t.insert(v);
    printf("build: %s\n", fmt(t.root).c_str());
    printf("inorder:%s\n", inorder(t.root).c_str());
    for (int v : {65, 45}) {
        auto r = t.search(v);
        printf("search %d: %s, path ", v, r.first ? "found" : "not found");
        for (size_t j = 0; j < r.second.size(); j++) printf(j ? " -> %d" : "%d", r.second[j]);
        printf("\n");
    }
    auto mm = t.minMax();
    printf("min = %d, max = %d\n", mm.first, mm.second);
    pair<int, const char*> dels[] = {{20, "leaf"}, {30, "one child"}, {50, "two children"}};
    for (auto& d : dels) {
        t.remove(d.first);
        printf("delete %d (%s): %s\n", d.first, d.second, fmt(t.root).c_str());
    }
    printf("inorder:%s\n", inorder(t.root).c_str());
}
