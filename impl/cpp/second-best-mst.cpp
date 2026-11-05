#include <algorithm>
#include <functional>
#include <iostream>
#include <map>
#include <numeric>
#include <queue>
#include <tuple>
#include <vector>
using namespace std;

vector<tuple<char, char, int>> E = {{'A', 'B', 4}, {'A', 'C', 3}, {'B', 'C', 1}, {'B', 'D', 2}, {'C', 'D', 4}, {'C', 'E', 5}, {'D', 'E', 6}, {'D', 'F', 7}, {'E', 'F', 3}};

// 樹上 a 到 b 的路徑（回傳邊的編號）
vector<int> pathEdges(const vector<int> &tree, char a, char b) {
    map<char, pair<char, int>> prev{{a, {0, -1}}};
    queue<char> q;
    q.push(a);
    while (!q.empty()) {
        char x = q.front(); q.pop();
        for (int i : tree) {
            char u = get<0>(E[i]), v = get<1>(E[i]), y = u == x ? v : v == x ? u : 0;
            if (y && !prev.count(y)) { prev[y] = {x, i}; q.push(y); }
        }
    }
    vector<int> out;
    for (char x = b; x != a; x = prev[x].first) out.push_back(prev[x].second);
    return out;
}

int main() {
    map<char, char> p;
    for (auto &e : E) { p[get<0>(e)] = get<0>(e); p[get<1>(e)] = get<1>(e); }
    function<char(char)> find = [&](char x) { while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; } return x; };
    vector<int> order(E.size()), tree;
    iota(order.begin(), order.end(), 0);
    stable_sort(order.begin(), order.end(), [](int a, int b) { return get<2>(E[a]) < get<2>(E[b]); });
    int W = 0;
    for (int i : order) { char a = find(get<0>(E[i])), b = find(get<1>(E[i])); if (a != b) { p[a] = b; tree.push_back(i); W += get<2>(E[i]); } }
    cout << "MST weight: " << W << " edges:";
    for (int i : tree) cout << " " << get<0>(E[i]) << get<1>(E[i]);
    cout << "\n";
    for (bool strict : {false, true}) {
        int best = -1;
        for (size_t i = 0; i < E.size(); i++) {
            if (std::find(tree.begin(), tree.end(), (int)i) != tree.end()) continue;
            int w = get<2>(E[i]), m = -1;
            for (int j : pathEdges(tree, get<0>(E[i]), get<1>(E[i]))) if ((!strict || get<2>(E[j]) < w) && get<2>(E[j]) > m) m = get<2>(E[j]);
            if (m >= 0 && (best < 0 || W - m + w < best)) best = W - m + w;
        }
        cout << (strict ? "strict" : "allow equal") << " second best: " << best << "\n";
    }
}
