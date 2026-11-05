#include <iostream>
#include <string>
using namespace std;

// 先進先出（FIFO）：用鏈結串列，從尾端 enqueue、從頭端 dequeue，都是 O(1)
class Queue {
    struct Node {
        char val;
        Node* next;
    };
    Node *head = nullptr, *tail = nullptr;

public:
    void enqueue(char v) {
        Node* n = new Node{v, nullptr};
        (tail ? tail->next : head) = n;
        tail = n;
    }
    char dequeue() {
        Node* n = head;
        char v = n->val;
        head = n->next;
        if (!head) tail = nullptr;
        delete n;
        return v;
    }
    string str() const {
        string s = "front [";
        for (Node* c = head; c; c = c->next) s += string(c == head ? "" : " ") + c->val;
        return s + "] rear";
    }
};

int main() {
    Queue q;
    for (char v : {'A', 'B', 'C'}) { q.enqueue(v); cout << "enqueue " << v << ": " << q.str() << "\n"; }
    char v = q.dequeue(); cout << "dequeue -> " << v << ": " << q.str() << "\n";
    q.enqueue('D'); cout << "enqueue D: " << q.str() << "\n";
    v = q.dequeue(); cout << "dequeue -> " << v << ": " << q.str() << "\n";
}
