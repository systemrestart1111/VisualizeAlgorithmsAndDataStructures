#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int val; struct Node *next; } Node;

/* 三個指標 prev / cur / nxt：逐一把 cur->next 改指向前一個節點 */
Node *reverse(Node *head) {
    Node *prev = NULL, *cur = head;
    while (cur) {
        Node *nxt = cur->next;
        cur->next = prev;
        prev = cur;
        cur = nxt;
    }
    return prev;
}

int main(void) {
    Node *head = NULL;
    for (int v = 6; v >= 1; v--) {
        Node *n = malloc(sizeof *n);
        n->val = v; n->next = head; head = n;
    }
    head = reverse(head);
    for (Node *p = head; p; p = p->next) printf("%d%s", p->val, p->next ? " -> " : "\n");
    return 0;
}
