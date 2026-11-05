#include <cstdio>
#include <vector>
using namespace std;

// t[i] 負責區間 (i - lowbit(i), i]；更新與前綴和都只走 O(log n) 個位置（索引從 1 開始）
class Fenwick {
public:
    int n;
    vector<int> t;

    explicit Fenwick(const vector<int>& a) : n(a.size()), t(a.size() + 1, 0) {
        for (int i = 1; i <= n; i++) add(i, a[i - 1]);
    }
    void add(int i, int v) {
        for (; i <= n; i += i & -i) t[i] += v;  // 往上走到下一個也涵蓋 i 的位置
    }
    int prefix(int i) const {
        int s = 0;
        for (; i > 0; i -= i & -i) s += t[i];  // 去掉最低位的 1
        return s;
    }
    int rangeSum(int l, int r) const { return prefix(r) - prefix(l - 1); }
};

void show(const Fenwick& f) {
    printf("t[1..12] =");
    for (int i = 1; i <= f.n; i++) printf(" %d", f.t[i]);
    printf("\n");
}

int main() {
    Fenwick f({3, 2, -1, 6, 5, 4, -3, 3, 7, 2, 3, 1});
    show(f);
    printf("prefix(7) = %d\n", f.prefix(7));
    printf("sum[3, 9] = %d\n", f.rangeSum(3, 9));
    f.add(5, 4); printf("add +4 at 5\n");
    printf("prefix(7) = %d\n", f.prefix(7));
    printf("sum[3, 9] = %d\n", f.rangeSum(3, 9));
    show(f);
}
