#include <stdio.h>
#include <stdlib.h>

/* 先進先出（FIFO）：用鏈結串列，從尾端 enqueue、從頭端 dequeue，都是 O(1) */
typedef struct Node { char val; struct Node *next; } Node;
Node *head, *tail;

void enqueue(char v) {
    Node *n = malloc(sizeof *n);
    n->val = v; n->next = NULL;
    if (tail) tail->next = n; else head = n;
    tail = n;
}

char dequeue(void) {
    Node *n = head;
    char v = n->val;
    head = n->next;
    if (!head) tail = NULL;
    free(n);
    return v;
}

void show(void) {
    printf("front [");
    for (Node *c = head; c; c = c->next) printf(c == head ? "%c" : " %c", c->val);
    printf("] rear\n");
}

int main(void) {
    for (char v = 'A'; v <= 'C'; v++) { enqueue(v); printf("enqueue %c: ", v); show(); }
    char v = dequeue(); printf("dequeue -> %c: ", v); show();
    enqueue('D'); printf("enqueue D: "); show();
    v = dequeue(); printf("dequeue -> %c: ", v); show();
    return 0;
}
