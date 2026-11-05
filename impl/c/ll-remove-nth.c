#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int val; struct Node *next; } Node;

/* fast 先走 k 步，之後 fast、slow 一起走；fast 到尾時 slow->next 就是倒數第 k 個 */
Node *remove_kth_from_end(Node *head, int k, int *removed) {
    Node dummy = {0, head}, *fast = &dummy, *slow = &dummy;
    for (int i = 0; i < k; i++) fast = fast->next;
    while (fast->next) { fast = fast->next; slow = slow->next; }
    Node *del = slow->next;
    *removed = del->val;
    slow->next = del->next;
    free(del);
    return dummy.next;
}

int main(void) {
    Node *head = NULL;
    for (int v = 70; v >= 10; v -= 10) {
        Node *n = malloc(sizeof *n);
        n->val = v; n->next = head; head = n;
    }
    int removed;
    head = remove_kth_from_end(head, 3, &removed);
    printf("removed %d : ", removed);
    for (Node *p = head; p; p = p->next) printf("%d%s", p->val, p->next ? " -> " : "\n");
    return 0;
}
