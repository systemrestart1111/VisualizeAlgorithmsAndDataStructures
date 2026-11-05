#include <algorithm>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;

struct Node {
    int val, h = 1;
    Node *left = nullptr, *right = nullptr;
    explicit Node(int v) : val(v) {}
};

class AVL {
    int height(Node* n) const { return n ? n->h : 0; }
    void update(Node* n) { n->h = 1 + max(height(n->left), height(n->right)); }
    // 平衡因子 = 左子樹高 − 右子樹高，AVL 要求它在 −1..1 之間
    int balance(Node* n) const { return height(n->left) - height(n->right); }

    Node* rotateRight(Node* y) {
        Node* x = y->left;
        y->left = x->right; x->right = y;
        update(y); update(x);
        return x;
    }
    Node* rotateLeft(Node* x) {
        Node* y = x->right;
        x->right = y->left; y->left = x;
        update(x); update(y);
        return y;
    }
    Node* rebalance(Node* n) {
        update(n);
        int b = balance(n);
        if (b > 1) {
            if (balance(n->left) < 0) { log.push_back("LR at " + to_string(n->val)); n->left = rotateLeft(n->left); }
            else log.push_back("LL at " + to_string(n->val));
            return rotateRight(n);
        }
        if (b < -1) {
            if (balance(n->right) > 0) { log.push_back("RL at " + to_string(n->val)); n->right = rotateRight(n->right); }
            else log.push_back("RR at " + to_string(n->val));
            return rotateLeft(n);
        }
        return n;
    }
    Node* insertAt(Node* n, int v) {
        if (!n) return new Node(v);
        if (v < n->val) n->left = insertAt(n->left, v);
        else if (v > n->val) n->right = insertAt(n->right, v);
        else return n;
        return rebalance(n);  // 遞迴返回時就是「沿路往上」檢查
    }
    Node* removeAt(Node* n, int v) {
        if (!n) return nullptr;
        if (v < n->val) n->left = removeAt(n->left, v);
        else if (v > n->val) n->right = removeAt(n->right, v);
        else {
            if (!n->left || !n->right) {
                Node* child = n->left ? n->left : n->right;
                delete n;
                return child;
            }
            Node* s = n->right;
            while (s->left) s = s->left;
            n->val = s->val;
            n->right = removeAt(n->right, s->val);
        }
        return rebalance(n);
    }

public:
    Node* root = nullptr;
    vector<string> log;  // 本次操作發生的旋轉

    void insert(int v) { log.clear(); root = insertAt(root, v); }
    void remove(int v) { log.clear(); root = removeAt(root, v); }
    int height() const { return height(root); }
};

// 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
string fmt(Node* n) {
    if (!n) return "-";
    if (!n->left && !n->right) return to_string(n->val);
    return to_string(n->val) + "(" + fmt(n->left) + "," + fmt(n->right) + ")";
}

void report(const char* op, int v, const AVL& t) {
    string s = fmt(t.root);
    if (!t.log.empty()) {
        s += "   [";
        for (size_t i = 0; i < t.log.size(); i++) s += (i ? ", " : "") + t.log[i];
        s += "]";
    }
    printf("%s %2d: %s\n", op, v, s.c_str());
}

int main() {
    AVL t;
    for (int v : {40, 20, 60, 10, 30, 50, 70, 25, 27, 5, 4}) { t.insert(v); report("insert", v, t); }
    for (int v : {50, 70, 60}) { t.remove(v); report("delete", v, t); }
    printf("height = %d\n", t.height());
}
