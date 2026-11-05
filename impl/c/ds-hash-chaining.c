#include <stdio.h>
#include <stdlib.h>

/* 每個桶是一條串列，碰撞的鍵就接在同一條上；負載因子（鍵數 / 桶數）超過 1 時桶數擴為 2m+1 並重新雜湊 */
typedef struct Node { int key; struct Node *next; } Node;
Node **buckets;
int m = 5, count;

void insert(int k);

void rehash(void) {
    Node **old = buckets;
    int om = m;
    m = 2 * m + 1;
    buckets = calloc(m, sizeof(Node *));
    count = 0;
    printf("  -> rehash to m = %d\n", m);
    for (int i = 0; i < om; i++)
        for (Node *n = old[i]; n;) { Node *nx = n->next; insert(n->key); free(n); n = nx; }
    free(old);
}

void insert(int k) {
    Node **p = &buckets[k % m];
    while (*p) { if ((*p)->key == k) return; p = &(*p)->next; } /* 接在串列尾端 */
    *p = calloc(1, sizeof(Node));
    (*p)->key = k;
    if (++count > m) rehash();
}

int search(int k) {
    for (Node *n = buckets[k % m]; n; n = n->next) if (n->key == k) return 1;
    return 0;
}

int delete_key(int k) {
    for (Node **p = &buckets[k % m]; *p; p = &(*p)->next)
        if ((*p)->key == k) { Node *d = *p; *p = d->next; free(d); count--; return 1; }
    return 0;
}

void show(void) {
    for (int i = 0; i < m; i++) {
        printf("  [%2d] ", i);
        if (!buckets[i]) printf("-");
        for (Node *n = buckets[i]; n; n = n->next) printf(n->next ? "%d -> " : "%d", n->key);
        printf("\n");
    }
}

int main(void) {
    buckets = calloc(m, sizeof(Node *));
    int keys[] = {15, 11, 27, 8, 12, 20};
    for (int i = 0; i < 6; i++) { printf("insert %d\n", keys[i]); insert(keys[i]); }
    show();
    printf("search 27 -> %s  search 9 -> %s\n", search(27) ? "True" : "False", search(9) ? "True" : "False");
    printf("delete 12 -> %s\n", delete_key(12) ? "True" : "False");
    show();
    return 0;
}
