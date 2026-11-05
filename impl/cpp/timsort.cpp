#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

void insertionSort(vector<int>& a, int lo, int hi) {
    for (int i = lo + 1; i < hi; i++) {
        int key = a[i], j = i - 1;
        while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}

void mergeRuns(vector<int>& a, int lo, int mid, int hi) {
    vector<int> tmp;
    int i = lo, j = mid;
    while (i < mid && j < hi) tmp.push_back(a[i] <= a[j] ? a[i++] : a[j++]);
    while (i < mid) tmp.push_back(a[i++]);
    while (j < hi) tmp.push_back(a[j++]);
    copy(tmp.begin(), tmp.end(), a.begin() + lo);
}

// 簡化版 TimSort：先把每段 minrun 個元素用插入排序排好，再兩兩合併、長度倍增
void timSort(vector<int>& a, int minrun) {
    int n = (int)a.size();
    for (int lo = 0; lo < n; lo += minrun) insertionSort(a, lo, min(lo + minrun, n));
    for (int size = minrun; size < n; size *= 2)
        for (int lo = 0; lo < n; lo += 2 * size) {
            int mid = min(lo + size, n), hi = min(lo + 2 * size, n);
            if (mid < hi) mergeRuns(a, lo, mid, hi);
        }
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23};
    timSort(a, 4);
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
