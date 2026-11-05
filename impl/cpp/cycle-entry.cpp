#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int val;
    Node* next;
};

// 相遇後把一個指標放回起點，兩者都改成一次一步，再次相遇處就是環的入口
Node* cycleEntry(Node* head, int& length) {
    Node *slow = head, *fast = head;
    for (;;) {
        if (!fast || !fast->next) { length = 0; return nullptr; }
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) break;
    }
    Node* p = head;
    while (p != slow) { p = p->next; slow = slow->next; }
    length = 1;
    for (Node* q = p->next; q != p; q = q->next) length++;
    return p;
}

int main() {
    vector<int> vals = {3, 8, 1, 6, 9, 4, 7, 2, 5};
    vector<Node> nodes(vals.size());
    for (size_t i = 0; i < vals.size(); i++) nodes[i] = {vals[i], i + 1 < vals.size() ? &nodes[i + 1] : &nodes[3]};
    int len;
    Node* e = cycleEntry(&nodes[0], len);
    cout << "entry = " << e->val << " cycle length = " << len << "\n";
}
