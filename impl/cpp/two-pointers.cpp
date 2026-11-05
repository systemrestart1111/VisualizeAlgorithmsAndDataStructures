#include <iostream>
#include <utility>
#include <vector>
using namespace std;

// 已排序陣列：和太小移左指標、太大移右指標；找不到回傳 (-1, -1)
pair<int, int> twoSumSorted(const vector<int> &a, int t) {
    int l = 0, r = a.size() - 1;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == t) return {l, r};
        if (s < t) l++; else r--;
    }
    return {-1, -1};
}

int main() {
    vector<int> a = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    for (int t : {61, 100, 4, 163}) {
        bool brute = false;
        for (size_t i = 0; i < a.size(); i++) for (size_t j = i + 1; j < a.size(); j++) if (a[i] + a[j] == t) brute = true;
        auto p = twoSumSorted(a, t);
        cout << "t = " << t << ": ";
        if (p.first >= 0) cout << "a[" << p.first << "] + a[" << p.second << "] = " << a[p.first] << " + " << a[p.second];
        else cout << "none";
        cout << " | brute: " << (brute ? "True" : "False") << "\n";
    }
}
