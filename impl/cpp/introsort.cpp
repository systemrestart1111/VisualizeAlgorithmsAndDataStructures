#include <cmath>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;

void insertionSort(vector<int>& a, int lo, int hi) {
    for (int i = lo + 1; i <= hi; i++) {
        int key = a[i], j = i - 1;
        while (j >= lo && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}

void sift(vector<int>& a, int lo, int i, int size) {
    for (;;) {
        int big = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < size && a[lo + l] > a[lo + big]) big = l;
        if (r < size && a[lo + r] > a[lo + big]) big = r;
        if (big == i) return;
        swap(a[lo + i], a[lo + big]);
        i = big;
    }
}

void heapSortRange(vector<int>& a, int lo, int hi) {
    int n = hi - lo + 1;
    for (int i = n / 2 - 1; i >= 0; i--) sift(a, lo, i, n);
    for (int end = n - 1; end > 0; end--) { swap(a[lo], a[lo + end]); sift(a, lo, 0, end); }
}

int partition(vector<int>& a, int lo, int hi) {
    int pivot = a[hi], i = lo;
    for (int j = lo; j < hi; j++)
        if (a[j] < pivot) swap(a[i++], a[j]);
    swap(a[i], a[hi]);
    return i;
}

// 快速排序為主；區間很小改用插入排序，遞迴太深改用堆積排序，保證 O(n log n)
void intro(vector<int>& a, int lo, int hi, int depth, int small) {
    if (hi - lo + 1 <= small) insertionSort(a, lo, hi);
    else if (depth == 0) heapSortRange(a, lo, hi);
    else {
        int p = partition(a, lo, hi);
        intro(a, lo, p - 1, depth - 1, small);
        intro(a, p + 1, hi, depth - 1, small);
    }
}

int main() {
    vector<int> a = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72, 5, 47, 90, 14, 66, 23, 50, 8};
    int n = (int)a.size();
    intro(a, 0, n - 1, 2 * (int)log2(n), 4);
    for (int i = 0; i < n; i++) cout << a[i] << (i + 1 < n ? ' ' : '\n');
}
