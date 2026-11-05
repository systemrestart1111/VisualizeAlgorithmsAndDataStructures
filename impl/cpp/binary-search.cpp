#include <iostream>
#include <vector>
using namespace std;

// a 已排序；每次與中間元素比較，捨棄一半的搜尋範圍
int binarySearch(const vector<int>& a, int t) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == t) return mid;
        if (a[mid] < t) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> a = {3, 8, 12, 17, 23, 31, 38, 45, 52, 60, 67, 74, 81, 89, 95};
    cout << "search 67 -> " << binarySearch(a, 67) << "\n";
    cout << "search 50 -> " << binarySearch(a, 50) << "\n";
}
