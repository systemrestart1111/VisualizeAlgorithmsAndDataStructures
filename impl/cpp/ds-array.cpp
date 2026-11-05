#include <iostream>
#include <stdexcept>
#include <string>
using namespace std;

// 固定容量的陣列：隨機存取 O(1)；在中間插入或刪除需要搬移後面的元素 O(n)
template <int CAP>
class FixedArray {
    int data[CAP];
    int size_ = 0;

public:
    void insert(int i, int v) {
        if (size_ == CAP) throw overflow_error("array is full");
        for (int k = size_; k > i; k--) data[k] = data[k - 1];  // i 之後的元素整段右移
        data[i] = v;
        size_++;
    }
    int remove(int i) {
        int v = data[i];
        for (int k = i; k < size_ - 1; k++) data[k] = data[k + 1];  // i 之後的元素整段左移
        size_--;
        return v;
    }
    int search(int v) const {
        for (int i = 0; i < size_; i++) if (data[i] == v) return i;
        return -1;
    }
    int& operator[](int i) { return data[i]; }
    string str() const {
        string s = "[";
        for (int i = 0; i < size_; i++) s += (i ? " " : "") + to_string(data[i]);
        return s + "] size=" + to_string(size_) + "/" + to_string(CAP);
    }
};

int main() {
    FixedArray<8> a;
    int init[] = {5, 3, 8, 1};
    for (int i = 0; i < 4; i++) a.insert(i, init[i]);
    cout << "init:       " << a.str() << "\n";
    a.insert(2, 42); cout << "insert(2,42): " << a.str() << "\n";
    a[0] = 7; cout << "set a[0]=7:   " << a.str() << "\n";
    int v = a.remove(1);
    cout << "delete(1) -> " << v << " " << a.str() << "\n";
    cout << "search(8) -> " << a.search(8) << "\n";
}
