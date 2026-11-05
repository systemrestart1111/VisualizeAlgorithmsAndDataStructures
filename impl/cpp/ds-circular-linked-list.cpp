#include <iostream>
#include <string>
using namespace std;

// 尾節點的 next 指回頭節點；只要記住 tail，就能 O(1) 取得頭（tail->next）並在兩端插入
class CircularLinkedList {
    struct Node {
        int val;
        Node* next;
    };
    Node* tail = nullptr;

public:
    void insertBack(int v) {
        Node* n = new Node{v, nullptr};
        if (!tail) n->next = n;
        else { n->next = tail->next; tail->next = n; }
        tail = n;
    }
    bool remove(int v) {
        if (!tail) return false;
        Node *prev = tail, *cur = tail->next;
        do {
            if (cur->val == v) {
                if (cur == prev) tail = nullptr;  // 只剩一個節點
                else {
                    prev->next = cur->next;
                    if (cur == tail) tail = prev;
                }
                delete cur;
                return true;
            }
            prev = cur;
            cur = cur->next;
        } while (cur != tail->next);
        return false;
    }
    // 把頭移到尾：只要 tail 往前走一步
    void rotate() { if (tail) tail = tail->next; }
    string str() const {
        if (!tail) return "(empty)";
        string s;
        for (Node* cur = tail->next;; cur = cur->next) {
            s += to_string(cur->val) + " -> ";
            if (cur == tail) break;
        }
        return s + "(back to " + to_string(tail->next->val) + ")";
    }
};

int main() {
    CircularLinkedList c;
    for (int v = 1; v <= 4; v++) c.insertBack(v);
    cout << "init:       " << c.str() << "\n";
    c.rotate(); cout << "rotate:     " << c.str() << "\n";
    bool ok = c.remove(3); cout << "remove 3:   " << (ok ? "True" : "False") << " " << c.str() << "\n";
    ok = c.remove(2); cout << "remove 2:   " << (ok ? "True" : "False") << " " << c.str() << "\n";
    c.insertBack(5); cout << "insert 5:   " << c.str() << "\n";
}
