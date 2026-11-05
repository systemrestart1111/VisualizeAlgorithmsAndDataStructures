#include <stdio.h>
#include <string.h>

/* 文字以字串表示（"a" 或 "!a"）；節點依 v, !v 的順序編號，鄰居依字串排序 */
static char names[52][3];
static int n, adj[52][64], deg[52], idx[52], low[52], comp[52], st[52], on[52], sp, T, C;

static int node_of(const char *s) { for (int i = 0; i < n; i++) if (!strcmp(names[i], s)) return i; return -1; }
static void neg(const char *s, char *out) { if (s[0] == '!') strcpy(out, s + 1); else { out[0] = '!'; strcpy(out + 1, s); } }
static void dfs(int u) {
    idx[u] = low[u] = T++; st[sp++] = u; on[u] = 1;
    for (int i = 0; i < deg[u]; i++) {
        int v = adj[u][i];
        if (idx[v] < 0) { dfs(v); if (low[v] < low[u]) low[u] = low[v]; }
        else if (on[v] && idx[v] < low[u]) low[u] = idx[v];
    }
    if (low[u] == idx[u]) { int x; do { x = st[--sp]; on[x] = 0; comp[x] = C; } while (x != u); C++; }
}

/* (a ∨ b) ⇔ ¬a → b 且 ¬b → a；Tarjan 求 SCC，x 與 ¬x 同分量則無解 */
static void solve(const char *text) {
    char buf[128], lits[16][2][3];
    int nc = 0, used[26] = {0};
    strcpy(buf, text);
    for (char *tok = strtok(buf, ";"); tok; tok = strtok(NULL, ";")) {
        while (*tok == ' ') tok++;
        char *bar = strchr(tok, '|');
        *bar = 0;
        strcpy(lits[nc][0], tok);
        strcpy(lits[nc][1], bar + 1);
        for (int k = 0; k < 2; k++) used[lits[nc][k][strlen(lits[nc][k]) - 1] - 'a'] = 1;
        nc++;
    }
    n = 0;
    for (int v = 0; v < 26; v++) if (used[v]) { names[n][0] = 'a' + v; names[n][1] = 0; n++; names[n][0] = '!'; names[n][1] = 'a' + v; names[n][2] = 0; n++; }
    for (int i = 0; i < n; i++) { deg[i] = 0; idx[i] = -1; on[i] = 0; }
    for (int c = 0; c < nc; c++) {
        char na[3], nb[3];
        neg(lits[c][0], na); neg(lits[c][1], nb);
        int u1 = node_of(na), v1 = node_of(lits[c][1]), u2 = node_of(nb), v2 = node_of(lits[c][0]);
        adj[u1][deg[u1]++] = v1;
        adj[u2][deg[u2]++] = v2;
    }
    for (int u = 0; u < n; u++)
        for (int i = 1; i < deg[u]; i++) for (int j = i; j > 0 && strcmp(names[adj[u][j - 1]], names[adj[u][j]]) > 0; j--) { int x = adj[u][j]; adj[u][j] = adj[u][j - 1]; adj[u][j - 1] = x; }
    T = C = sp = 0;
    for (int u = 0; u < n; u++) if (idx[u] < 0) dfs(u);
    for (int i = 0; i < n; i += 2) if (comp[i] == comp[i + 1]) { printf("%s => unsatisfiable\n", text); return; }
    int val[26] = {0}, ok = 1;
    printf("%s =>", text);
    for (int i = 0; i < n; i += 2) { val[names[i][0] - 'a'] = comp[i] < comp[i + 1]; printf(" %c=%c", names[i][0], val[names[i][0] - 'a'] ? 'T' : 'F'); }
    for (int c = 0; c < nc; c++) {
        int h[2];
        for (int k = 0; k < 2; k++) { const char *x = lits[c][k]; h[k] = x[0] == '!' ? !val[x[1] - 'a'] : val[x[0] - 'a']; }
        if (!h[0] && !h[1]) ok = 0;
    }
    printf(" | verified %s\n", ok ? "True" : "False");
}

int main(void) {
    solve("a|b; !a|c; !b|!c; c|d; !d|!a");
    solve("a|b; a|!b; !a|b; !a|!b");
    solve("x|y; !x|y; !y|z");
    return 0;
}
