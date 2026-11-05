#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 多數投票：相同就 +1、不同就 -1，歸零時換候選人；最後再驗證一次是否過半
int main() {
    vector<int> a = {2, 2, 1, 3, 2, 1, 2, 2, 3, 2, 1, 2, 2};
    int cand = 0, count = 0;
    for (int x : a) {
        if (count == 0) cand = x;
        count += x == cand ? 1 : -1;
    }
    int occ = (int)std::count(a.begin(), a.end(), cand), n = (int)a.size();
    if (occ * 2 > n) cout << "majority = " << cand << " (" << occ << "/" << n << ")\n";
    else cout << "majority = None (" << occ << "/" << n << ")\n";
}
