#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int v, Node* n) : val(v), next(n) {}
};

// 快慢指標：fast 一次走兩步、slow 一次走一步，fast 到尾時 slow 在中點
Node* middle(Node* head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}

int main() {
    vector<int> vals = {3, 7, 1, 9, 4, 8, 2};
    Node* head = nullptr;
    for (int i = (int)vals.size() - 1; i >= 0; i--) head = new Node(vals[i], head);
    cout << "middle = " << middle(head)->val << "\n";
}
