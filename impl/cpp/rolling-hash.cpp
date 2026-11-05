#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

// 前綴雜湊：h[i] = s[0..i) 的多項式雜湊；任意子字串 s[l..r) 的雜湊 = h[r] - h[l]·B^(r-l)，O(1) 取得
int main() {
    string s = "banana_bandana";
    const long long B = 131, M = 1000003;
    int n = (int)s.size(), L = 3;
    vector<long long> h(n + 1, 0), pw(n + 1, 1);
    for (int i = 0; i < n; i++) {
        h[i + 1] = (h[i] * B + (unsigned char)s[i]) % M;
        pw[i + 1] = pw[i] * B % M;
    }
    vector<long long> order;               // 雜湊值第一次出現的順序
    map<long long, vector<int>> groups;    // 雜湊值 -> 出現位置
    for (int i = 0; i + L <= n; i++) {
        long long v = ((h[i + L] - h[i] * pw[L]) % M + M) % M;
        if (!groups.count(v)) order.push_back(v);
        groups[v].push_back(i);
    }
    cout << "substrings of length " << L << " appearing more than once:\n";
    for (long long v : order) {
        auto& pos = groups[v];
        bool same = true;
        for (int p : pos) same = same && s.compare(p, L, s, pos[0], L) == 0;  // 再確認字串真的相同
        if (pos.size() > 1 && same) {
            cout << "  '" << s.substr(pos[0], L) << "' hash=" << v << " at";
            for (int p : pos) cout << " " << p;
            cout << "\n";
        }
    }
}
