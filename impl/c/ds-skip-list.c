#include <stdio.h>
#include <stdlib.h>

#define MAX_LEVEL 4
/* 多層排序串列：每個節點以 1/2 機率往上多一層，搜尋時從最高層往下跳，期望 O(log n) */
typedef struct SNode { int val, level; struct SNode *next[MAX_LEVEL]; } SNode;
SNode head = {0, MAX_LEVEL, {NULL}};
int level = 1;
long long state = 42; /* Park–Miller 亂數，讓每種語言都得到相同的層數 */

int rand_int(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

int random_level(void) {
    int lvl = 1;
    while (lvl < MAX_LEVEL && rand_int(2) == 0) lvl++;
    return lvl;
}

/* 填入每一層「最後一個 < k 的節點」 */
void find_update(int k, SNode **update) {
    SNode *x = &head;
    for (int i = 0; i < MAX_LEVEL; i++) update[i] = &head;
    for (int i = level - 1; i >= 0; i--) {
        while (x->next[i] && x->next[i]->val < k) x = x->next[i];
        update[i] = x;
    }
}

int insert(int k) {
    SNode *update[MAX_LEVEL];
    find_update(k, update);
    SNode *nxt = update[0]->next[0];
    if (nxt && nxt->val == k) return 0;
    int lvl = random_level();
    if (lvl > level) level = lvl;
    SNode *n = calloc(1, sizeof *n);
    n->val = k; n->level = lvl;
    for (int i = 0; i < lvl; i++) { n->next[i] = update[i]->next[i]; update[i]->next[i] = n; }
    return lvl;
}

void search(int k) {
    SNode *x = &head;
    printf("search %d: ", k);
    char buf[128];
    int len = 0;
    for (int i = level - 1; i >= 0; i--)
        while (x->next[i] && x->next[i]->val < k) { x = x->next[i]; len += sprintf(buf + len, " %d", x->val); }
    buf[len] = 0;
    x = x->next[0];
    printf("%s, visited%s\n", x && x->val == k ? "found" : "not found", buf);
}

int delete_key(int k) {
    SNode *update[MAX_LEVEL];
    find_update(k, update);
    SNode *x = update[0]->next[0];
    if (!x || x->val != k) return 0;
    for (int i = 0; i < x->level; i++) update[i]->next[i] = x->next[i];
    free(x);
    while (level > 1 && !head.next[level - 1]) level--;
    return 1;
}

void show(void) {
    for (int i = level - 1; i >= 0; i--) {
        printf("  L%d:", i);
        for (SNode *x = head.next[i]; x; x = x->next[i]) printf(" %d", x->val);
        printf("\n");
    }
}

int main(void) {
    int keys[] = {30, 10, 50, 20, 70, 40, 60, 80, 25};
    for (int i = 0; i < 9; i++) { int lvl = insert(keys[i]); printf("insert %d (level %d)\n", keys[i], lvl); }
    show();
    search(60);
    search(45);
    printf("delete 40 -> %s\n", delete_key(40) ? "True" : "False");
    show();
    return 0;
}
