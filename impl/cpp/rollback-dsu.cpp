#include <iostream>
#include <numeric>
#include <utility>
#include <vector>
using namespace std;

// 依大小合併、不做路徑壓縮；每次合併推入紀錄，可撤回到快照
struct RollbackDSU {
    vector<int> p, sz;
    vector<pair<int, int>> hist;
    RollbackDSU(int n) : p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }
    int find(int x) const { while (p[x] != x) x = p[x]; return x; }
    bool unite(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;
        if (sz[rx] > sz[ry]) swap(rx, ry);
        p[rx] = ry;
        sz[ry] += sz[rx];
        hist.push_back({rx, ry});
        return true;
    }
    size_t snapshot() const { return hist.size(); }
    void rollback(size_t snap) {
        while (hist.size() > snap) { auto h = hist.back(); hist.pop_back(); p[h.first] = h.first; sz[h.second] -= sz[h.first]; }
    }
    void show(const char *label) const {
        cout << label; for (int x : p) cout << " " << x;
        cout << " | sizes:"; for (int x : sz) cout << " " << x;
        cout << "\n";
    }
};

int main() {
    RollbackDSU d(8);
    d.unite(0, 1); d.unite(2, 3);
    size_t s = d.snapshot();
    d.unite(1, 3); d.unite(4, 5); d.unite(5, 0);
    d.show("parents:");
    cout << "same(4, 2): " << (d.find(4) == d.find(2) ? "True" : "False") << "\n";
    d.rollback(s);
    d.show("after rollback:");
    cout << "same(4, 2): " << (d.find(4) == d.find(2) ? "True" : "False") << " | same(0, 1): " << (d.find(0) == d.find(1) ? "True" : "False") << "\n";
}
