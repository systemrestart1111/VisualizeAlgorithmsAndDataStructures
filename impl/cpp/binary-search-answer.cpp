#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 對答案二分：hours(k) 隨 k 遞減，找最小可行的 k；h < 堆數時無解回傳 -1
int minSpeed(const vector<int> &p, int h) {
    if (h < (int)p.size()) return -1;
    auto hours = [&](int k) { long long s = 0; for (int x : p) s += (x + k - 1) / k; return s; };
    int lo = 1, hi = *max_element(p.begin(), p.end());
    while (lo < hi) {
        int mid = (lo + hi) / 2;
        if (hours(mid) <= h) hi = mid; else lo = mid + 1;
    }
    return lo;
}

int main() {
    vector<int> piles = {30, 11, 23, 4, 20};
    for (int h : {6, 5, 10, 100, 4}) {
        int k = minSpeed(piles, h);
        cout << "h = " << h << ": min speed = ";
        if (k < 0) cout << "impossible\n"; else cout << k << "\n";
    }
}
