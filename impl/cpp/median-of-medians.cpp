#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// BFPRT：每 5 個一組取中位數，再遞迴取「中位數的中位數」當 pivot，保證最壞 O(n)
int selectK(vector<int> a, int k) {
    if (a.size() <= 5) {
        sort(a.begin(), a.end());
        return a[k];
    }
    vector<int> med;
    for (size_t i = 0; i < a.size(); i += 5) {
        vector<int> g(a.begin() + i, a.begin() + min(a.size(), i + 5));
        sort(g.begin(), g.end());
        med.push_back(g[g.size() / 2]);
    }
    int pivot = selectK(med, (int)med.size() / 2);
    vector<int> lows, highs;
    for (int x : a) {
        if (x < pivot) lows.push_back(x);
        else if (x > pivot) highs.push_back(x);
    }
    int eq = (int)(a.size() - lows.size() - highs.size());
    if (k < (int)lows.size()) return selectK(lows, k);
    if (k < (int)lows.size() + eq) return pivot;
    return selectK(highs, k - (int)lows.size() - eq);
}

int main() {
    vector<int> a = {12, 3, 5, 7, 4, 19, 26, 1, 14, 8, 22, 17, 9, 30, 2, 11, 25, 6, 15, 20, 28, 10, 13};
    cout << "k = 11 -> " << selectK(a, 11) << "\n";
}
