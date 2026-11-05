#include <array>
#include <iostream>
#include <vector>
using namespace std;

// 差分陣列：區間 [l, r] 加 v 只需 d[l] += v、d[r+1] -= v，最後做一次前綴和還原
void applyUpdates(vector<int>& a, const vector<array<int, 3>>& ops) {
    vector<int> d(a.size() + 1, 0);
    for (auto& op : ops) {
        d[op[0]] += op[2];
        d[op[1] + 1] -= op[2];
    }
    int run = 0;
    for (size_t i = 0; i < a.size(); i++) {
        run += d[i];
        a[i] += run;
    }
}

int main() {
    vector<int> a(10, 5);
    applyUpdates(a, {{{1, 4, 3}}, {{3, 7, 2}}, {{0, 2, -1}}, {{6, 9, 5}}});
    for (size_t i = 0; i < a.size(); i++) cout << a[i] << (i + 1 < a.size() ? ' ' : '\n');
}
