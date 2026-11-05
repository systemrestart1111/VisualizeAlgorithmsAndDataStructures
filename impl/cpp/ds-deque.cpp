#include <iostream>
#include <string>
#include <vector>
using namespace std;

// 雙端佇列：用環狀陣列實作，兩端都能 O(1) 加入與移除；滿了就把容量加倍
class Deque {
    vector<int> buf = vector<int>(4);
    int head = 0, size = 0;

    void grow() {
        vector<int> nb(buf.size() * 2);
        for (int i = 0; i < size; i++) nb[i] = buf[(head + i) % buf.size()];
        buf = nb;
        head = 0;
    }

public:
    void pushFront(int v) {
        if (size == (int)buf.size()) grow();
        head = (head - 1 + (int)buf.size()) % buf.size();
        buf[head] = v;
        size++;
    }
    void pushBack(int v) {
        if (size == (int)buf.size()) grow();
        buf[(head + size) % buf.size()] = v;
        size++;
    }
    int popFront() {
        int v = buf[head];
        head = (head + 1) % buf.size();
        size--;
        return v;
    }
    int popBack() { size--; return buf[(head + size) % buf.size()]; }
    string str() const {
        string s = "[";
        for (int i = 0; i < size; i++) s += (i ? " " : "") + to_string(buf[(head + i) % buf.size()]);
        return s + "] cap=" + to_string(buf.size());
    }
};

int main() {
    Deque d;
    d.pushBack(1); d.pushBack(2); d.pushFront(0);
    cout << "push_back 1, push_back 2, push_front 0: " << d.str() << "\n";
    d.pushFront(-1); d.pushBack(3);
    cout << "push_front -1, push_back 3: " << d.str() << "\n";
    int a = d.popFront(), b = d.popBack();
    cout << "pop_front -> " << a << "  pop_back -> " << b << "  " << d.str() << "\n";
}
