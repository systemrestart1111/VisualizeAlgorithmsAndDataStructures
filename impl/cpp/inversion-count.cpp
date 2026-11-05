#include <iostream>
#include <vector>
using namespace std;

// 合併排序：右邊元素先被取出時，左半剩下的都比它大；相等先取左邊（不算逆序）
long long countInv(vector<int> &a, int l, int r) {
    if (r - l <= 1) return 0;
    int m = (l + r) / 2;
    long long c = countInv(a, l, m) + countInv(a, m, r);
    vector<int> tmp;
    int i = l, j = m;
    while (i < m || j < r) {
        if (j == r || (i < m && a[i] <= a[j])) tmp.push_back(a[i++]);
        else { c += m - i; tmp.push_back(a[j++]); }
    }
    for (int k = l; k < r; k++) a[k] = tmp[k - l];
    return c;
}

int main() {
    vector<vector<int>> tests = {{8, 4, 2, 1, 7, 3, 5, 3}, {1, 2, 3}, {3, 3, 3}, {5, 4, 3, 2, 1}};
    for (auto src : tests) {
        int brute = 0;
        for (size_t i = 0; i < src.size(); i++) for (size_t j = i + 1; j < src.size(); j++) if (src[i] > src[j]) brute++;
        cout << "[";
        for (size_t i = 0; i < src.size(); i++) cout << (i ? ", " : "") << src[i];
        vector<int> a = src;
        cout << "] inversions: " << countInv(a, 0, a.size()) << " brute: " << brute << "\n";
    }
}
