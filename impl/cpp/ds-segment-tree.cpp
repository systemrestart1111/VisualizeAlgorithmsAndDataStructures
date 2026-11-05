#include <cstdio>
#include <vector>
using namespace std;

// 區間加值 + 區間求和；lazy[o] 記錄「整段都要加、但還沒往下推」的值，兩種操作都是 O(log n)
class SegmentTree {
    int n;
    vector<long long> sum, lazy;

    void build(int o, int l, int r, const vector<int>& a) {
        if (l == r) { sum[o] = a[l]; return; }
        int m = (l + r) / 2;
        build(2 * o, l, m, a);
        build(2 * o + 1, m + 1, r, a);
        sum[o] = sum[2 * o] + sum[2 * o + 1];
    }
    void apply(int o, int l, int r, long long v) {
        sum[o] += v * (r - l + 1);
        lazy[o] += v;
    }
    void push(int o, int l, int r) {
        if (lazy[o]) {  // 要往下走之前，才把延遲的加值交給兩個子節點
            int m = (l + r) / 2;
            apply(2 * o, l, m, lazy[o]);
            apply(2 * o + 1, m + 1, r, lazy[o]);
            lazy[o] = 0;
        }
    }
    void add(int o, int l, int r, int ql, int qr, long long v) {
        if (qr < l || r < ql) return;
        if (ql <= l && r <= qr) { apply(o, l, r, v); return; }  // 整段被覆蓋：只更新這個節點並記下 lazy
        push(o, l, r);
        int m = (l + r) / 2;
        add(2 * o, l, m, ql, qr, v);
        add(2 * o + 1, m + 1, r, ql, qr, v);
        sum[o] = sum[2 * o] + sum[2 * o + 1];
    }
    long long query(int o, int l, int r, int ql, int qr) {
        if (qr < l || r < ql) return 0;
        if (ql <= l && r <= qr) return sum[o];
        push(o, l, r);
        int m = (l + r) / 2;
        return query(2 * o, l, m, ql, qr) + query(2 * o + 1, m + 1, r, ql, qr);
    }

public:
    explicit SegmentTree(const vector<int>& a) : n(a.size()), sum(4 * a.size()), lazy(4 * a.size()) { build(1, 0, n - 1, a); }
    void add(int l, int r, long long v) { add(1, 0, n - 1, l, r, v); }
    long long query(int l, int r) { return query(1, 0, n - 1, l, r); }
    int size() const { return n; }
};

void show(SegmentTree& st) {
    printf("array: [");
    for (int i = 0; i < st.size(); i++) printf(i ? " %lld" : "%lld", st.query(i, i));
    printf("]\n");
}

int main() {
    SegmentTree st({5, 8, 6, 3, 2, 7, 2, 6});
    show(st);
    printf("sum[2, 5] = %lld\n", st.query(2, 5));
    st.add(1, 4, 3); printf("add +3 on [1, 4]\n");
    printf("sum[0, 7] = %lld\n", st.query(0, 7));
    printf("sum[3, 6] = %lld\n", st.query(3, 6));
    st.add(4, 7, -2); printf("add -2 on [4, 7]\n");
    show(st);
    printf("sum[0, 7] = %lld\n", st.query(0, 7));
}
