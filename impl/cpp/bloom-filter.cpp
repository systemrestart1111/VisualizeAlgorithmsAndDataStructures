#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
using ll = long long;

ll poly(const string &s, ll base, ll mod) { ll h = 0; for (unsigned char c : s) h = (h * base + c) % mod; return h; }

class Bloom {
    int m, k;
    vector<int> bits;
    // 雙重雜湊：h_i = (h1 + i·h2) mod m
    vector<int> hashes(const string &s) const {
        ll h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1;
        vector<int> p;
        for (int i = 0; i < k; i++) p.push_back(int((h1 + i * h2) % m));
        return p;
    }
public:
    Bloom(int m = 32, int k = 3) : m(m), k(k), bits(m) {}
    void add(const string &s) { for (int p : hashes(s)) bits[p] = 1; }
    // 有任一位元為 0 → 確定不存在；全為 1 → 可能存在
    bool mightContain(const string &s) const { for (int p : hashes(s)) if (!bits[p]) return false; return true; }
    string str() const { string r; for (int b : bits) r += char('0' + b); return r; }
};

int main() {
    Bloom bf;
    vector<string> ins = {"apple", "banana", "cherry", "grape"};
    for (auto &w : ins) bf.add(w);
    cout << "bits: " << bf.str() << "\n";
    for (string w : {"apple", "banana", "cherry", "grape", "kiwi", "lemon", "mango", "peach", "plum", "fig"}) {
        bool maybe = bf.mightContain(w), was = find(ins.begin(), ins.end(), w) != ins.end();
        cout << w << ": " << (maybe ? "maybe" : "no") << (maybe && !was ? " (false positive)" : "") << "\n";
    }
}
