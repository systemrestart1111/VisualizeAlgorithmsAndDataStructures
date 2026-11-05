#include <iostream>
#include <string>
#include <vector>
using namespace std;

// D 的第 j 位表示 pat[0..j] 目前是否匹配；D = ((D << 1) | 1) & B[c]
vector<int> shiftAnd(const string &text, const string &pat) {
    unsigned B[256] = {0}, D = 0;
    int m = pat.size();
    for (int j = 0; j < m; j++) B[(unsigned char)pat[j]] |= 1u << j;
    vector<int> out;
    for (int i = 0; i < (int)text.size(); i++) {
        D = ((D << 1) | 1) & B[(unsigned char)text[i]];
        if (D & (1u << (m - 1))) out.push_back(i - m + 1);
    }
    return out;
}
string show(const vector<int> &v) { string s = "["; for (size_t i = 0; i < v.size(); i++) s += (i ? ", " : "") + to_string(v[i]); return s + "]"; }

int main() {
    vector<pair<string, string>> tests = {{"abracadabra cadabra", "abra"}, {"aaaaa", "aa"}, {"the cat sat on the mat", "at"}, {"abc", "abcd"}};
    for (auto &t : tests) {
        vector<int> brute;
        for (int i = 0; i + (int)t.second.size() <= (int)t.first.size(); i++) if (t.first.compare(i, t.second.size(), t.second) == 0) brute.push_back(i);
        cout << "'" << t.second << "' in '" << t.first << "': " << show(shiftAnd(t.first, t.second)) << " (brute " << show(brute) << ")\n";
    }
}
