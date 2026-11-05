#include <algorithm>
#include <iostream>
#include <map>
#include <set>
#include <string>
#include <tuple>
#include <vector>
using namespace std;

vector<tuple<int, int, char>> trans;  // c = 0 表示 ε

// 與 thompson-nfa 相同：先轉後序式，再以堆疊組合片段；回傳 {起點, 接受}
pair<int, int> thompson(const string &re) {
    string tok, out, ops;
    for (size_t i = 0; i < re.size(); i++) { tok += re[i]; if (i + 1 < re.size() && string("|)*+?").find(re[i + 1]) == string::npos && re[i] != '(' && re[i] != '|') tok += '.'; }
    auto prec = [](char c) { return c == '|' ? 1 : c == '.' ? 2 : 3; };
    for (char t : tok) {
        if (isalnum((unsigned char)t)) out += t;
        else if (t == '(') ops += t;
        else if (t == ')') { while (ops.back() != '(') { out += ops.back(); ops.pop_back(); } ops.pop_back(); }
        else { while (!ops.empty() && ops.back() != '(' && prec(ops.back()) >= prec(t)) { out += ops.back(); ops.pop_back(); } ops += t; }
    }
    while (!ops.empty()) { out += ops.back(); ops.pop_back(); }
    trans.clear();
    vector<pair<int, int>> st;
    int n = 0;
    for (char t : out) {
        if (isalnum((unsigned char)t)) { trans.emplace_back(n, n + 1, t); st.push_back({n, n + 1}); n += 2; }
        else if (t == '.') { auto b = st.back(); st.pop_back(); auto a = st.back(); st.pop_back(); trans.emplace_back(a.second, b.first, 0); st.push_back({a.first, b.second}); }
        else if (t == '|') { auto b = st.back(); st.pop_back(); auto a = st.back(); st.pop_back(); trans.emplace_back(n, a.first, 0); trans.emplace_back(n, b.first, 0); trans.emplace_back(a.second, n + 1, 0); trans.emplace_back(b.second, n + 1, 0); st.push_back({n, n + 1}); n += 2; }
        else { auto a = st.back(); st.pop_back(); trans.emplace_back(n, a.first, 0); trans.emplace_back(a.second, n + 1, 0); if (t != '+') trans.emplace_back(n, n + 1, 0); if (t != '?') trans.emplace_back(a.second, a.first, 0); st.push_back({n, n + 1}); n += 2; }
    }
    return st[0];
}
set<int> closure(set<int> s) {
    vector<int> stack(s.begin(), s.end());
    while (!stack.empty()) { int u = stack.back(); stack.pop_back(); for (auto &t : trans) if (get<0>(t) == u && !get<2>(t) && !s.count(get<1>(t))) { s.insert(get<1>(t)); stack.push_back(get<1>(t)); } }
    return s;
}
set<int> move(const set<int> &s, char c) { set<int> r; for (auto &t : trans) if (get<2>(t) == c && s.count(get<0>(t))) r.insert(get<1>(t)); return r; }

int main() {
    for (string re : {"(a|b)*abb", "a(b|c)*", "(ab)+c?"}) {
        auto sa = thompson(re);
        set<char> al;
        for (auto &t : trans) if (get<2>(t)) al.insert(get<2>(t));
        vector<char> alpha(al.begin(), al.end());
        // DFA 狀態 = NFA 狀態集合；BFS 取 move 後的 ε-closure
        vector<set<int>> states = {closure({sa.first})};
        vector<map<char, int>> table(1);
        for (size_t i = 0; i < states.size(); i++)
            for (char c : alpha) {
                auto mv = move(states[i], c);
                if (mv.empty()) continue;
                auto t = closure(mv);
                size_t j = find(states.begin(), states.end(), t) - states.begin();
                if (j == states.size()) { states.push_back(t); table.push_back({}); }
                table[i][c] = j;
            }
        int nacc = 0;
        for (auto &s : states) nacc += s.count(sa.second);
        // 以所有長度 ≤ 5 的字串比對 NFA 與 DFA
        vector<string> words = {""};
        for (int L = 1; L <= 5; L++) { size_t sz = words.size(); for (size_t i = 0; i < sz; i++) if ((int)words[i].size() == L - 1) for (char c : alpha) words.push_back(words[i] + c); }
        int agree = 0;
        for (auto &w : words) {
            auto cur = closure({sa.first});
            int s = 0;
            bool dead = false;
            for (char ch : w) { cur = closure(move(cur, ch)); if (!dead) { if (table[s].count(ch)) s = table[s][ch]; else dead = true; } }
            agree += (cur.count(sa.second) > 0) == (!dead && states[s].count(sa.second) > 0);
        }
        cout << re << ": DFA states " << states.size() << ", accepting " << nacc << ", agree on " << agree << "/" << words.size() << " strings\n";
    }
}
