#include <iostream>
#include <vector>
using namespace std;

// 節點存在陣列中；更新只複製根到葉的路徑，其餘子樹共用
struct PersistentSegTree {
    struct Node { int sum, l, r; };
    int n;
    vector<Node> nodes;
    vector<int> roots;
    PersistentSegTree(const vector<int> &a) : n(a.size()) { roots.push_back(build(a, 0, n - 1)); }
    int mk(int s, int l = -1, int r = -1) { nodes.push_back({s, l, r}); return nodes.size() - 1; }
    int build(const vector<int> &a, int lo, int hi) {
        if (lo == hi) return mk(a[lo]);
        int m = (lo + hi) / 2, L = build(a, lo, m), R = build(a, m + 1, hi);
        return mk(nodes[L].sum + nodes[R].sum, L, R);
    }
    int update(int node, int lo, int hi, int i, int v) {
        if (lo == hi) return mk(v);
        int m = (lo + hi) / 2, L = nodes[node].l, R = nodes[node].r;
        if (i <= m) L = update(L, lo, m, i, v); else R = update(R, m + 1, hi, i, v);
        return mk(nodes[L].sum + nodes[R].sum, L, R);
    }
    // 以最新版本為基礎建立新版本
    void set(int i, int v) { roots.push_back(update(roots.back(), 0, n - 1, i, v)); }
    int query(int node, int lo, int hi, int l, int r) const {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r) return nodes[node].sum;
        int m = (lo + hi) / 2;
        return query(nodes[node].l, lo, m, l, r) + query(nodes[node].r, m + 1, hi, l, r);
    }
    int query(int ver, int l, int r) const { return query(roots[ver], 0, n - 1, l, r); }
};

int main() {
    PersistentSegTree t({4, 1, 3, 5, 2, 6, 1, 3});
    t.set(2, 7);
    t.set(5, 0);
    for (int v = 0; v < 3; v++) cout << "version " << v << ": sum[0,7] = " << t.query(v, 0, 7) << ", sum[2,5] = " << t.query(v, 2, 5) << "\n";
    cout << "total nodes: " << t.nodes.size() << " (15 + 4 + 4)\n";
}
