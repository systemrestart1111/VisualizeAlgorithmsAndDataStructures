#include <iostream>
#include <string>
#include <vector>
using namespace std;
using ll = long long;

ll poly(const string &s, ll base, ll mod) { ll h = 0; for (unsigned char ch : s) h = (h * base + ch) % mod; return h; }

// 每格是 4 位元計數器（上限 15）：飽和後不再增減，避免溢位造成漏判
class CountingBloom {
    int m, k;
    vector<int> c;
    vector<int> hashes(const string &s) const {
        ll h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1;
        vector<int> p;
        for (int i = 0; i < k; i++) p.push_back(int((h1 + i * h2) % m));
        return p;
    }
public:
    static const int MAXC = 15;
    CountingBloom(int m = 16, int k = 3) : m(m), k(k), c(m) {}
    void add(const string &s) { for (int p : hashes(s)) if (c[p] < MAXC) c[p]++; }
    bool query(const string &s) const { for (int p : hashes(s)) if (!c[p]) return false; return true; }
    bool remove(const string &s) {
        if (!query(s)) return false;  // 確定不存在：拒絕刪除
        for (int p : hashes(s)) if (c[p] < MAXC) c[p]--;
        return true;
    }
    void show(const string &label) const { cout << label; for (int x : c) cout << " " << x; cout << "\n"; }
};

int main() {
    CountingBloom cb;
    for (string w : {"apple", "banana", "cherry"}) cb.add(w);
    cb.show("counters:");
    cout << "remove banana: " << (cb.remove("banana") ? "True" : "False") << "\n";
    cb.show("counters:");
    for (string w : {"apple", "banana", "cherry", "kiwi"}) cout << w << ": " << (cb.query(w) ? "maybe" : "no") << "\n";
    cout << "remove kiwi: " << (cb.remove("kiwi") ? "True" : "False") << "\n";
    for (int i = 0; i < 20; i++) cb.add("apple");
    cb.show("after 20 more apple:");
}
