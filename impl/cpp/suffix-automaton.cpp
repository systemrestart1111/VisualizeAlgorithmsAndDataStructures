#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
using namespace std;

// 逐字元擴充；len 不連續時複製 clone
struct SAM {
    vector<int> len{0}, link{-1};
    vector<map<char, int>> nxt{{}};
    int last = 0;
    void extend(char c) {
        int cur = len.size(), p = last;
        len.push_back(len[last] + 1); link.push_back(-1); nxt.push_back({});
        while (p != -1 && !nxt[p].count(c)) { nxt[p][c] = cur; p = link[p]; }
        if (p == -1) link[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len[p] + 1 == len[q]) link[cur] = q;
            else {
                int clone = len.size();
                len.push_back(len[p] + 1); link.push_back(link[q]); nxt.push_back(nxt[q]);
                while (p != -1 && nxt[p].count(c) && nxt[p][c] == q) { nxt[p][c] = clone; p = link[p]; }
                link[q] = link[cur] = clone;
            }
        }
        last = cur;
    }
};

int main() {
    for (string s : {"abcbcabc", "banana", "aaaa", "abcd"}) {
        SAM m;
        for (char c : s) m.extend(c);
        long long distinct = 0;
        for (size_t v = 1; v < m.len.size(); v++) distinct += m.len[v] - m.len[m.link[v]];
        set<string> subs;
        for (size_t i = 0; i < s.size(); i++) for (size_t j = i + 1; j <= s.size(); j++) subs.insert(s.substr(i, j - i));
        cout << s << ": states " << m.len.size() << ", distinct substrings " << distinct << " (brute " << subs.size() << ")\n";
    }
}
