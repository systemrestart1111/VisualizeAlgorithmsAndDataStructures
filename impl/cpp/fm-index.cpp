#include <algorithm>
#include <iostream>
#include <map>
#include <numeric>
#include <string>
#include <vector>
using namespace std;

// 後綴陣列、BWT、C 表與 Occ 前綴計數
struct FM {
    vector<int> sa;
    map<char, int> C;
    map<char, vector<int>> occ;
    int n;
    FM(const string &text) {
        string t = text + "$";
        n = t.size();
        sa.resize(n);
        iota(sa.begin(), sa.end(), 0);
        sort(sa.begin(), sa.end(), [&](int a, int b) { return t.substr(a) < t.substr(b); });
        map<char, int> cnt;
        for (char c : t) cnt[c]++;
        int acc = 0;
        for (auto &kv : cnt) { C[kv.first] = acc; acc += kv.second; occ[kv.first] = {0}; }
        for (int i = 0; i < n; i++) {
            char L = t[(sa[i] + n - 1) % n];
            for (auto &kv : occ) kv.second.push_back(kv.second.back() + (kv.first == L));
        }
    }
    // 向後搜尋：每讀一個字元，sp = C[c] + Occ(c, sp)、ep = C[c] + Occ(c, ep)
    vector<int> search(const string &pat) {
        int sp = 0, ep = n;
        for (int k = pat.size() - 1; k >= 0; k--) {
            char c = pat[k];
            if (!C.count(c)) return {};
            sp = C[c] + occ[c][sp];
            ep = C[c] + occ[c][ep];
            if (sp >= ep) return {};
        }
        vector<int> pos(sa.begin() + sp, sa.begin() + ep);
        sort(pos.begin(), pos.end());
        return pos;
    }
};
string show(const vector<int> &v) { string s = "["; for (size_t i = 0; i < v.size(); i++) s += (i ? ", " : "") + to_string(v[i]); return s + "]"; }

int main() {
    string text = "abracadabra";
    FM fm(text);
    for (string p : {"a", "abra", "cad", "ra", "xyz", "abracadabra"}) {
        auto pos = fm.search(p);
        vector<int> brute;
        for (size_t i = 0; i + p.size() <= text.size(); i++) if (text.compare(i, p.size(), p) == 0) brute.push_back(i);
        cout << "'" << p << "': " << pos.size() << " at " << show(pos) << " (brute " << show(brute) << ")\n";
    }
}
