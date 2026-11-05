#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// st[j][i] = min(a[i .. i + 2^j − 1])
struct SparseTable {
    vector<vector<int>> st;
    SparseTable(const vector<int> &a) {
        st.push_back(a);
        for (int j = 1; (1 << j) <= (int)a.size(); j++) {
            vector<int> row;
            for (int i = 0; i + (1 << j) <= (int)a.size(); i++) row.push_back(min(st[j - 1][i], st[j - 1][i + (1 << (j - 1))]));
            st.push_back(row);
        }
    }
    // 兩段長度 2^k 的區間可以重疊：只適用於 min／max／gcd 等冪等運算
    int query(int l, int r) const {
        int k = 31 - __builtin_clz(r - l + 1);
        return min(st[k][l], st[k][r - (1 << k) + 1]);
    }
};

int main() {
    vector<int> a = {5, 2, 8, 6, 3, 7, 1, 9, 4, 6, 2, 8};
    SparseTable t(a);
    for (size_t j = 0; j < t.st.size(); j++) { cout << "2^" << j << ":"; for (int x : t.st[j]) cout << " " << x; cout << "\n"; }
    int qs[6][2] = {{0, 4}, {3, 9}, {6, 6}, {0, 11}, {8, 11}, {2, 5}};
    for (auto &q : qs) cout << "min[" << q[0] << ", " << q[1] << "] = " << t.query(q[0], q[1]) << " (brute " << *min_element(a.begin() + q[0], a.begin() + q[1] + 1) << ")\n";
}
