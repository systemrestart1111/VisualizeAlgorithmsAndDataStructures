#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 只用前綴翻轉：最大值先翻到最前面，再翻到未排序部分的底部
vector<int> pancakeSort(vector<int> &a) {
    vector<int> flips;
    for (int size = a.size(); size > 1; size--) {
        int m = max_element(a.begin(), a.begin() + size) - a.begin();
        if (m == size - 1) continue;
        if (m != 0) { reverse(a.begin(), a.begin() + m + 1); flips.push_back(m); }
        reverse(a.begin(), a.begin() + size);
        flips.push_back(size - 1);
    }
    return flips;
}

int main() {
    vector<int> a = {3, 6, 1, 8, 4, 9, 2, 7, 5};
    vector<int> f = pancakeSort(a);
    cout << "sorted:";
    for (int x : a) cout << " " << x;
    cout << "\nflips: " << f.size() << " prefix lengths:";
    for (int k : f) cout << " " << k + 1;
    cout << "\n";
}
