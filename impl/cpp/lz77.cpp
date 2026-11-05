#include <iostream>
#include <string>
#include <tuple>
#include <vector>
using namespace std;

// 在前面 window 個字元的「搜尋視窗」中找最長匹配，輸出 (往回距離, 長度, 下一個字元)；匹配可延伸到尚未編碼的部分
vector<tuple<int, int, char>> lz77Encode(const string& s, int window) {
    vector<tuple<int, int, char>> out;
    int n = (int)s.size();
    for (int i = 0; i < n;) {
        int bestLen = 0, bestOff = 0;
        for (int off = 1; off <= min(window, i); off++) {
            int len = 0;
            while (i + len < n - 1 && s[i - off + len] == s[i + len]) len++;
            if (len > bestLen) { bestLen = len; bestOff = off; }
        }
        out.emplace_back(bestOff, bestLen, s[i + bestLen]);
        i += bestLen + 1;
    }
    return out;
}

int main() {
    string s = "abracadabrarray", dec;
    auto tokens = lz77Encode(s, 8);
    cout << "tokens:";
    for (auto& t : tokens) {
        int off, len;
        char ch;
        tie(off, len, ch) = t;
        cout << " (" << off << "," << len << "," << ch << ")";
        for (int r = 0; r < len; r++) dec += dec[dec.size() - off];
        dec += ch;
    }
    cout << "\ndecode ok: " << (dec == s ? "True" : "False") << "\n";
}
