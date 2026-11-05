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

// 不用堆疊的中序走訪：暫時把左子樹最右節點的 right 指回自己（線索），走完再拆掉，O(1) 額外空間
vector<int> morrisInorder(Node* cur) {
    vector<int> out;
    while (cur) {
        if (!cur->left) {
            out.push_back(cur->val);
            cur = cur->right;
        } else {
            Node* pre = cur->left;
            while (pre->right && pre->right != cur) pre = pre->right;
            if (!pre->right) { pre->right = cur; cur = cur->left; }  // 第一次到達：建立線索後往左
            else {                                                  // 第二次到達：拆除線索
                pre->right = nullptr;
                out.push_back(cur->val);
                cur = cur->right;
            }
        }
    }
    return out;
}

int main() {
    vector<int> r = morrisInorder(buildLevel({6, 3, 9, 1, 4, 8, 11, NUL, 2, NUL, 5, 7}));
    for (size_t i = 0; i < r.size(); i++) cout << r[i] << (i + 1 < r.size() ? ' ' : '\n');
}
