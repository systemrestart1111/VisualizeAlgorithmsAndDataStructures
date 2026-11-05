#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;
using ll = long long;

ll poly(const string &s, ll base, ll mod) { ll h = 0; for (unsigned char ch : s) h = (h * base + ch) % mod; return h; }

// d 列 × w 欄計數器；查詢取 d 個計數的最小值（只會高估，不會低估）
struct CountMin {
    int d, w;
    vector<vector<int>> t;
    CountMin(int d = 3, int w = 8) : d(d), w(w), t(d, vector<int>(w)) {}
    vector<int> cols(const string &s) const {
        ll h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1;
        vector<int> j;
        for (int i = 0; i < d; i++) j.push_back(int((h1 + i * h2) % w));
        return j;
    }
    void update(const string &s, int c) { auto j = cols(s); for (int i = 0; i < d; i++) t[i][j[i]] += c; }
    int query(const string &s) const { auto j = cols(s); int m = t[0][j[0]]; for (int i = 1; i < d; i++) m = min(m, t[i][j[i]]); return m; }
};

int main() {
    CountMin cm;
    vector<pair<string, int>> truth = {{"apple", 5}, {"banana", 2}, {"cherry", 3}, {"grape", 1}, {"lemon", 4}};
    map<string, int> real;
    for (auto &p : truth) { cm.update(p.first, p.second); real[p.first] = p.second; }
    for (auto &row : cm.t) { for (int j = 0; j < cm.w; j++) cout << (j ? " " : "") << row[j]; cout << "\n"; }
    for (string k : {"apple", "banana", "cherry", "grape", "lemon", "kiwi"}) {
        int est = cm.query(k), r = real.count(k) ? real[k] : 0;
        cout << k << ": estimate " << est << ", true " << r << ", ok " << (est >= r ? "True" : "False") << "\n";
    }
}
