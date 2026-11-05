#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int val; struct Node *next; } Node;

Node *build(const int *v, int n) {
    Node *head = NULL;
    for (int i = n - 1; i >= 0; i--) {
        Node *p = malloc(sizeof *p);
        p->val = v[i]; p->next = head; head = p;
    }
    return head;
}

/* 用虛擬頭節點 dummy；每次把較小的節點接到尾端 */
Node *merge(Node *a, Node *b) {
    Node dummy = {0, NULL}, *tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) { tail->next = a; a = a->next; }
        else { tail->next = b; b = b->next; }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}

int main(void) {
    int x[] = {1, 4, 7, 10, 15}, y[] = {2, 3, 8, 12, 20, 25};
    Node *h = merge(build(x, 5), build(y, 6));
    for (; h; h = h->next) printf("%d%s", h->val, h->next ? " -> " : "\n");
    return 0;
}
