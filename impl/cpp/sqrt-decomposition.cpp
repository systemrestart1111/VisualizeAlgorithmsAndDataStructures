#include <iostream>
#include <vector>
using namespace std;

// 每 B 個一塊並預存塊總和；查詢時完整的塊直接用總和，兩端零散元素逐一相加
struct SqrtDecomposition {
    vector<int> a, sums;
    int B;
    SqrtDecomposition(const vector<int> &v, int B = 4) : a(v), sums((v.size() + B - 1) / B), B(B) {
        for (size_t i = 0; i < a.size(); i++) sums[i / B] += a[i];
    }
    void set(int i, int v) { sums[i / B] += v - a[i]; a[i] = v; }
    int query(int l, int r) const {
        int s = 0, i = l;
        while (i <= r) {
            if (i % B == 0 && i + B - 1 <= r) { s += sums[i / B]; i += B; }
            else s += a[i++];
        }
        return s;
    }
};

int main() {
    SqrtDecomposition d({3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3});
    cout << "blocks:"; for (int s : d.sums) cout << " " << s; cout << "\n";
    cout << "sum[2, 13] = " << d.query(2, 13) << "\n";
    d.set(5, 0);
    cout << "after a[5] = 0, blocks:"; for (int s : d.sums) cout << " " << s; cout << "\n";
    cout << "sum[4, 7] = " << d.query(4, 7) << " | sum[0, 15] = " << d.query(0, 15) << " | sum[9, 9] = " << d.query(9, 9) << "\n";
}
