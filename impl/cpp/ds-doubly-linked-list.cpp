#include <iostream>
#include <string>
using namespace std;

// 每個節點同時記得前後；有 head 與 tail，兩端插入刪除都是 O(1)，也能反向走訪
class DoublyLinkedList {
    struct Node {
        int val;
        Node *prev = nullptr, *next = nullptr;
        explicit Node(int v) : val(v) {}
    };
    Node *head = nullptr, *tail = nullptr;

    // 把節點 n 從前後鄰居之間拿掉
    int unlink(Node* n) {
        (n->prev ? n->prev->next : head) = n->next;
        (n->next ? n->next->prev : tail) = n->prev;
        int v = n->val;
        delete n;
        return v;
    }

public:
    ~DoublyLinkedList() { while (head) unlink(head); }
    void pushFront(int v) {
        Node* n = new Node(v);
        n->next = head;
        (head ? head->prev : tail) = n;
        head = n;
    }
    void pushBack(int v) {
        Node* n = new Node(v);
        n->prev = tail;
        (tail ? tail->next : head) = n;
        tail = n;
    }
    int popFront() { return unlink(head); }
    int popBack() { return unlink(tail); }
    bool remove(int v) {
        Node* cur = head;
        while (cur && cur->val != v) cur = cur->next;
        if (!cur) return false;
        unlink(cur);
        return true;
    }
    string str() const {
        string s = head ? "" : "(empty)";
        for (Node* c = head; c; c = c->next) s += to_string(c->val) + (c->next ? " <-> " : "");
        s += "   | backward:";
        for (Node* c = tail; c; c = c->prev) s += " " + to_string(c->val);
        return s;
    }
};

int main() {
    DoublyLinkedList d;
    for (int v : {10, 20, 30}) d.pushBack(v);
    cout << "init:          " << d.str() << "\n";
    d.pushFront(5); cout << "push_front 5:  " << d.str() << "\n";
    d.pushBack(40); cout << "push_back 40:  " << d.str() << "\n";
    int v = d.popFront(); cout << "pop_front -> " << v << " " << d.str() << "\n";
    v = d.popBack(); cout << "pop_back  -> " << v << " " << d.str() << "\n";
    bool ok = d.remove(20); cout << "remove 20:     " << (ok ? "True" : "False") << " " << d.str() << "\n";
}
