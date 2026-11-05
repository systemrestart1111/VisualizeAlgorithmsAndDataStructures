#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int v, Node* n) : val(v), next(n) {}
};

void printList(const char* label, Node* h) {
    cout << label;
    for (; h; h = h->next) cout << h->val << (h->next ? " -> " : "\n");
}

// 在位置 i 插入：找到第 i-1 個節點，新節點先接上後繼，再讓前驅指向新節點
Node* insertAt(Node* head, int i, int v) {
    if (i == 0) return new Node(v, head);
    Node* prev = head;
    for (int k = 0; k < i - 1; k++) prev = prev->next;
    prev->next = new Node(v, prev->next);
    return head;
}

// 刪除位置 i：讓前驅直接跳過該節點
Node* deleteAt(Node* head, int i) {
    Node* del;
    if (i == 0) { del = head; head = head->next; }
    else {
        Node* prev = head;
        for (int k = 0; k < i - 1; k++) prev = prev->next;
        del = prev->next;
        prev->next = del->next;
    }
    delete del;
    return head;
}

int main() {
    vector<int> vals = {10, 20, 30, 40, 50};
    Node* head = nullptr;
    for (int i = (int)vals.size() - 1; i >= 0; i--) head = new Node(vals[i], head);
    head = insertAt(head, 2, 99);
    printList("insert 99 at 2: ", head);
    head = deleteAt(head, 4);
    printList("delete at 4:   ", head);
}
