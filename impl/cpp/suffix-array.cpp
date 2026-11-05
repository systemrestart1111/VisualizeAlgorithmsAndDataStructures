#include <algorithm>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;

// 倍增法：先依第 1 個字元排名，之後每輪用 (前 k 字元排名, 接下來 k 字元排名) 排序，比較長度每輪加倍
vector<int> suffixArray(const string& s) {
    int n = (int)s.size();
    vector<int> sa(n), rnk(n), tmp(n);
    for (int i = 0; i < n; i++) { sa[i] = i; rnk[i] = (unsigned char)s[i]; }
    for (int k = 1;; k *= 2) {
        auto key = [&](int i) { return make_pair(rnk[i], i + k < n ? rnk[i + k] : -1); };
        sort(sa.begin(), sa.end(), [&](int a, int b) { return key(a) < key(b); });
        tmp[sa[0]] = 0;
        for (int j = 1; j < n; j++) tmp[sa[j]] = tmp[sa[j - 1]] + (key(sa[j - 1]) != key(sa[j]));
        rnk = tmp;
        printf("k=%d: ranks", k);
        for (int r : rnk) printf(" %d", r);
        printf("\n");
        if (rnk[sa[n - 1]] == n - 1) return sa;  // 排名全部不同就完成
    }
}

int main() {
    string s = "banana$";
    vector<int> sa = suffixArray(s);
    printf("SA:");
    for (int i : sa) printf(" %d", i);
    printf("\n");
    for (int i : sa) printf("%2d %s\n", i, s.substr(i).c_str());
}
