#include <stdio.h>

/* 雜湊表（鍵 0..99 直接索引）+ 雙向鏈結串列：頭端最近使用，尾端最久未用 */
#define MAXN 128
typedef struct { int k, v, prev, next; } Node;
static Node nodes[MAXN];
static int map[100], head, tail, cnt, cap, nn;

static void init(int c) {
    cap = c; cnt = 0; nn = 2;
    head = 0; tail = 1;
    nodes[head].next = tail; nodes[tail].prev = head;
    for (int i = 0; i < 100; i++) map[i] = -1;
}
static void unlink_n(int n) { nodes[nodes[n].prev].next = nodes[n].next; nodes[nodes[n].next].prev = nodes[n].prev; }
static void push_front(int n) { nodes[n].prev = head; nodes[n].next = nodes[head].next; nodes[nodes[head].next].prev = n; nodes[head].next = n; }
static int get(int k) {
    int n = map[k];
    if (n < 0) return -1;
    unlink_n(n); push_front(n);
    return nodes[n].v;
}
static void put(int k, int v) {
    if (cap == 0) return;
    int n = map[k];
    if (n >= 0) { nodes[n].v = v; unlink_n(n); push_front(n); return; }
    if (cnt == cap) { int old = nodes[tail].prev; unlink_n(old); map[nodes[old].k] = -1; cnt--; }
    n = nn++;
    nodes[n].k = k; nodes[n].v = v;
    map[k] = n; cnt++;
    push_front(n);
}

int main(void) {
    init(2);
    put(1, 1); put(2, 2);
    printf("get 1 -> %d\n", get(1));
    put(3, 3);
    printf("get 2 -> %d\n", get(2));
    put(4, 4);
    int a = get(1), b = get(3), c = get(4);
    printf("get 1 -> %d | get 3 -> %d | get 4 -> %d\n", a, b, c);
    put(3, 33);
    printf("order:");
    for (int n = nodes[head].next; n != tail; n = nodes[n].next) printf(" %d:%d", nodes[n].k, nodes[n].v);
    printf("\n");
    init(0);
    put(1, 1);
    printf("cap 0 get 1 -> %d\n", get(1));
    return 0;
}
