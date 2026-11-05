#include <iostream>
#include <utility>
#include <vector>
using namespace std;

int partition(vector<int>& a, int lo, int hi) {
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot) swap(a[i++], a[j]);
    swap(a[i], a[hi]);
    return i;
}

// 找第 k 小（0 起算）：分割後只往含有第 k 個位置的那一邊繼續，平均 O(n)
int quickselect(vector<int>& a, int k) {
    int lo = 0, hi = (int)a.size() - 1;
    for (;;) {
        int p = partition(a, lo, hi);
        if (p == k) return a[p];
        if (k < p) hi = p - 1;
        else lo = p + 1;
    }
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    cout << "k = 5 -> " << quickselect(a, 5) << "\n";
}
