#include <stdio.h>
#include <stdlib.h>

/* 每個節點只記得下一個；頭部插入刪除 O(1)，找特定位置要從頭走 O(n) */
typedef struct Node { int val; struct Node *next; } Node;
typedef struct { Node *head; int size; } List;

Node *new_node(int v, Node *next) { Node *n = malloc(sizeof *n); n->val = v; n->next = next; return n; }

void push_front(List *l, int v) { l->head = new_node(v, l->head); l->size++; }

void push_back(List *l, int v) {
    if (!l->head) { push_front(l, v); return; }
    Node *cur = l->head;
    while (cur->next) cur = cur->next;
    cur->next = new_node(v, NULL);
    l->size++;
}

/* 刪除第一個值為 v 的節點：讓前一個節點跳過它 */
int remove_val(List *l, int v) {
    Node *prev = NULL, *cur = l->head;
    while (cur && cur->val != v) { prev = cur; cur = cur->next; }
    if (!cur) return 0;
    if (prev) prev->next = cur->next;
    else l->head = cur->next;
    free(cur);
    l->size--;
    return 1;
}

int find(List *l, int v) {
    int i = 0;
    for (Node *cur = l->head; cur; cur = cur->next, i++) if (cur->val == v) return i;
    return -1;
}

void show(const char *label, List *l) {
    printf("%s", label);
    for (Node *cur = l->head; cur; cur = cur->next) printf("%d -> ", cur->val);
    printf("null\n");
}

int main(void) {
    List l = {NULL, 0};
    int init[] = {3, 7, 1};
    for (int i = 0; i < 3; i++) push_back(&l, init[i]);
    show("init:         ", &l);
    push_front(&l, 9); show("push_front 9: ", &l);
    push_back(&l, 4); show("push_back 4:  ", &l);
    int ok = remove_val(&l, 7);
    printf("remove 7:     %s ", ok ? "True" : "False"); show("", &l);
    printf("find 1 -> %d  find 8 -> %d  size = %d\n", find(&l, 1), find(&l, 8), l.size);
    return 0;
}
