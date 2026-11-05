#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 比較間隔 gap 的元素，gap 每輪除以 1.3；gap 縮到 1 且沒有交換時結束
void combSort(vector<int>& a) {
    int n = (int)a.size(), gap = n;
    bool done = false;
    while (!done) {
        gap = max(1, (int)(gap / 1.3));
        done = gap == 1;
        for (int i = 0; i + gap < n; i++)
            if (a[i] > a[i + gap]) {
                swap(a[i], a[i + gap]);
                done = false;
            }
    }
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    combSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
