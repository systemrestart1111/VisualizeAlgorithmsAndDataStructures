#include <iostream>
#include <utility>
#include <vector>
using namespace std;

// 把 a[i] 往下沉，直到它比兩個子節點都大（最大堆積）
void siftDown(vector<int>& a, int i, int n) {
    for (;;) {
        int big = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && a[l] > a[big]) big = l;
        if (r < n && a[r] > a[big]) big = r;
        if (big == i) return;
        swap(a[i], a[big]);
        i = big;
    }
}

void heapSort(vector<int>& a) {
    int n = (int)a.size();
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);  // 由下往上建堆
    for (int end = n - 1; end > 0; end--) {                  // 每次把最大值換到尾端
        swap(a[0], a[end]);
        siftDown(a, 0, end);
    }
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    heapSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
