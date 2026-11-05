#include <algorithm>
#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
using namespace std;

// 兩個虛根（長度 −1、0）；每次從最長回文後綴往上找能在兩側接上 c 的回文
vector<string> eertree(const string &s) {
    vector<int> len = {-1, 0}, link = {0, 0};
    vector<map<char, int>> kids(2);
    vector<string> pal = {"", ""};
    int last = 1;
    for (int i = 0; i < (int)s.size(); i++) {
        char c = s[i];
        auto fits = [&](int v) { int j = i - len[v] - 1; return j >= 0 && s[j] == c; };
        int cur = last;
        while (!fits(cur)) cur = link[cur];
        if (kids[cur].count(c)) { last = kids[cur][c]; continue; }
        int v = len.size();
        len.push_back(len[cur] + 2);
        pal.push_back(len[v] == 1 ? string(1, c) : c + pal[cur] + c);
        kids.push_back({});
        if (len[v] == 1) link.push_back(1);
        else { int w = link[cur]; while (!fits(w)) w = link[w]; link.push_back(kids[w][c]); }
        kids[cur][c] = v;
        last = v;
    }
    return vector<string>(pal.begin() + 2, pal.end());
}

int main() {
    for (string s : {"abacabadab", "eertree", "aaaa", "abc"}) {
        auto p = eertree(s);
        sort(p.begin(), p.end());
        set<string> brute;
        for (size_t i = 0; i < s.size(); i++) for (size_t j = i + 1; j <= s.size(); j++) { string t = s.substr(i, j - i); if (t == string(t.rbegin(), t.rend())) brute.insert(t); }
        cout << s << ": " << p.size() << " palindromes [";
        for (size_t i = 0; i < p.size(); i++) cout << (i ? ", " : "") << "'" << p[i] << "'";
        cout << "] (brute " << brute.size() << ")\n";
    }
}
