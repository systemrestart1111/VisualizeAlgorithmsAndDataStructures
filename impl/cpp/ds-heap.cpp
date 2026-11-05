#include <cstdio>
#include <string>
#include <utility>
#include <vector>
using namespace std;

// 以陣列存放的完全二元樹：i 的子節點在 2i+1、2i+2，父節點在 (i-1)/2；堆頂永遠是最小值
class MinHeap {
    vector<int> a;

    void siftDown(int i) {
        int n = a.size();
        for (;;) {
            int s = i, l = 2 * i + 1, r = 2 * i + 2;
            if (l < n && a[l] < a[s]) s = l;
            if (r < n && a[r] < a[s]) s = r;
            if (s == i) return;
            swap(a[i], a[s]);
            i = s;
        }
    }

public:
    MinHeap() {}
    explicit MinHeap(vector<int> items) : a(move(items)) {
        for (int i = (int)a.size() / 2 - 1; i >= 0; i--) siftDown(i);  // 自底向上建堆，O(n)
    }
    void push(int v) {
        a.push_back(v);
        int i = a.size() - 1;
        while (i > 0 && a[(i - 1) / 2] > a[i]) {  // 上浮
            swap(a[i], a[(i - 1) / 2]);
            i = (i - 1) / 2;
        }
    }
    int pop() {
        int top = a[0];
        a[0] = a.back();
        a.pop_back();
        if (!a.empty()) siftDown(0);
        return top;
    }
    int peek() const { return a[0]; }
    string str() const {
        string s = "[";
        for (size_t i = 0; i < a.size(); i++) s += (i ? " " : "") + to_string(a[i]);
        return s + "]";
    }
};

int main() {
    MinHeap h;
    for (int v : {35, 12, 48, 7, 20, 3, 41}) { h.push(v); printf("push %2d: %s\n", v, h.str().c_str()); }
    printf("peek -> %d\n", h.peek());
    for (int i = 0; i < 3; i++) { int top = h.pop(); printf("pop -> %2d: %s\n", top, h.str().c_str()); }
    MinHeap b({9, 4, 7, 1, 8, 2, 6});
    printf("build [9 4 7 1 8 2 6] -> %s\n", b.str().c_str());
    printf("heap sort:");
    for (int i = 0; i < 7; i++) printf(" %d", b.pop());
    printf("\n");
}
