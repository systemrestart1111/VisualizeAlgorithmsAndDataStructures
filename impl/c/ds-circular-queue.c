#include <stdio.h>

/* 固定大小的環狀緩衝區：head、tail 走到陣列尾端就繞回 0，空間可重複使用 */
#define CAP 5
int buf[CAP], used[CAP], head, size;

int enqueue(int v) {
    if (size == CAP) return 0; /* 已滿 */
    int i = (head + size) % CAP;
    buf[i] = v; used[i] = 1;
    size++;
    return 1;
}

int dequeue(void) {
    int v = buf[head];
    used[head] = 0;
    head = (head + 1) % CAP;
    size--;
    return v;
}

void show(void) {
    printf("buffer [");
    for (int i = 0; i < CAP; i++) { if (i) printf(" "); if (used[i]) printf("%d", buf[i]); else printf("."); }
    printf("] head=%d size=%d\n", head, size);
}

int main(void) {
    for (int v = 1; v <= 4; v++) enqueue(v);
    printf("enqueue 1..4:  "); show();
    int a = dequeue(), b = dequeue();
    printf("dequeue -> %d %d  ", a, b); show();
    for (int v = 5; v <= 7; v++) { int ok = enqueue(v); printf("enqueue %d: %s ", v, ok ? "ok  " : "full"); show(); }
    a = dequeue(); printf("dequeue -> %d  ", a); show();
    return 0;
}
