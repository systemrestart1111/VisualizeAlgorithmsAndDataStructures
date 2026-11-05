#include <cmath>
#include <iostream>
#include <vector>
using namespace std;

// a 已排序；每次跳 √n 格找到區塊，再在區塊內線性搜尋
int jumpSearch(const vector<int>& a, int t) {
    int n = (int)a.size(), step = (int)sqrt((double)n);
    int prev = 0, cur = step;
    while (cur < n && a[cur - 1] < t) {
        prev = cur;
        cur += step;
    }
    for (int i = prev; i < min(cur, n); i++)
        if (a[i] == t) return i;
    return -1;
}

int main() {
    vector<int> a = {1, 4, 7, 10, 14, 18, 21, 25, 29, 33, 38, 42, 47, 51, 56, 60};
    cout << "search 47 -> " << jumpSearch(a, 47) << "\n";
    cout << "search 30 -> " << jumpSearch(a, 30) << "\n";
}
