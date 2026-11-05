#include <stdio.h>

/* 後進先出（LIFO）：只在頂端 push / pop，都是 O(1) */
#define CAP 16
int items[CAP], top;

void push(int v) { items[top++] = v; }
int pop(void) { return items[--top]; }
int peek(void) { return items[top - 1]; }

void show(void) {
    printf("bottom [");
    for (int i = 0; i < top; i++) printf(i ? " %d" : "%d", items[i]);
    printf("] top\n");
}

int main(void) {
    int vals[] = {4, 8, 15};
    for (int i = 0; i < 3; i++) { push(vals[i]); printf("push %2d: ", vals[i]); show(); }
    printf("peek -> %d\n", peek());
    for (int i = 0; i < 2; i++) { int v = pop(); printf("pop -> %d: ", v); show(); }
    push(16); printf("push 16: "); show();
    return 0;
}
