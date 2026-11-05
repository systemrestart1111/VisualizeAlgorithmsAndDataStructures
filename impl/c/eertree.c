#include <stdio.h>
#include <string.h>

/* 節點 0：長度 −1；節點 1：長度 0；pal 存回文字串本身以便輸出 */
static int len_[40], link_[40], kid[40][26], n;
static char pal[40][40];
static const char *S;
static int fits(int v, int i) { int j = i - len_[v] - 1; return j >= 0 && S[j] == S[i]; }

/* 兩個虛根；每次從最長回文後綴往上找能在兩側接上 c 的回文 */
static void build(const char *s) {
    S = s; n = 2;
    memset(kid, -1, sizeof kid);
    len_[0] = -1; len_[1] = 0; link_[0] = link_[1] = 0; pal[0][0] = pal[1][0] = 0;
    int last = 1;
    for (int i = 0; s[i]; i++) {
        int c = s[i] - 'a', cur = last;
        while (!fits(cur, i)) cur = link_[cur];
        if (kid[cur][c] >= 0) { last = kid[cur][c]; continue; }
        int v = n++;
        len_[v] = len_[cur] + 2;
        if (len_[v] == 1) { pal[v][0] = s[i]; pal[v][1] = 0; link_[v] = 1; }
        else {
            sprintf(pal[v], "%c%s%c", s[i], pal[cur], s[i]);
            int w = link_[cur];
            while (!fits(w, i)) w = link_[w];
            link_[v] = kid[w][c];
        }
        kid[cur][c] = v;
        last = v;
    }
}
static int cmp(const void *a, const void *b) { return strcmp((const char *)a, (const char *)b); }

int main(void) {
    const char *tests[4] = {"abacabadab", "eertree", "aaaa", "abc"};
    for (int t = 0; t < 4; t++) {
        const char *s = tests[t];
        build(s);
        char out[40][40];
        int m = n - 2, L = (int)strlen(s), brute = 0;
        for (int v = 2; v < n; v++) strcpy(out[v - 2], pal[v]);
        qsort(out, m, sizeof out[0], cmp);
        static char seen[400][40];
        for (int i = 0; i < L; i++) for (int j = i + 1; j <= L; j++) {
            int ok = 1;
            for (int a = i, b = j - 1; a < b; a++, b--) if (s[a] != s[b]) ok = 0;
            if (!ok) continue;
            char tmp[40];
            memcpy(tmp, s + i, j - i); tmp[j - i] = 0;
            int dup = 0;
            for (int k = 0; k < brute && !dup; k++) dup = !strcmp(seen[k], tmp);
            if (!dup) strcpy(seen[brute++], tmp);
        }
        printf("%s: %d palindromes [", s, m);
        for (int i = 0; i < m; i++) printf(i ? ", '%s'" : "'%s'", out[i]);
        printf("] (brute %d)\n", brute);
    }
    return 0;
}
