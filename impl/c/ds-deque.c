#include <stdio.h>
#include <stdlib.h>

/* 雙端佇列：用環狀陣列實作，兩端都能 O(1) 加入與移除；滿了就把容量加倍 */
int *buf, cap = 4, head, size;

void grow(void) {
    int *nb = malloc(2 * cap * sizeof(int));
    for (int i = 0; i < size; i++) nb[i] = buf[(head + i) % cap];
    free(buf);
    buf = nb;
    cap *= 2;
    head = 0;
}

void push_front(int v) {
    if (size == cap) grow();
    head = (head - 1 + cap) % cap;
    buf[head] = v;
    size++;
}

void push_back(int v) {
    if (size == cap) grow();
    buf[(head + size) % cap] = v;
    size++;
}

int pop_front(void) {
    int v = buf[head];
    head = (head + 1) % cap;
    size--;
    return v;
}

int pop_back(void) { size--; return buf[(head + size) % cap]; }

void show(void) {
    printf("[");
    for (int i = 0; i < size; i++) printf(i ? " %d" : "%d", buf[(head + i) % cap]);
    printf("] cap=%d\n", cap);
}

int main(void) {
    buf = malloc(cap * sizeof(int));
    push_back(1); push_back(2); push_front(0);
    printf("push_back 1, push_back 2, push_front 0: "); show();
    push_front(-1); push_back(3);
    printf("push_front -1, push_back 3: "); show();
    int a = pop_front(), b = pop_back();
    printf("pop_front -> %d  pop_back -> %d  ", a, b); show();
    free(buf);
    return 0;
}
