#include <stdio.h>
#include <string.h>

#define N 10
static int adj[N][N], deg[N], match[N], p[N], base_[N], used[N], q[N * N], qh, qt;

static int lca(int a, int b) {
    int seen[N] = {0};
    for (;;) { a = base_[a]; seen[a] = 1; if (match[a] < 0) break; a = p[match[a]]; }
    for (;;) { b = base_[b]; if (seen[b]) return b; b = p[match[b]]; }
}
static void mark(int v, int b, int child, int *blossom) {
    while (base_[v] != b) { blossom[base_[v]] = blossom[base_[match[v]]] = 1; p[v] = child; child = match[v]; v = p[match[v]]; }
}
/* BFS 交替樹；遇到奇環就把它收縮到共同的 base，找到未匹配點就沿路翻轉 */
static int augment_from(int root) {
    for (int i = 0; i < N; i++) { p[i] = -1; base_[i] = i; used[i] = 0; }
    used[root] = 1; qh = qt = 0; q[qt++] = root;
    while (qh < qt) {
        int v = q[qh++];
        for (int k = 0; k < deg[v]; k++) {
            int u = adj[v][k];
            if (base_[v] == base_[u] || match[v] == u) continue;
            if (u == root || (match[u] >= 0 && p[match[u]] >= 0)) {
                int cb = lca(v, u), blossom[N] = {0};
                mark(v, cb, u, blossom);
                mark(u, cb, v, blossom);
                for (int i = 0; i < N; i++) if (blossom[base_[i]]) { base_[i] = cb; if (!used[i]) { used[i] = 1; q[qt++] = i; } }
            } else if (p[u] < 0) {
                p[u] = v;
                if (match[u] < 0) {
                    while (u >= 0) { int pv = p[u], nxt = match[pv]; match[u] = pv; match[pv] = u; u = nxt; }
                    return 1;
                }
                used[match[u]] = 1;
                q[qt++] = match[u];
            }
        }
    }
    return 0;
}
static int memo[1 << N];
static int brute(int mask) {
    if (memo[mask] >= 0) return memo[mask];
    int i = 0;
    while (i < N && (mask >> i & 1)) i++;
    if (i == N) return memo[mask] = 0;
    int res = brute(mask | (1 << i));
    for (int k = 0; k < deg[i]; k++) { int u = adj[i][k]; if (!(mask >> u & 1)) { int r = 1 + brute(mask | (1 << i) | (1 << u)); if (r > res) res = r; } }
    return memo[mask] = res;
}

int main(void) {
    int E[11][2] = {{1, 2}, {2, 3}, {3, 4}, {4, 5}, {5, 1}, {3, 6}, {6, 7}, {7, 8}, {8, 9}, {9, 6}, {5, 10}};
    for (int e = 0; e < 11; e++) { int a = E[e][0] - 1, b = E[e][1] - 1; adj[a][deg[a]++] = b; adj[b][deg[b]++] = a; }
    for (int i = 0; i < N; i++) match[i] = -1;
    int size = 0, valid = 1, usedV[N] = {0};
    for (int r = 0; r < N; r++) if (match[r] < 0 && augment_from(r)) size++;
    for (int i = 0; i < N; i++) if (match[i] > i) {
        int ok = 0;
        for (int e = 0; e < 11; e++) if ((E[e][0] - 1 == i && E[e][1] - 1 == match[i]) || (E[e][1] - 1 == i && E[e][0] - 1 == match[i])) ok = 1;
        if (!ok || usedV[i] || usedV[match[i]]) valid = 0;
        usedV[i] = usedV[match[i]] = 1;
    }
    memset(memo, -1, sizeof memo);
    printf("maximum matching: %d | brute force: %d | valid: %s\n", size, brute(0), valid ? "True" : "False");
    return 0;
}
