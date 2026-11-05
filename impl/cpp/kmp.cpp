#include <iostream>
#include <string>
#include <vector>
using namespace std;

// lps[i] = p[0..i] 最長的「相同前綴與後綴」長度（不含整個字串）
vector<int> prefixFunction(const string& p) {
    vector<int> lps(p.size(), 0);
    for (size_t i = 1, k = 0; i < p.size(); i++) {
        while (k && p[i] != p[k]) k = lps[k - 1];
        if (p[i] == p[k]) k++;
        lps[i] = (int)k;
    }
    return lps;
}

// 失配時不回退文字指標，而是依 lps 把樣式滑到下一個可能的位置
int main() {
    string t = "ABABDABACDABABCABAB", p = "ABABCABAB";
    vector<int> lps = prefixFunction(p), matches;
    for (size_t i = 0, k = 0; i < t.size(); i++) {
        while (k && t[i] != p[k]) k = lps[k - 1];
        if (t[i] == p[k]) k++;
        if (k == p.size()) { matches.push_back((int)(i - k + 1)); k = lps[k - 1]; }
    }
    cout << "lps:";
    for (int x : lps) cout << " " << x;
    cout << "\nmatches at:";
    for (int x : matches) cout << " " << x;
    cout << "\n";
}
