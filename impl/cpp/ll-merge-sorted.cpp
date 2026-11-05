#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int v, Node* n = nullptr) : val(v), next(n) {}
};

Node* build(const vector<int>& v) {
    Node* head = nullptr;
    for (int i = (int)v.size() - 1; i >= 0; i--) head = new Node(v[i], head);
    return head;
}

// 用虛擬頭節點 dummy；每次把較小的節點接到尾端
Node* merge(Node* a, Node* b) {
    Node dummy(0), *tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}

int main() {
    Node* h = merge(build({1, 4, 7, 10, 15}), build({2, 3, 8, 12, 20, 25}));
    for (; h; h = h->next) cout << h->val << (h->next ? " -> " : "\n");
}
