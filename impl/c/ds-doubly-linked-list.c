#include <stdio.h>
#include <stdlib.h>

/* 每個節點同時記得前後；有 head 與 tail，兩端插入刪除都是 O(1)，也能反向走訪 */
typedef struct Node { int val; struct Node *prev, *next; } Node;
Node *head, *tail;

Node *new_node(int v) { Node *n = calloc(1, sizeof *n); n->val = v; return n; }

void push_front(int v) {
    Node *n = new_node(v);
    n->next = head;
    if (head) head->prev = n; else tail = n;
    head = n;
}

void push_back(int v) {
    Node *n = new_node(v);
    n->prev = tail;
    if (tail) tail->next = n; else head = n;
    tail = n;
}

/* 把節點 n 從前後鄰居之間拿掉 */
int unlink_node(Node *n) {
    if (n->prev) n->prev->next = n->next; else head = n->next;
    if (n->next) n->next->prev = n->prev; else tail = n->prev;
    int v = n->val;
    free(n);
    return v;
}

int remove_val(int v) {
    Node *cur = head;
    while (cur && cur->val != v) cur = cur->next;
    if (!cur) return 0;
    unlink_node(cur);
    return 1;
}

void show(void) {
    if (!head) printf("(empty)");
    for (Node *c = head; c; c = c->next) printf(c->next ? "%d <-> " : "%d", c->val);
    printf("   | backward:");
    for (Node *c = tail; c; c = c->prev) printf(" %d", c->val);
    printf("\n");
}

int main(void) {
    int init[] = {10, 20, 30};
    for (int i = 0; i < 3; i++) push_back(init[i]);
    printf("init:          "); show();
    push_front(5); printf("push_front 5:  "); show();
    push_back(40); printf("push_back 40:  "); show();
    int v = unlink_node(head); printf("pop_front -> %d ", v); show();
    v = unlink_node(tail); printf("pop_back  -> %d ", v); show();
    int ok = remove_val(20); printf("remove 20:     %s ", ok ? "True" : "False"); show();
    return 0;
}
