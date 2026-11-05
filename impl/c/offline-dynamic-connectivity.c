#include <stdio.h>
#include <string.h>

/* 頂點為 1..9；事件 op a b */
#define T 12
static char op[T] = {'+', '+', '?', '+', '-', '?', '+', '?', '+', '?', '-', '?'};
static int A[T] = {1, 2, 1, 4, 2, 1, 3, 1, 1, 2, 1, 2}, Bv[T] = {2, 3, 3, 5, 3, 3, 4, 5, 3, 5, 2, 5};
static int seg[64][16], nseg[64][1], segcnt[64];
static int parent[10], sz[10], hist[64][2], top, ans[T];

static void insert(int o, int l, int r, int ql, int qr, int e) {
    if (qr < l || r < ql || ql > qr) return;
    if (ql <= l && r <= qr) { seg[o][segcnt[o]++] = e; return; }
    int m = (l + r) / 2;
    insert(2 * o, l, m, ql, qr, e);
    insert(2 * o + 1, m + 1, r, ql, qr, e);
}
static int find(int x) { while (parent[x] != x) x = parent[x]; return x; }   /* 不壓縮路徑 */
/* DFS 線段樹：合併掛在節點上的邊，葉子回答查詢，離開時回滾 */
static void dfs(int o, int l, int r) {
    int before = top;
    for (int i = 0; i < segcnt[o]; i++) {
        int e = seg[o][i], ra = find(A[e]), rb = find(Bv[e]);
        if (ra == rb) continue;
        if (sz[ra] > sz[rb]) { int t = ra; ra = rb; rb = t; }
        parent[ra] = rb; sz[rb] += sz[ra];
        hist[top][0] = ra; hist[top][1] = rb; top++;
    }
    if (l == r) { if (op[l] == '?') ans[l] = find(A[l]) == find(Bv[l]); }
    else { int m = (l + r) / 2; dfs(2 * o, l, m); dfs(2 * o + 1, m + 1, r); }
    while (top > before) { top--; int ra = hist[top][0], rb = hist[top][1]; parent[ra] = ra; sz[rb] -= sz[ra]; }
}

int main(void) {
    (void)nseg;
    /* 每條邊的存活區間：用加入事件的編號代表這條邊 */
    int openAt[10][10];
    memset(openAt, -1, sizeof openAt);
    for (int t = 0; t < T; t++) {
        int a = A[t] < Bv[t] ? A[t] : Bv[t], b = A[t] < Bv[t] ? Bv[t] : A[t];
        if (op[t] == '+' && openAt[a][b] < 0) openAt[a][b] = t;
        else if (op[t] == '-' && openAt[a][b] >= 0) { insert(1, 0, T - 1, openAt[a][b], t - 1, openAt[a][b]); openAt[a][b] = -1; }
    }
    for (int a = 0; a < 10; a++) for (int b = 0; b < 10; b++) if (openAt[a][b] >= 0) insert(1, 0, T - 1, openAt[a][b], T - 1, openAt[a][b]);
    for (int v = 0; v < 10; v++) { parent[v] = v; sz[v] = 1; }
    dfs(1, 0, T - 1);
    for (int t = 0; t < T; t++) if (op[t] == '?') printf("t=%d ? %d %d: %s\n", t, A[t], Bv[t], ans[t] ? "connected" : "not connected");
    return 0;
}
