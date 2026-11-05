#include <iostream>
#include <string>
#include <vector>
using namespace std;

// 固定大小的環狀緩衝區：head、tail 走到陣列尾端就繞回 0，空間可重複使用
class CircularQueue {
    vector<int> buf;
    vector<bool> used;
    int head = 0, size = 0;

public:
    explicit CircularQueue(int cap) : buf(cap), used(cap, false) {}
    bool enqueue(int v) {
        if (size == (int)buf.size()) return false;  // 已滿
        int i = (head + size) % buf.size();
        buf[i] = v;
        used[i] = true;
        size++;
        return true;
    }
    int dequeue() {
        int v = buf[head];
        used[head] = false;
        head = (head + 1) % buf.size();
        size--;
        return v;
    }
    string str() const {
        string s = "buffer [";
        for (size_t i = 0; i < buf.size(); i++) s += (i ? " " : "") + (used[i] ? to_string(buf[i]) : string("."));
        return s + "] head=" + to_string(head) + " size=" + to_string(size);
    }
};

int main() {
    CircularQueue q(5);
    for (int v = 1; v <= 4; v++) q.enqueue(v);
    cout << "enqueue 1..4:  " << q.str() << "\n";
    int a = q.dequeue(), b = q.dequeue();
    cout << "dequeue -> " << a << " " << b << "  " << q.str() << "\n";
    for (int v = 5; v <= 7; v++) {
        bool ok = q.enqueue(v);
        cout << "enqueue " << v << ": " << (ok ? "ok  " : "full") << " " << q.str() << "\n";
    }
    a = q.dequeue();
    cout << "dequeue -> " << a << "  " << q.str() << "\n";
}
