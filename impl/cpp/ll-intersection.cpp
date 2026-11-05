#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int v, Node* n) : val(v), next(n) {}
};

Node* build(const vector<int>& v, Node* tail = nullptr) {
    Node* head = tail;
    for (int i = (int)v.size() - 1; i >= 0; i--) head = new Node(v[i], head);
    return head;
}

// 兩指標各走自己的串列，走到尾就跳到另一條的開頭；兩者走過的總長相同，會在交點相遇
Node* intersection(Node* a, Node* b) {
    Node *p = a, *q = b;
    while (p != q) {
        p = p ? p->next : b;
        q = q ? q->next : a;
    }
    return p;
}

int main() {
    Node* common = build({8, 10, 12});
    Node* node = intersection(build({4, 1, 7}, common), build({5, 6, 2, 9, 3}, common));
    if (node) cout << "intersection at " << node->val << "\n";
    else cout << "intersection at None\n";
}
