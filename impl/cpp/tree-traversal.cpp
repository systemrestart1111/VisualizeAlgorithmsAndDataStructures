#include <iostream>
#include <queue>
#include <vector>
using namespace std;

struct Node {
    int val;
    Node *left = nullptr, *right = nullptr;
    explicit Node(int v) : val(v) {}
};
const int NUL = -1;

// 依層序建樹，-1 表示空節點
Node* buildLevel(const vector<int>& tok) {
    Node* root = new Node(tok[0]);
    queue<Node*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tok.size()) {
        Node* n = q.front();
        q.pop();
        for (int side = 0; side < 2 && i < tok.size(); side++, i++) {
            if (tok[i] == NUL) continue;
            Node* c = new Node(tok[i]);
            (side == 0 ? n->left : n->right) = c;
            q.push(c);
        }
    }
    return root;
}

void pre(Node* n) { if (!n) return; cout << " " << n->val; pre(n->left); pre(n->right); }   // 根 → 左 → 右
void in(Node* n) { if (!n) return; in(n->left); cout << " " << n->val; in(n->right); }      // 左 → 根 → 右
void post(Node* n) { if (!n) return; post(n->left); post(n->right); cout << " " << n->val; } // 左 → 右 → 根

int main() {
    Node* root = buildLevel({1, 2, 3, 4, 5, 6, 7, NUL, 8, 9, NUL, NUL, 10});
    cout << "pre:"; pre(root); cout << "\n";
    cout << "in:"; in(root); cout << "\n";
    cout << "post:"; post(root); cout << "\n";
}
