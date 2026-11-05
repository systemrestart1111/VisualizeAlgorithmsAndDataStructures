#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static char T[64];
static int n, sa[64], C[128], occ[128][65];
static int cmp(const void *a, const void *b) { return strcmp(T + *(const int *)a, T + *(const int *)b); }
static int icmp(const void *a, const void *b) { return *(const int *)a - *(const int *)b; }

/* 後綴陣列、BWT、C 表與 Occ 前綴計數 */
static void build(const char *text) {
    sprintf(T, "%s$", text);
    n = (int)strlen(T);
    for (int i = 0; i < n; i++) sa[i] = i;
    qsort(sa, n, sizeof(int), cmp);
    int cnt[128] = {0};
    for (int i = 0; i < n; i++) cnt[(int)T[i]]++;
    for (int c = 0, acc = 0; c < 128; c++) { C[c] = acc; acc += cnt[c]; }
    for (int c = 0; c < 128; c++) occ[c][0] = 0;
    for (int i = 0; i < n; i++) {
        char L = T[(sa[i] + n - 1) % n];
        for (int c = 0; c < 128; c++) occ[c][i + 1] = occ[c][i] + (c == L);
    }
}
/* 向後搜尋：每讀一個字元，sp = C[c] + Occ(c, sp)、ep = C[c] + Occ(c, ep) */
static int search(const char *pat, int *pos) {
    int sp = 0, ep = n;
    for (int k = (int)strlen(pat) - 1; k >= 0; k--) {
        int c = pat[k];
        sp = C[c] + occ[c][sp];
        ep = C[c] + occ[c][ep];
        if (sp >= ep) return 0;
    }
    for (int i = sp; i < ep; i++) pos[i - sp] = sa[i];
    qsort(pos, ep - sp, sizeof(int), icmp);
    return ep - sp;
}

int main(void) {
    const char *text = "abracadabra", *pats[6] = {"a", "abra", "cad", "ra", "xyz", "abracadabra"};
    int tl = (int)strlen(text);
    build(text);
    for (int k = 0; k < 6; k++) {
        int pos[64], m = search(pats[k], pos), pl = (int)strlen(pats[k]), first = 1;
        printf("'%s': %d at [", pats[k], m);
        for (int i = 0; i < m; i++) printf(i ? ", %d" : "%d", pos[i]);
        printf("] (brute [");
        for (int i = 0; i + pl <= tl; i++) if (!strncmp(text + i, pats[k], pl)) { printf(first ? "%d" : ", %d", i); first = 0; }
        printf("])\n");
    }
    return 0;
}
