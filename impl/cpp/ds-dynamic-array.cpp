#include <iostream>
#include <string>
using namespace std;

// 容量滿時加倍、只剩 1/4 時減半；搬移成本攤銷後，每次 append / pop 平均 O(1)
class DynamicArray {
    int* data = new int[1];
    int size_ = 0, cap = 1;

    void resize(int newCap) {
        int* nd = new int[newCap];
        for (int i = 0; i < size_; i++) nd[i] = data[i];
        delete[] data;
        data = nd;
        cap = newCap;
    }

public:
    ~DynamicArray() { delete[] data; }
    void append(int v) {
        if (size_ == cap) resize(cap * 2);
        data[size_++] = v;
    }
    int pop() {
        int v = data[--size_];
        if (cap > 1 && size_ <= cap / 4) resize(cap / 2);
        return v;
    }
    string str() const {
        string s = "[";
        for (int i = 0; i < size_; i++) s += (i ? " " : "") + to_string(data[i]);
        return s + "] size=" + to_string(size_) + " cap=" + to_string(cap);
    }
};

int main() {
    DynamicArray a;
    for (int v : {10, 20, 30, 40, 50}) { a.append(v); cout << "append " << v << ": " << a.str() << "\n"; }
    for (int i = 0; i < 4; i++) { int v = a.pop(); cout << "pop -> " << v << ": " << a.str() << "\n"; }
}
