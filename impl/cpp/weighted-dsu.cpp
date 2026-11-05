#include <iostream>
#include <numeric>
#include <utility>
#include <vector>
using namespace std;

// d[x] = val[x] − val[parent[x]]；路徑壓縮時把差值累加起來
struct WeightedDSU {
    vector<int> p, d;
    WeightedDSU(int n) : p(n), d(n) { iota(p.begin(), p.end(), 0); }
    pair<int, int> find(int x) {
        if (p[x] == x) return {x, 0};
        auto r = find(p[x]);
        d[x] += r.second;
        p[x] = r.first;
        return {r.first, d[x]};
    }
    // 加入條件 val[x] − val[y] = w；與既有關係矛盾時回傳 false
    bool relate(int x, int y, int w) {
        auto a = find(x), b = find(y);
        if (a.first == b.first) return a.second - b.second == w;
        p[a.first] = b.first;
        d[a.first] = w - a.second + b.second;
        return true;
    }
    bool diff(int x, int y, int &out) {
        auto a = find(x), b = find(y);
        if (a.first != b.first) return false;
        out = a.second - b.second;
        return true;
    }
};

int main() {
    WeightedDSU u(8);
    int rel[4][3] = {{1, 0, 3}, {2, 1, 2}, {4, 3, -1}, {5, 4, 4}}, qs[4][2] = {{2, 0}, {5, 3}, {0, 2}, {2, 5}}, r;
    for (auto &e : rel) u.relate(e[0], e[1], e[2]);
    for (auto &q : qs) {
        cout << "val[" << q[0] << "] - val[" << q[1] << "] = ";
        if (u.diff(q[0], q[1], r)) cout << r << "\n"; else cout << "unknown\n";
    }
    cout << "relate(5, 2, 1): " << (u.relate(5, 2, 1) ? "True" : "False") << "\n";
    u.diff(3, 0, r);
    cout << "val[3] - val[0] = " << r << "\n";
    bool a = u.relate(3, 0, 0), b = u.relate(3, 0, -4);
    cout << "relate(3, 0, 0) consistent: " << (a ? "True" : "False") << " | relate(3, 0, -4) consistent: " << (b ? "True" : "False") << "\n";
}
