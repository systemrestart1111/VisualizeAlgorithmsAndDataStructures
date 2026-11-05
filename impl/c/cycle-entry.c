#include <stdio.h>

typedef struct Node { int val; struct Node *next; } Node;

/* 相遇後把一個指標放回起點，兩者都改成一次一步，再次相遇處就是環的入口 */
Node *cycle_entry(Node *head, int *length) {
    Node *slow = head, *fast = head;
    for (;;) {
        if (!fast || !fast->next) { *length = 0; return NULL; }
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) break;
    }
    Node *p = head;
    while (p != slow) { p = p->next; slow = slow->next; }
    *length = 1;
    for (Node *q = p->next; q != p; q = q->next) (*length)++;
    return p;
}

int main(void) {
    int vals[] = {3, 8, 1, 6, 9, 4, 7, 2, 5}, len;
    Node nodes[9];
    for (int i = 0; i < 9; i++) { nodes[i].val = vals[i]; nodes[i].next = i < 8 ? &nodes[i + 1] : &nodes[3]; }
    Node *e = cycle_entry(nodes, &len);
    printf("entry = %d cycle length = %d\n", e->val, len);
    return 0;
}
