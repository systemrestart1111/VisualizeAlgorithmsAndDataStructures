#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int val; struct Node *next; } Node;

Node *new_node(int v, Node *next) {
    Node *n = malloc(sizeof *n);
    n->val = v; n->next = next;
    return n;
}

void print_list(const char *label, Node *h) {
    printf("%s", label);
    for (; h; h = h->next) printf("%d%s", h->val, h->next ? " -> " : "\n");
}

/* 在位置 i 插入：找到第 i-1 個節點，新節點先接上後繼，再讓前驅指向新節點 */
Node *insert_at(Node *head, int i, int v) {
    if (i == 0) return new_node(v, head);
    Node *prev = head;
    for (int k = 0; k < i - 1; k++) prev = prev->next;
    prev->next = new_node(v, prev->next);
    return head;
}

/* 刪除位置 i：讓前驅直接跳過該節點 */
Node *delete_at(Node *head, int i) {
    Node *del;
    if (i == 0) { del = head; head = head->next; }
    else {
        Node *prev = head;
        for (int k = 0; k < i - 1; k++) prev = prev->next;
        del = prev->next;
        prev->next = del->next;
    }
    free(del);
    return head;
}

int main(void) {
    int vals[] = {10, 20, 30, 40, 50};
    Node *head = NULL;
    for (int i = 4; i >= 0; i--) head = new_node(vals[i], head);
    head = insert_at(head, 2, 99);
    print_list("insert 99 at 2: ", head);
    head = delete_at(head, 4);
    print_list("delete at 4:   ", head);
    return 0;
}
