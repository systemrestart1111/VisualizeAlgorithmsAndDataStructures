#include <stdio.h>

/* 固定容量的陣列：隨機存取 O(1)；在中間插入或刪除需要搬移後面的元素 O(n) */
#define CAP 8
int data[CAP], size;

int insert(int i, int v) {
    if (size == CAP) return 0; /* 已滿 */
    for (int k = size; k > i; k--) data[k] = data[k - 1]; /* i 之後的元素整段右移 */
    data[i] = v;
    size++;
    return 1;
}

int delete_at(int i) {
    int v = data[i];
    for (int k = i; k < size - 1; k++) data[k] = data[k + 1]; /* i 之後的元素整段左移 */
    size--;
    return v;
}

int search(int v) {
    for (int i = 0; i < size; i++) if (data[i] == v) return i;
    return -1;
}

void show(const char *label) {
    printf("%s[", label);
    for (int i = 0; i < size; i++) printf(i ? " %d" : "%d", data[i]);
    printf("] size=%d/%d\n", size, CAP);
}

int main(void) {
    int init[] = {5, 3, 8, 1};
    for (int i = 0; i < 4; i++) insert(i, init[i]);
    show("init:       ");
    insert(2, 42); show("insert(2,42): ");
    data[0] = 7; show("set a[0]=7:   ");
    int v = delete_at(1);
    printf("delete(1) -> %d ", v); show("");
    printf("search(8) -> %d\n", search(8));
    return 0;
}
