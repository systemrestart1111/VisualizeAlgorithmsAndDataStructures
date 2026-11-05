#include <iostream>
#include <vector>
using namespace std;

// 至少有一半是有序的；a[lo] = a[mid] = a[hi] 時無法判斷，兩端各縮一格
int search(const vector<int> &a, int t) {
    int lo = 0, hi = a.size() - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (a[mid] == t) return mid;
        if (a[lo] == a[mid] && a[mid] == a[hi]) { lo++; hi--; }
        else if (a[lo] <= a[mid]) { if (a[lo] <= t && t < a[mid]) hi = mid - 1; else lo = mid + 1; }
        else { if (a[mid] < t && t <= a[hi]) lo = mid + 1; else hi = mid - 1; }
    }
    return -1;
}

int main() {
    vector<int> a = {45, 52, 60, 67, 74, 3, 8, 12, 17, 23, 31, 38};
    for (int t : {12, 45, 38, 50}) cout << "find " << t << ": " << search(a, t) << "\n";
    cout << "duplicates find 3: " << search({2, 2, 2, 3, 2, 2, 2}, 3) << "\n";
}
