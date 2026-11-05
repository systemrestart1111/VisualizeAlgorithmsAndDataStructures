#include <stdio.h>
#include <string.h>

/* 節點的子邊依首字元索引（a..z）；label 存在節點池中 */
typedef struct { int end, kid[26]; char label[26][32]; } Node;
static Node pool[256];
static int cnt = 1;

static int new_node(void) { memset(&pool[cnt], 0, sizeof(Node)); return cnt++; }

/* 共享一部分的邊要在分岔處分裂 */
static void insert(const char *w) {
    int n = 0, i = 0, len = (int)strlen(w);
    while (i < len) {
        int c = w[i] - 'a';
        if (!pool[n].kid[c]) {
            int leaf = new_node();
            pool[leaf].end = 1;
            pool[n].kid[c] = leaf;
            strcpy(pool[n].label[c], w + i);
            return;
        }
        char *label = pool[n].label[c];
        int child = pool[n].kid[c], k = 0, ll = (int)strlen(label);
        while (k < ll && i + k < len && label[k] == w[i + k]) k++;
        if (k == ll) { n = child; i += k; continue; }
        int mid = new_node(), c2 = label[k] - 'a';
        pool[mid].kid[c2] = child;
        strcpy(pool[mid].label[c2], label + k);
        label[k] = 0;
        pool[n].kid[c] = mid;
        n = mid; i += k;
    }
    pool[n].end = 1;
}
/* 回傳停下的節點（0 表示找不到），*mid 表示停在邊的中間 */
static int walk(const char *w, int *mid) {
    int n = 0, i = 0, len = (int)strlen(w);
    *mid = 0;
    while (i < len) {
        int c = w[i] - 'a';
        if (!pool[n].kid[c]) return -1;
        const char *label = pool[n].label[c];
        int ll = (int)strlen(label), part = len - i < ll ? len - i : ll;
        if (strncmp(label, w + i, part)) return -1;
        if (part < ll) { *mid = 1; return pool[n].kid[c]; }
        n = pool[n].kid[c]; i += ll;
    }
    return n;
}
static int count(int n) { int s = pool[n].end; for (int c = 0; c < 26; c++) if (pool[n].kid[c]) s += count(pool[n].kid[c]); return s; }
static void dump(int n, int depth) {
    for (int c = 0; c < 26; c++) if (pool[n].kid[c]) {
        for (int d = 0; d < depth; d++) printf("  ");
        printf("%s%s\n", pool[n].label[c], pool[pool[n].kid[c]].end ? "*" : "");
        dump(pool[n].kid[c], depth + 1);
    }
}

int main(void) {
    const char *ws[] = {"romane", "romanus", "romulus", "rubens", "ruber", "rubicon", "rubicundus", "rom"};
    for (int i = 0; i < 8; i++) insert(ws[i]);
    dump(0, 0);
    const char *ss[] = {"rom", "romane", "rub", "roman"}, *ps[] = {"r", "rom", "rub", "rubi", "ru", "x"};
    for (int i = 0; i < 4; i++) { int mid, n = walk(ss[i], &mid); printf("search %s: %s\n", ss[i], n >= 0 && !mid && pool[n].end ? "True" : "False"); }
    for (int i = 0; i < 6; i++) { int mid, n = walk(ps[i], &mid); printf("prefix %s: %d\n", ps[i], n >= 0 ? count(n) : 0); }
    return 0;
}
