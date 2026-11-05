#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* 每條從根出發的路徑代表一個前綴；end 標記「到這裡是一個完整單字」 */
typedef struct TrieNode { struct TrieNode *kids[26]; int end; } TrieNode;
TrieNode *root;
int nodes = 1;

TrieNode *new_node(void) { return calloc(1, sizeof(TrieNode)); }

void insert(const char *w) {
    TrieNode *cur = root;
    for (; *w; w++) {
        int c = *w - 'a';
        if (!cur->kids[c]) { cur->kids[c] = new_node(); nodes++; }
        cur = cur->kids[c];
    }
    cur->end = 1;
}

TrieNode *find(const char *p) {
    TrieNode *cur = root;
    for (; *p && cur; p++) cur = cur->kids[*p - 'a'];
    return cur;
}

int search(const char *w) { TrieNode *n = find(w); return n && n->end; }

int has_kids(TrieNode *n) {
    for (int i = 0; i < 26; i++) if (n->kids[i]) return 1;
    return 0;
}

/* 依字母序走訪，印出完整單字；回傳印出的個數 */
int dfs(TrieNode *n, char *buf, int len, int count) {
    if (n->end) { buf[len] = 0; printf(" %s", buf); count++; }
    for (int i = 0; i < 26; i++)
        if (n->kids[i]) { buf[len] = 'a' + i; count = dfs(n->kids[i], buf, len + 1, count); }
    return count;
}

void starts_with(const char *p) {
    char buf[64];
    strcpy(buf, p);
    TrieNode *n = find(p);
    if (!n || dfs(n, buf, strlen(p), 0) == 0) printf(" -");
}

int delete_word(const char *w) {
    if (!search(w)) return 0;
    int len = strlen(w);
    TrieNode *path[64];
    path[0] = root;
    for (int i = 0; i < len; i++) path[i + 1] = path[i]->kids[w[i] - 'a'];
    path[len]->end = 0;
    for (int i = len; i > 0; i--) { /* 從尾端往回剪掉不再需要的節點 */
        if (path[i]->end || has_kids(path[i])) break;
        free(path[i]);
        path[i - 1]->kids[w[i - 1] - 'a'] = NULL;
        nodes--;
    }
    return 1;
}

const char *b(int x) { return x ? "True" : "False"; }

int main(void) {
    root = new_node();
    const char *words[] = {"tea", "ten", "to", "inn", "in", "tree", "try"};
    for (int i = 0; i < 7; i++) insert(words[i]);
    printf("words:"); starts_with(""); printf(" (nodes = %d)\n", nodes);
    printf("search tea -> %s  search te -> %s (prefix only)\n", b(search("tea")), b(search("te")));
    const char *prefixes[] = {"te", "tr", "x"};
    for (int i = 0; i < 3; i++) { printf("prefix \"%s\":", prefixes[i]); starts_with(prefixes[i]); printf("\n"); }
    const char *dels[] = {"in", "tree", "tea"};
    for (int i = 0; i < 3; i++) {
        int ok = delete_word(dels[i]);
        printf("delete %s -> %s:", dels[i], b(ok)); starts_with(""); printf(" (nodes = %d)\n", nodes);
    }
    return 0;
}
