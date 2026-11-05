#include <iostream>
#include <utility>
#include <vector>
using namespace std;

// 二分找第一個 > key 的位置（upper bound），相等鍵保持原順序。回傳 (比較, 搬移)
template <class T, class K>
pair<int, int> binaryInsertionSort(vector<T> &a, K key) {
    int comps = 0, moves = 0;
    for (size_t i = 1; i < a.size(); i++) {
        T x = a[i];
        size_t lo = 0, hi = i;
        while (lo < hi) {
            size_t mid = (lo + hi) / 2;
            comps++;
            if (key(a[mid]) <= key(x)) lo = mid + 1; else hi = mid;
        }
        for (size_t j = i; j > lo; j--) { a[j] = a[j - 1]; moves++; }
        a[lo] = x;
    }
    return {comps, moves};
}

int main() {
    vector<int> a = {5, 2, 8, 2, 9, 1, 5, 6, 3, 5};
    auto r = binaryInsertionSort(a, [](int x) { return x; });
    cout << "sorted:";
    for (int x : a) cout << " " << x;
    cout << "\ncomparisons: " << r.first << " moves: " << r.second << "\n";
    vector<pair<int, char>> p = {{3, 'a'}, {1, 'b'}, {3, 'c'}, {2, 'd'}, {1, 'e'}};
    binaryInsertionSort(p, [](const pair<int, char> &x) { return x.first; });
    cout << "stable:";
    for (auto &x : p) cout << " " << x.first << x.second;
    cout << "\n";
}
