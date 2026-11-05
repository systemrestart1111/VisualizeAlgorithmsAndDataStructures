#include <iostream>
using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int v, Node* n) : val(v), next(n) {}
};

// 三個指標 prev / cur / nxt：逐一把 cur->next 改指向前一個節點
Node* reverseList(Node* head) {
    Node *prev = nullptr, *cur = head;
    while (cur) {
        Node* nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}

int main() {
    Node* head = nullptr;
    for (int v = 6; v >= 1; v--) head = new Node(v, head);
    head = reverseList(head);
    for (Node* p = head; p; p = p->next) cout << p->val << (p->next ? " -> " : "\n");
}
