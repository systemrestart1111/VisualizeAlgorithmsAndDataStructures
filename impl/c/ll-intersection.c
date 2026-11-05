#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int val; struct Node *next; } Node;

Node *build(const int *v, int n, Node *tail) {
    Node *head = tail;
    for (int i = n - 1; i >= 0; i--) {
        Node *p = malloc(sizeof *p);
        p->val = v[i]; p->next = head; head = p;
    }
    return head;
}

/* 兩指標各走自己的串列，走到尾就跳到另一條的開頭；兩者走過的總長相同，會在交點相遇 */
Node *intersection(Node *a, Node *b) {
    Node *p = a, *q = b;
    while (p != q) {
        p = p ? p->next : b;
        q = q ? q->next : a;
    }
    return p;
}

int main(void) {
    int c[] = {8, 10, 12}, x[] = {4, 1, 7}, y[] = {5, 6, 2, 9, 3};
    Node *common = build(c, 3, NULL);
    Node *node = intersection(build(x, 3, common), build(y, 5, common));
    if (node) printf("intersection at %d\n", node->val);
    else printf("intersection at None\n");
    return 0;
}
