#include <algorithm>
#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>
using namespace std;

// 龍書範例：(a|b)*abb 的 5 狀態 DFA
string STATES = "ABCDE";
map<char, map<char, char>> DELTA = {{'A', {{'a', 'B'}, {'b', 'C'}}}, {'B', {{'a', 'B'}, {'b', 'D'}}}, {'C', {{'a', 'B'}, {'b', 'C'}}}, {'D', {{'a', 'B'}, {'b', 'E'}}}, {'E', {{'a', 'B'}, {'b', 'C'}}}};
set<char> ACCEPT = {'E'};

int main() {
    // P 從「接受／非接受」開始；用 W 中的分組 A 與字元 c 切開所有分組
    set<char> rest;
    for (char q : STATES) if (!ACCEPT.count(q)) rest.insert(q);
    vector<set<char>> P = {ACCEPT, rest}, W = {ACCEPT.size() <= rest.size() ? ACCEPT : rest};
    while (!W.empty()) {
        set<char> A = W.front();
        W.erase(W.begin());
        for (char c : string("ab")) {
            set<char> X;
            for (char q : STATES) if (A.count(DELTA[q][c])) X.insert(q);
            vector<set<char>> NP;
            for (auto &Y : P) {
                set<char> inter, diff;
                for (char q : Y) (X.count(q) ? inter : diff).insert(q);
                if (!inter.empty() && !diff.empty()) {
                    NP.push_back(inter); NP.push_back(diff);
                    auto it = find(W.begin(), W.end(), Y);
                    if (it != W.end()) { W.erase(it); W.push_back(inter); W.push_back(diff); }
                    else W.push_back(inter.size() <= diff.size() ? inter : diff);
                } else NP.push_back(Y);
            }
            P = NP;
        }
    }
    vector<string> groups;
    map<char, string> rep;
    for (auto &g : P) { string s(g.begin(), g.end()); groups.push_back(s); for (char q : g) rep[q] = s; }
    sort(groups.begin(), groups.end());
    cout << "minimal states: " << P.size() << " groups:";
    for (auto &g : groups) cout << " {" << g << "}";
    cout << "\n";
    vector<string> words = {""};
    for (int L = 1; L <= 6; L++) { size_t sz = words.size(); for (size_t i = 0; i < sz; i++) if ((int)words[i].size() == L - 1) for (char c : string("ab")) words.push_back(words[i] + c); }
    int same = 0;
    for (auto &w : words) {
        char s = 'A';
        string g = rep['A'];
        for (char ch : w) { s = DELTA[s][ch]; g = rep[DELTA[g[0]][ch]]; }
        same += ACCEPT.count(s) == (g == rep['E'] ? 1u : 0u);
    }
    cout << "same language on " << same << "/" << words.size() << " strings up to length 6\n";
}
