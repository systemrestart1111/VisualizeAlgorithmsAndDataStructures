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

// BFS：用佇列一層一層處理，每層開始時佇列長度就是這一層的節點數
int main() {
    queue<Node*> q;
    q.push(buildLevel({1, 2, 3, 4, 5, 6, 7, NUL, 8, 9, NUL, NUL, 10}));
    for (int d = 0; !q.empty(); d++) {
        cout << "level " << d << ":";
        for (size_t size = q.size(); size > 0; size--) {
            Node* n = q.front();
            q.pop();
            cout << " " << n->val;
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        cout << "\n";
    }
}
