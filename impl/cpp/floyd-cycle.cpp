#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Node {
    int val;
    Node* next = nullptr;
};

Node* buildWithCycle(const vector<int>& vals, int pos) {
    Node* nodes = new Node[vals.size()];
    for (size_t i = 0; i < vals.size(); i++) {
        nodes[i].val = vals[i];
        if (i + 1 < vals.size()) nodes[i].next = &nodes[i + 1];
    }
    if (pos >= 0) nodes[vals.size() - 1].next = &nodes[pos];  // 尾端接回第 pos 個節點形成環
    return nodes;
}

// 龜兔賽跑：兔子一次兩步、烏龜一次一步；有環時兩者必定相遇
string hasCycle(Node* head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return "(True, " + to_string(slow->val) + ")";
    }
    return "(False, None)";
}

int main() {
    vector<int> vals = {3, 8, 1, 6, 9, 4, 7, 2, 5};
    cout << "pos 3: " << hasCycle(buildWithCycle(vals, 3)) << "\n";
    cout << "pos -1: " << hasCycle(buildWithCycle(vals, -1)) << "\n";
}
