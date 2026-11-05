#include <algorithm>
#include <functional>
#include <iostream>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

string neg(const string &x) { return x[0] == '!' ? x.substr(1) : "!" + x; }

// (a ∨ b) ⇔ ¬a → b 且 ¬b → a；Tarjan 求 SCC，x 與 ¬x 同分量則無解
void solve(const string &text) {
    vector<pair<string, string>> cl;
    stringstream ss(text);
    string part;
    set<char> vs;
    while (getline(ss, part, ';')) {
        part.erase(0, part.find_first_not_of(' '));
        size_t bar = part.find('|');
        cl.push_back({part.substr(0, bar), part.substr(bar + 1)});
        vs.insert(cl.back().first.back());
        vs.insert(cl.back().second.back());
    }
    vector<string> nodes;
    for (char v : vs) { nodes.push_back(string(1, v)); nodes.push_back("!" + string(1, v)); }
    map<string, vector<string>> adj;
    for (auto &x : nodes) adj[x];
    for (auto &c : cl) { adj[neg(c.first)].push_back(c.second); adj[neg(c.second)].push_back(c.first); }
    for (auto &kv : adj) sort(kv.second.begin(), kv.second.end());
    map<string, int> idx, low, comp;
    vector<string> st;
    set<string> on;
    int t = 0, c = 0;
    function<void(const string &)> dfs = [&](const string &u) {
        idx[u] = low[u] = t++;
        st.push_back(u); on.insert(u);
        for (auto &v : adj[u]) {
            if (!idx.count(v)) { dfs(v); low[u] = min(low[u], low[v]); }
            else if (on.count(v)) low[u] = min(low[u], idx[v]);
        }
        if (low[u] == idx[u]) { string x; do { x = st.back(); st.pop_back(); on.erase(x); comp[x] = c; } while (x != u); c++; }
    };
    for (auto &u : nodes) if (!idx.count(u)) dfs(u);
    for (char v : vs) if (comp[string(1, v)] == comp["!" + string(1, v)]) { cout << text << " => unsatisfiable\n"; return; }
    map<char, bool> val;
    cout << text << " =>";
    for (char v : vs) { val[v] = comp[string(1, v)] < comp["!" + string(1, v)]; cout << " " << v << "=" << (val[v] ? 'T' : 'F'); }
    auto holds = [&](const string &x) { return x[0] == '!' ? !val[x[1]] : val[x[0]]; };
    bool ok = true;
    for (auto &p : cl) ok &= holds(p.first) || holds(p.second);
    cout << " | verified " << (ok ? "True" : "False") << "\n";
}

int main() {
    solve("a|b; !a|c; !b|!c; c|d; !d|!a");
    solve("a|b; a|!b; !a|b; !a|!b");
    solve("x|y; !x|y; !y|z");
}
