#include <iostream>
#include <vector>
using namespace std;

// a[0..mid) 與 a[mid..n) 各自有序；不用額外陣列，把右段元素依序往左插入（O(n·m)）
void inplaceMerge(vector<int>& a, int mid) {
    int i = 0, j = mid, n = (int)a.size();
    while (i < j && j < n) {
        if (a[i] <= a[j]) i++;
        else {
            int v = a[j];
            for (int k = j; k > i; k--) a[k] = a[k - 1];  // a[i..j-1] 整段右移一格
            a[i++] = v;
            j++;
        }
    }
}

int main() {
    vector<int> a = {3, 8, 15, 22, 40, 1, 9, 10, 25, 30, 45};
    inplaceMerge(a, 5);
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
