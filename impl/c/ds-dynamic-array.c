#include <stdio.h>
#include <stdlib.h>

/* 容量滿時加倍、只剩 1/4 時減半；搬移成本攤銷後，每次 append / pop 平均 O(1) */
typedef struct { int *data, size, cap; } DynArray;

void resize(DynArray *a, int cap) {
    a->data = realloc(a->data, cap * sizeof(int)); /* realloc 會把舊資料搬到新空間 */
    a->cap = cap;
}

void append(DynArray *a, int v) {
    if (a->size == a->cap) resize(a, a->cap * 2);
    a->data[a->size++] = v;
}

int pop(DynArray *a) {
    int v = a->data[--a->size];
    if (a->cap > 1 && a->size <= a->cap / 4) resize(a, a->cap / 2);
    return v;
}

void show(DynArray *a) {
    printf("[");
    for (int i = 0; i < a->size; i++) printf(i ? " %d" : "%d", a->data[i]);
    printf("] size=%d cap=%d\n", a->size, a->cap);
}

int main(void) {
    DynArray a = {malloc(sizeof(int)), 0, 1};
    int vals[] = {10, 20, 30, 40, 50};
    for (int i = 0; i < 5; i++) { append(&a, vals[i]); printf("append %d: ", vals[i]); show(&a); }
    for (int i = 0; i < 4; i++) { int v = pop(&a); printf("pop -> %d: ", v); show(&a); }
    free(a.data);
    return 0;
}
