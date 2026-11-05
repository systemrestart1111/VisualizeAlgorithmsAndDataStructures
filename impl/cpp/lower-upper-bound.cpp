#include <iostream>
#include <vector>
using namespace std;

// 第一個 >= t 的位置（等同 std::lower_bound）
int lowerBound(const vector<int>& a, int t) {
    int lo = 0, hi = (int)a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] < t) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

// 第一個 > t 的位置（等同 std::upper_bound）
int upperBound(const vector<int>& a, int t) {
    int lo = 0, hi = (int)a.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] <= t) lo = mid + 1;
        else hi = mid;
    }
    return lo;
}

int main() {
    vector<int> a = {2, 4, 4, 4, 7, 9, 9, 12, 15, 15, 15, 18};
    int lb = lowerBound(a, 9), ub = upperBound(a, 9);
    cout << "lower_bound(9) = " << lb << "\n";
    cout << "upper_bound(9) = " << ub << "\n";
    cout << "count of 9 = " << ub - lb << "\n";
}
