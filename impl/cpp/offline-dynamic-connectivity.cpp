#include <algorithm>
#include <cstdio>
#include <map>
#include <sstream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

struct Ev { char op; int a, b; };
vector<Ev> ev;
map<int, vector<pair<int, int>>> seg;
map<int, int> parent, sz, answers;
vector<pair<int, int>> hist;

void insert(int o, int l, int r, int ql, int qr, pair<int, int> e) {
    if (qr < l || r < ql || ql > qr) return;
    if (ql <= l && r <= qr) { seg[o].push_back(e); return; }
    int m = (l + r) / 2;
    insert(2 * o, l, m, ql, qr, e);
    insert(2 * o + 1, m + 1, r, ql, qr, e);
}
int find(int x) { if (!parent.count(x)) { parent[x] = x; sz[x] = 1; } while (parent[x] != x) x = parent[x]; return x; }
// DFS 線段樹：合併掛在節點上的邊，葉子回答查詢，離開時回滾
void dfs(int o, int l, int r) {
    size_t before = hist.size();
    for (auto &e : seg[o]) {
        int ra = find(e.first), rb = find(e.second);
        if (ra == rb) continue;
        if (sz[ra] > sz[rb]) swap(ra, rb);
        parent[ra] = rb; sz[rb] += sz[ra];
        hist.push_back({ra, rb});
    }
    if (l == r) { if (ev[l].op == '?') answers[l] = find(ev[l].a) == find(ev[l].b); }
    else { int m = (l + r) / 2; dfs(2 * o, l, m); dfs(2 * o + 1, m + 1, r); }
    while (hist.size() > before) { auto h = hist.back(); hist.pop_back(); parent[h.first] = h.first; sz[h.second] -= sz[h.first]; }
}

int main() {
    string text = "+ 1 2; + 2 3; ? 1 3; + 4 5; - 2 3; ? 1 3; + 3 4; ? 1 5; + 1 3; ? 2 5; - 1 2; ? 2 5";
    stringstream ss(text);
    string part;
    while (getline(ss, part, ';')) { stringstream ps(part); Ev e; ps >> e.op >> e.a >> e.b; ev.push_back(e); }
    int T = ev.size();
    // 每條邊的存活區間
    map<pair<int, int>, int> open;
    for (int t = 0; t < T; t++) {
        auto k = make_pair(min(ev[t].a, ev[t].b), max(ev[t].a, ev[t].b));
        if (ev[t].op == '+' && !open.count(k)) open[k] = t;
        else if (ev[t].op == '-' && open.count(k)) { insert(1, 0, T - 1, open[k], t - 1, k); open.erase(k); }
    }
    for (auto &kv : open) insert(1, 0, T - 1, kv.second, T - 1, kv.first);
    dfs(1, 0, T - 1);
    for (auto &kv : answers) printf("t=%d ? %d %d: %s\n", kv.first, ev[kv.first].a, ev[kv.first].b, kv.second ? "connected" : "not connected");
}
