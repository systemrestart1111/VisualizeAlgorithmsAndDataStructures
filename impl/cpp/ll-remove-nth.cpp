#include <iostream>
using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int v, Node* n) : val(v), next(n) {}
};

// fast 先走 k 步，之後 fast、slow 一起走；fast 到尾時 slow->next 就是倒數第 k 個
Node* removeKthFromEnd(Node* head, int k, int& removed) {
    Node dummy(0, head), *fast = &dummy, *slow = &dummy;
    for (int i = 0; i < k; i++) fast = fast->next;
    while (fast->next) { fast = fast->next; slow = slow->next; }
    Node* del = slow->next;
    removed = del->val;
    slow->next = del->next;
    delete del;
    return dummy.next;
}

int main() {
    Node* head = nullptr;
    for (int v = 70; v >= 10; v -= 10) head = new Node(v, head);
    int removed;
    head = removeKthFromEnd(head, 3, removed);
    cout << "removed " << removed << " : ";
    for (Node* p = head; p; p = p->next) cout << p->val << (p->next ? " -> " : "\n");
}
