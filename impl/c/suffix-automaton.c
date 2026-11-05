#include <stdio.h>
#include <string.h>

#define MAXS 64
static int len_[MAXS], link_[MAXS], nxt[MAXS][26], sz;

/* 逐字元擴充；len 不連續時複製 clone */
static void build(const char *s) {
    memset(nxt, -1, sizeof nxt);
    sz = 1; len_[0] = 0; link_[0] = -1;
    int last = 0;
    for (const char *p0 = s; *p0; p0++) {
        int c = *p0 - 'a', cur = sz++, p = last;
        len_[cur] = len_[last] + 1;
        while (p != -1 && nxt[p][c] < 0) { nxt[p][c] = cur; p = link_[p]; }
        if (p == -1) link_[cur] = 0;
        else {
            int q = nxt[p][c];
            if (len_[p] + 1 == len_[q]) link_[cur] = q;
            else {
                int clone = sz++;
                len_[clone] = len_[p] + 1;
                link_[clone] = link_[q];
                memcpy(nxt[clone], nxt[q], sizeof nxt[q]);
                while (p != -1 && nxt[p][c] == q) { nxt[p][c] = clone; p = link_[p]; }
                link_[q] = link_[cur] = clone;
            }
        }
        last = cur;
    }
}
/* 暴力：收集所有子字串並去重複 */
static int brute(const char *s) {
    static char subs[256][16];
    int n = (int)strlen(s), cnt = 0;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j <= n; j++) {
            char t[16];
            memcpy(t, s + i, j - i); t[j - i] = 0;
            int dup = 0;
            for (int k = 0; k < cnt && !dup; k++) dup = !strcmp(subs[k], t);
            if (!dup) strcpy(subs[cnt++], t);
        }
    return cnt;
}

int main(void) {
    const char *tests[4] = {"abcbcabc", "banana", "aaaa", "abcd"};
    for (int t = 0; t < 4; t++) {
        build(tests[t]);
        int distinct = 0;
        for (int v = 1; v < sz; v++) distinct += len_[v] - len_[link_[v]];
        printf("%s: states %d, distinct substrings %d (brute %d)\n", tests[t], sz, distinct, brute(tests[t]));
    }
    return 0;
}
