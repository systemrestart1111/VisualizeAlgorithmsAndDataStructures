#include <cstdio>
#include <string>
#include <utility>
#include <vector>
using namespace std;

struct Node {
    int val;
    bool red;
    Node *left, *right, *parent;
};

// CLRS 版本：以一個黑色哨兵 NIL 代替所有空指標，插入後以「變色 + 旋轉」修復
class RedBlackTree {
    void rotateLeft(Node* x) {
        Node* y = x->right;
        x->right = y->left;
        if (y->left != NIL) y->left->parent = x;
        y->parent = x->parent;
        if (x->parent == NIL) root = y;
        else if (x == x->parent->left) x->parent->left = y;
        else x->parent->right = y;
        y->left = x; x->parent = y;
    }
    void rotateRight(Node* x) {
        Node* y = x->left;
        x->left = y->right;
        if (y->right != NIL) y->right->parent = x;
        y->parent = x->parent;
        if (x->parent == NIL) root = y;
        else if (x == x->parent->right) x->parent->right = y;
        else x->parent->left = y;
        y->right = x; x->parent = y;
    }
    vector<string> fix(Node* z) {
        vector<string> log;
        while (z->parent->red) {  // 違反「紅節點的子節點必為黑」
            Node* g = z->parent->parent;
            bool left = z->parent == g->left;
            Node* u = left ? g->right : g->left;
            if (u->red) {  // Case 1：叔叔紅 → 父、叔變黑，祖父變紅，往上繼續
                z->parent->red = u->red = false;
                g->red = true;
                z = g;
                log.push_back("case 1");
                continue;
            }
            if (z == (left ? z->parent->right : z->parent->left)) {  // Case 2：內側 → 轉成外側
                z = z->parent;
                if (left) rotateLeft(z); else rotateRight(z);
                log.push_back("case 2");
            }
            z->parent->red = false; g->red = true;  // Case 3：外側 → 變色後旋轉祖父
            if (left) rotateRight(g); else rotateLeft(g);
            log.push_back("case 3");
        }
        root->red = false;
        return log;
    }

public:
    Node* NIL;
    Node* root;

    RedBlackTree() {
        NIL = new Node{0, false, nullptr, nullptr, nullptr};
        NIL->left = NIL->right = NIL->parent = NIL;
        root = NIL;
    }
    vector<string> insert(int v) {
        Node* z = new Node{v, true, NIL, NIL, NIL};  // 新節點一律為紅色
        Node *y = NIL, *x = root;
        while (x != NIL) { y = x; x = v < x->val ? x->left : x->right; }
        z->parent = y;
        if (y == NIL) root = z;
        else if (v < y->val) y->left = z;
        else y->right = z;
        return fix(z);
    }
    pair<bool, vector<int>> search(int v) const {
        vector<int> path;
        for (Node* c = root; c != NIL; c = v < c->val ? c->left : c->right) {
            path.push_back(c->val);
            if (v == c->val) return {true, path};
        }
        return {false, path};
    }
    // 回傳黑高（含 NIL）；若違反紅黑性質則回傳 -1
    int blackHeight(Node* n) const {
        if (n == NIL) return 1;
        if (n->red && (n->left->red || n->right->red)) return -1;
        int l = blackHeight(n->left), r = blackHeight(n->right);
        if (l < 0 || l != r) return -1;
        return l + (n->red ? 0 : 1);
    }
    // 值後面標 R／B 表示紅／黑；括號內為 (左子樹,右子樹)
    string fmt(Node* n) const {
        if (n == NIL) return "-";
        string s = to_string(n->val) + (n->red ? "R" : "B");
        if (n->left == NIL && n->right == NIL) return s;
        return s + "(" + fmt(n->left) + "," + fmt(n->right) + ")";
    }
};

int main() {
    RedBlackTree t;
    for (int v : {41, 38, 31, 12, 19, 8, 45, 50, 55}) {
        vector<string> log = t.insert(v);
        string s = t.fmt(t.root);
        if (!log.empty()) {
            s += "   [";
            for (size_t i = 0; i < log.size(); i++) s += (i ? ", " : "") + log[i];
            s += "]";
        }
        printf("insert %d: %s\n", v, s.c_str());
    }
    for (int v : {19, 40}) {
        auto r = t.search(v);
        printf("search %d: %s, path ", v, r.first ? "found" : "not found");
        for (size_t j = 0; j < r.second.size(); j++) printf(j ? " -> %d" : "%d", r.second[j]);
        printf("\n");
    }
    printf("black height = %d (-1 means invalid)\n", t.blackHeight(t.root));
}
