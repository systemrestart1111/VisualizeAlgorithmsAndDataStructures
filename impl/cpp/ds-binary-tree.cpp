#include <cstdio>
#include <queue>
#include <string>
#include <vector>
using namespace std;

struct Node {
    int val;
    Node *left = nullptr, *right = nullptr, *parent;
    Node(int v, Node* p) : val(v), parent(p) {}
};

// 依層序插入，形狀維持完全二元樹；刪除時以最深最右的節點補位
class BinaryTree {
public:
    Node* root = nullptr;

    vector<Node*> levelOrder() const {
        vector<Node*> out;
        queue<Node*> q;
        if (root) q.push(root);
        while (!q.empty()) {
            Node* n = q.front(); q.pop();
            out.push_back(n);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        return out;
    }
    void insert(int v) {
        if (!root) { root = new Node(v, nullptr); return; }
        for (Node* n : levelOrder()) {  // 第一個缺少子節點的位置
            if (!n->left) { n->left = new Node(v, n); return; }
            if (!n->right) { n->right = new Node(v, n); return; }
        }
    }
    bool remove(int v) {
        vector<Node*> nodes = levelOrder();
        Node* target = nullptr;
        for (Node* n : nodes) if (n->val == v) { target = n; break; }
        if (!target) return false;
        Node *deepest = nodes.back(), *p = deepest->parent;
        target->val = deepest->val;
        if (!p) root = nullptr;
        else if (p->right == deepest) p->right = nullptr;
        else p->left = nullptr;
        delete deepest;
        return true;
    }
};

void preorder(Node* n, vector<int>& out) { if (n) { out.push_back(n->val); preorder(n->left, out); preorder(n->right, out); } }
void inorder(Node* n, vector<int>& out) { if (n) { inorder(n->left, out); out.push_back(n->val); inorder(n->right, out); } }
void postorder(Node* n, vector<int>& out) { if (n) { postorder(n->left, out); postorder(n->right, out); out.push_back(n->val); } }

// 括號表示法：值(左子樹,右子樹)，空子樹寫成 -
string fmt(Node* n) {
    if (!n) return "-";
    if (!n->left && !n->right) return to_string(n->val);
    return to_string(n->val) + "(" + fmt(n->left) + "," + fmt(n->right) + ")";
}

void show(const char* name, const vector<int>& vals) {
    printf("%-10s", name);
    for (int v : vals) printf(" %d", v);
    printf("\n");
}

vector<int> levelVals(const BinaryTree& t) {
    vector<int> out;
    for (Node* n : t.levelOrder()) out.push_back(n->val);
    return out;
}

int main() {
    BinaryTree t;
    for (int v = 1; v <= 8; v++) t.insert(v);
    printf("insert 1..8: %s\n", fmt(t.root).c_str());
    vector<int> a, b, c;
    preorder(t.root, a); inorder(t.root, b); postorder(t.root, c);
    show("preorder:", a); show("inorder:", b); show("postorder:", c);
    show("level:", levelVals(t));
    t.remove(2);
    printf("delete 2: %s\n", fmt(t.root).c_str());
    show("level:", levelVals(t));
}
