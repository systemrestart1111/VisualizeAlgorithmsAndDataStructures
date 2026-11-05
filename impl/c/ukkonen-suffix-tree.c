#include <stdio.h>
#include <string.h>

/* 節點：邊為 text[start .. *end]；子節點以字元索引（$ 與 a..z） */
#define MAXN 128
static int start_[MAXN], *endp[MAXN], endv[MAXN], kid[MAXN][27], link_[MAXN], cnt;
static int leafEnd;
static const char *T;
static int ci(char c) { return c == '$' ? 0 : c - 'a' + 1; }
static int mk(int s, int *e) { start_[cnt] = s; endp[cnt] = e; memset(kid[cnt], -1, sizeof kid[cnt]); link_[cnt] = 0; return cnt++; }
static int elen(int n) { return *endp[n] - start_[n] + 1; }

/* Ukkonen：葉子共用全域 end；active point 記住插入位置；新內部節點以 suffix link 串接 */
static void build(void) {
    int n = (int)strlen(T);
    cnt = 0;
    endv[0] = -1;
    int root = mk(-1, &endv[0]);
    int aNode = root, aEdge = 0, aLen = 0, rem = 0;
    for (int i = 0; i < n; i++) {
        leafEnd = i;
        rem++;
        int lastNew = -1;
        while (rem > 0) {
            if (aLen == 0) aEdge = i;
            int ch = ci(T[aEdge]);
            if (kid[aNode][ch] < 0) {
                kid[aNode][ch] = mk(i, &leafEnd);
                if (lastNew >= 0) { link_[lastNew] = aNode; lastNew = -1; }
            } else {
                int nx = kid[aNode][ch];
                if (aLen >= elen(nx)) { aEdge += elen(nx); aLen -= elen(nx); aNode = nx; continue; }
                if (T[start_[nx] + aLen] == T[i]) {
                    if (lastNew >= 0 && aNode != root) { link_[lastNew] = aNode; lastNew = -1; }
                    aLen++;
                    break;
                }
                endv[cnt] = start_[nx] + aLen - 1;
                int split = mk(start_[nx], &endv[cnt]);
                kid[aNode][ch] = split;
                kid[split][ci(T[i])] = mk(i, &leafEnd);
                start_[nx] += aLen;
                kid[split][ci(T[start_[nx]])] = nx;
                if (lastNew >= 0) link_[lastNew] = split;
                lastNew = split;
            }
            rem--;
            if (aNode == root && aLen > 0) { aLen--; aEdge = i - rem + 1; }
            else if (aNode != root) aNode = link_[aNode];
        }
    }
}
/* 依邊的首字元字典序 DFS，葉子的出現順序就是後綴陣列 */
static int sa[64], nsa;
static void dfs(int u, int depth, int n) {
    int leaf = 1;
    for (int c = 0; c < 27; c++) if (kid[u][c] >= 0) { leaf = 0; dfs(kid[u][c], depth + elen(kid[u][c]), n); }
    if (leaf) sa[nsa++] = n - depth;
}

int main(void) {
    const char *tests[4] = {"banana", "abcabxabcd", "mississippi", "aaaa"};
    char t[64];
    for (int k = 0; k < 4; k++) {
        sprintf(t, "%s$", tests[k]);
        T = t;
        int n = (int)strlen(t);
        build();
        nsa = 0;
        dfs(0, 0, n);
        int naive[64], ok = 1;
        for (int i = 0; i < n; i++) naive[i] = i;
        for (int i = 1; i < n; i++) for (int j = i; j > 0 && strcmp(t + naive[j - 1], t + naive[j]) > 0; j--) { int x = naive[j]; naive[j] = naive[j - 1]; naive[j - 1] = x; }
        printf("%s: leaves %d, suffix array [", t, nsa);
        for (int i = 0; i < nsa; i++) { printf(i ? ", %d" : "%d", sa[i]); if (sa[i] != naive[i]) ok = 0; }
        printf("], matches naive %s\n", ok && nsa == n ? "True" : "False");
    }
    return 0;
}
