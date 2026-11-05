#include <iostream>
#include <vector>
using namespace std;

// 兩個維度各自沿 lowbit 跳：更新往上、查詢往下（1 起算）
struct Fenwick2D {
    int n, m;
    vector<vector<int>> t;
    Fenwick2D(int n, int m) : n(n), m(m), t(n + 1, vector<int>(m + 1)) {}
    void add(int r, int c, int v) { for (int i = r; i <= n; i += i & -i) for (int j = c; j <= m; j += j & -j) t[i][j] += v; }
    int prefix(int r, int c) const { int s = 0; for (int i = r; i > 0; i -= i & -i) for (int j = c; j > 0; j -= j & -j) s += t[i][j]; return s; }
    int rect(int r1, int c1, int r2, int c2) const { return prefix(r2, c2) - prefix(r1 - 1, c2) - prefix(r2, c1 - 1) + prefix(r1 - 1, c1 - 1); }
};

int main() {
    Fenwick2D f(6, 6);
    vector<vector<int>> a(7, vector<int>(7));
    int ups[6][3] = {{1, 1, 3}, {2, 3, 5}, {4, 2, 2}, {3, 5, 4}, {6, 6, 1}, {5, 4, 6}}, qs[4][4] = {{1, 1, 6, 6}, {2, 2, 4, 5}, {3, 3, 3, 3}, {4, 1, 6, 4}};
    for (auto &u : ups) { f.add(u[0], u[1], u[2]); a[u[0]][u[1]] += u[2]; }
    for (auto &q : qs) {
        int brute = 0;
        for (int i = q[0]; i <= q[2]; i++) for (int j = q[1]; j <= q[3]; j++) brute += a[i][j];
        cout << "sum(" << q[0] << ", " << q[1] << ", " << q[2] << ", " << q[3] << ") = " << f.rect(q[0], q[1], q[2], q[3]) << " (brute " << brute << ")\n";
    }
    f.add(4, 4, 10);
    cout << "after add(4, 4, 10): sum(2, 2, 4, 5) = " << f.rect(2, 2, 4, 5) << "\n";
}
