#include <iostream>
#include <tuple>
#include <vector>
using namespace std;

// 以 i 結尾的最大和 = max(a[i], 前一個的最大和 + a[i])；同時記錄區間
tuple<int, int, int> kadane(const vector<int>& a) {
    int best = a[0], cur = a[0], start = 0, bl = 0, br = 0;
    for (int i = 1; i < (int)a.size(); i++) {
        if (cur < 0) { cur = a[i]; start = i; }
        else cur += a[i];
        if (cur > best) { best = cur; bl = start; br = i; }
    }
    return make_tuple(best, bl, br);
}

int main() {
    vector<int> a = {-2, 1, -3, 4, -1, 2, 1, -5, 4, 3, -2, 2};
    int s, l, r;
    tie(s, l, r) = kadane(a);
    cout << "max sum = " << s << ", range [" << l << ", " << r << "]\n";
}
