#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

// 線性探測 + 劫富濟貧：遇到探測距離比自己小的元素就交換；刪除用後移
struct RobinHood {
    int m;
    vector<pair<int, int>> t;  // (key, dist)，key = -1 表示空格
    RobinHood(int m = 11) : m(m), t(m, {-1, 0}) {}
    int find(int x) const {
        for (int i = x % m, d = 0; d < m; i = (i + 1) % m, d++) {
            if (t[i].first == -1 || t[i].second < d) return -1;
            if (t[i].first == x) return i;
        }
        return -1;
    }
    void insert(int x) {
        if (find(x) >= 0) return;
        pair<int, int> cur = {x, 0};
        for (int i = x % m;; i = (i + 1) % m, cur.second++) {
            if (t[i].first == -1) { t[i] = cur; return; }
            if (t[i].second < cur.second) swap(t[i], cur);
        }
    }
    void erase(int x) {
        int i = find(x);
        if (i < 0) return;
        t[i] = {-1, 0};
        for (int j = (i + 1) % m; t[j].first != -1 && t[j].second > 0; i = j, j = (j + 1) % m) {
            t[i] = {t[j].first, t[j].second - 1};
            t[j] = {-1, 0};
        }
    }
    string show() const {
        string s;
        for (auto &p : t) s += (s.empty() ? "" : " ") + (p.first == -1 ? string(".") : to_string(p.first) + "/" + to_string(p.second));
        return s;
    }
};

int main() {
    RobinHood r;
    for (int x : {22, 33, 1, 12, 44, 5, 16, 27}) r.insert(x);
    cout << "table: " << r.show() << "\n";
    cout << "find 27: " << r.find(27) << " | find 9: " << r.find(9) << "\n";
    r.erase(33);
    cout << "after delete 33: " << r.show() << "\n";
    cout << "find 44: " << r.find(44) << " | find 27: " << r.find(27) << "\n";
}
