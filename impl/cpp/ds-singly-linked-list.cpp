#include <iostream>
#include <string>
using namespace std;

// 每個節點只記得下一個；頭部插入刪除 O(1)，找特定位置要從頭走 O(n)
class SinglyLinkedList {
    struct Node {
        int val;
        Node* next;
    };
    Node* head = nullptr;

public:
    int size = 0;
    ~SinglyLinkedList() { while (head) { Node* n = head->next; delete head; head = n; } }
    void pushFront(int v) { head = new Node{v, head}; size++; }
    void pushBack(int v) {
        if (!head) { pushFront(v); return; }
        Node* cur = head;
        while (cur->next) cur = cur->next;
        cur->next = new Node{v, nullptr};
        size++;
    }
    // 刪除第一個值為 v 的節點：讓前一個節點跳過它
    bool remove(int v) {
        Node *prev = nullptr, *cur = head;
        while (cur && cur->val != v) { prev = cur; cur = cur->next; }
        if (!cur) return false;
        (prev ? prev->next : head) = cur->next;
        delete cur;
        size--;
        return true;
    }
    int find(int v) const {
        int i = 0;
        for (Node* cur = head; cur; cur = cur->next, i++) if (cur->val == v) return i;
        return -1;
    }
    string str() const {
        string s;
        for (Node* cur = head; cur; cur = cur->next) s += to_string(cur->val) + " -> ";
        return s + "null";
    }
};

int main() {
    SinglyLinkedList l;
    for (int v : {3, 7, 1}) l.pushBack(v);
    cout << "init:         " << l.str() << "\n";
    l.pushFront(9); cout << "push_front 9: " << l.str() << "\n";
    l.pushBack(4); cout << "push_back 4:  " << l.str() << "\n";
    bool ok = l.remove(7);
    cout << "remove 7:     " << (ok ? "True" : "False") << " " << l.str() << "\n";
    cout << "find 1 -> " << l.find(1) << "  find 8 -> " << l.find(8) << "  size = " << l.size << "\n";
}
