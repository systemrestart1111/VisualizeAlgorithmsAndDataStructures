#include <algorithm>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>
using namespace std;

struct Node {
    int w;
    Node *left = nullptr, *right = nullptr;
    explicit Node(int x) : w(x) {}
};
const int NUL = -1;

Node* build(const vector<int>& tok) {
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

// 回傳 (選 n 的最大權重, 不選 n 的最大權重)；選了 n 就不能選它的孩子
pair<int, int> solve(Node* n) {
    if (!n) return {0, 0};
    auto l = solve(n->left), r = solve(n->right);
    return {n->w + l.second + r.second, max(l.first, l.second) + max(r.first, r.second)};
}

int main() {
    auto res = solve(build({3, 4, 5, 1, 3, NUL, 1, 2, NUL, 6, NUL, 4}));  // 層序表示的二元樹，數字為權重
    cout << "take root: " << res.first << " skip root: " << res.second << "\n";
    cout << "max independent set weight = " << max(res.first, res.second) << "\n";
}
