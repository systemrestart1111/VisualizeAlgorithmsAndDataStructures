#include <algorithm>
#include <cstdio>
#include <cstring>
#include <queue>
#include <set>
#include <utility>
#include <vector>
using namespace std;

const int N = 10;
vector<int> adj[N];
int match[N], p[N], base_[N];
bool used[N];

int lca(int a, int b) {
    bool seen[N] = {};
    for (;;) { a = base_[a]; seen[a] = true; if (match[a] < 0) break; a = p[match[a]]; }
    for (;;) { b = base_[b]; if (seen[b]) return b; b = p[match[b]]; }
}
void mark(int v, int b, int child, vector<bool> &blossom) {
    while (base_[v] != b) { blossom[base_[v]] = blossom[base_[match[v]]] = true; p[v] = child; child = match[v]; v = p[match[v]]; }
}
// BFS 交替樹；遇到奇環就把它收縮到共同的 base，找到未匹配點就沿路翻轉
bool augmentFrom(int root) {
    for (int i = 0; i < N; i++) { p[i] = -1; base_[i] = i; used[i] = false; }
    used[root] = true;
    queue<int> q;
    q.push(root);
    while (!q.empty()) {
        int v = q.front(); q.pop();
        for (int u : adj[v]) {
            if (base_[v] == base_[u] || match[v] == u) continue;
            if (u == root || (match[u] >= 0 && p[match[u]] >= 0)) {
                int cb = lca(v, u);
                vector<bool> blossom(N);
                mark(v, cb, u, blossom);
                mark(u, cb, v, blossom);
                for (int i = 0; i < N; i++) if (blossom[base_[i]]) { base_[i] = cb; if (!used[i]) { used[i] = true; q.push(i); } }
            } else if (p[u] < 0) {
                p[u] = v;
                if (match[u] < 0) {
                    while (u >= 0) { int pv = p[u], nxt = match[pv]; match[u] = pv; match[pv] = u; u = nxt; }
                    return true;
                }
                used[match[u]] = true;
                q.push(match[u]);
            }
        }
    }
    return false;
}
int memo[1 << N];
int brute(int mask) {
    if (memo[mask] >= 0) return memo[mask];
    int i = 0;
    while (i < N && (mask >> i & 1)) i++;
    if (i == N) return memo[mask] = 0;
    int res = brute(mask | (1 << i));
    for (int u : adj[i]) if (!(mask >> u & 1)) res = max(res, 1 + brute(mask | (1 << i) | (1 << u)));
    return memo[mask] = res;
}

int main() {
    vector<pair<int, int>> E = {{1, 2}, {2, 3}, {3, 4}, {4, 5}, {5, 1}, {3, 6}, {6, 7}, {7, 8}, {8, 9}, {9, 6}, {5, 10}};
    set<pair<int, int>> es;
    for (auto &e : E) { adj[e.first - 1].push_back(e.second - 1); adj[e.second - 1].push_back(e.first - 1); es.insert({e.first - 1, e.second - 1}); es.insert({e.second - 1, e.first - 1}); }
    memset(match, -1, sizeof match);
    int size = 0;
    for (int r = 0; r < N; r++) if (match[r] < 0 && augmentFrom(r)) size++;
    bool valid = true;
    set<int> usedV;
    for (int i = 0; i < N; i++) if (match[i] > i) { valid &= es.count({i, match[i]}) && !usedV.count(i) && !usedV.count(match[i]); usedV.insert(i); usedV.insert(match[i]); }
    memset(memo, -1, sizeof memo);
    printf("maximum matching: %d | brute force: %d | valid: %s\n", size, brute(0), valid ? "True" : "False");
}
