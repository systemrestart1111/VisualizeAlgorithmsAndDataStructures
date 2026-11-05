#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int val; struct Node *next; } Node;

Node *build_with_cycle(const int *vals, int n, int pos) {
    Node *nodes = calloc(n, sizeof(Node));
    for (int i = 0; i < n; i++) {
        nodes[i].val = vals[i];
        nodes[i].next = i + 1 < n ? &nodes[i + 1] : NULL;
    }
    if (pos >= 0) nodes[n - 1].next = &nodes[pos]; /* 尾端接回第 pos 個節點形成環 */
    return nodes;
}

/* 龜兔賽跑：兔子一次兩步、烏龜一次一步；有環時兩者必定相遇 */
void has_cycle(const char *label, Node *head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) { printf("%s (True, %d)\n", label, slow->val); return; }
    }
    printf("%s (False, None)\n", label);
}

int main(void) {
    int vals[] = {3, 8, 1, 6, 9, 4, 7, 2, 5};
    has_cycle("pos 3:", build_with_cycle(vals, 9, 3));
    has_cycle("pos -1:", build_with_cycle(vals, 9, -1));
    return 0;
}
