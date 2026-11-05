#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int val; struct Node *next; } Node;

/* 快慢指標：fast 一次走兩步、slow 一次走一步，fast 到尾時 slow 在中點 */
Node *middle(Node *head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}

int main(void) {
    int vals[] = {3, 7, 1, 9, 4, 8, 2};
    Node *head = NULL;
    for (int i = 6; i >= 0; i--) {
        Node *n = malloc(sizeof *n);
        n->val = vals[i]; n->next = head; head = n;
    }
    printf("middle = %d\n", middle(head)->val);
    return 0;
}
