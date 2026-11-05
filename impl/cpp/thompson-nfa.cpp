#include <iostream>
#include <set>
#include <string>
#include <tuple>
#include <vector>
using namespace std;

struct NFA { int start, accept, n; vector<tuple<int, int, char>> trans; };  // c = 0 表示 ε

// 插入隱含的連接符號「.」後，用 Shunting-yard 轉成後序式
string toPostfix(const string &re) {
    string tok, out, ops;
    for (size_t i = 0; i < re.size(); i++) {
        tok += re[i];
        if (i + 1 < re.size() && string("|)*+?").find(re[i + 1]) == string::npos && re[i] != '(' && re[i] != '|') tok += '.';
    }
    auto prec = [](char c) { return c == '|' ? 1 : c == '.' ? 2 : 3; };
    for (char t : tok) {
        if (isalnum((unsigned char)t)) out += t;
        else if (t == '(') ops += t;
        else if (t == ')') { while (ops.back() != '(') { out += ops.back(); ops.pop_back(); } ops.pop_back(); }
        else { while (!ops.empty() && ops.back() != '(' && prec(ops.back()) >= prec(t)) { out += ops.back(); ops.pop_back(); } ops += t; }
    }
    while (!ops.empty()) { out += ops.back(); ops.pop_back(); }
    return out;
}
// 每個片段有一個起點與一個接受狀態
NFA thompson(const string &re) {
    NFA m{0, 0, 0, {}};
    vector<pair<int, int>> st;
    for (char t : toPostfix(re)) {
        if (isalnum((unsigned char)t)) { int s = m.n++, a = m.n++; m.trans.emplace_back(s, a, t); st.push_back({s, a}); }
        else if (t == '.') { auto b = st.back(); st.pop_back(); auto a = st.back(); st.pop_back(); m.trans.emplace_back(a.second, b.first, 0); st.push_back({a.first, b.second}); }
        else if (t == '|') {
            auto b = st.back(); st.pop_back(); auto a = st.back(); st.pop_back();
            int s = m.n++, e = m.n++;
            m.trans.emplace_back(s, a.first, 0); m.trans.emplace_back(s, b.first, 0); m.trans.emplace_back(a.second, e, 0); m.trans.emplace_back(b.second, e, 0);
            st.push_back({s, e});
        } else {
            auto a = st.back(); st.pop_back();
            int s = m.n++, e = m.n++;
            m.trans.emplace_back(s, a.first, 0); m.trans.emplace_back(a.second, e, 0);
            if (t != '+') m.trans.emplace_back(s, e, 0);
            if (t != '?') m.trans.emplace_back(a.second, a.first, 0);
            st.push_back({s, e});
        }
    }
    m.start = st[0].first; m.accept = st[0].second;
    return m;
}
set<int> closure(const NFA &m, set<int> cur) {
    vector<int> stack(cur.begin(), cur.end());
    while (!stack.empty()) {
        int u = stack.back(); stack.pop_back();
        for (auto &t : m.trans) if (get<0>(t) == u && !get<2>(t) && !cur.count(get<1>(t))) { cur.insert(get<1>(t)); stack.push_back(get<1>(t)); }
    }
    return cur;
}
bool accepts(const NFA &m, const string &w) {
    set<int> cur = closure(m, {m.start});
    for (char ch : w) {
        set<int> nx;
        for (auto &t : m.trans) if (cur.count(get<0>(t)) && get<2>(t) == ch) nx.insert(get<1>(t));
        cur = closure(m, nx);
    }
    return cur.count(m.accept);
}

int main() {
    vector<pair<string, vector<string>>> cases = {{"(a|b)*abb", {"abb", "aabb", "babb", "ab", "", "abab"}}, {"a(b|c)*", {"a", "abcb", "b", "ac"}}, {"(ab)+c?", {"ab", "ababc", "c", "abcc"}}};
    for (auto &c : cases) {
        NFA m = thompson(c.first);
        cout << c.first << ": " << m.n << " states, " << m.trans.size() << " transitions;";
        for (auto &w : c.second) cout << " " << (w.empty() ? "ε" : w) << "=" << (accepts(m, w) ? 'Y' : 'N');
        cout << "\n";
    }
}
