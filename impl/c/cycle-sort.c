#include <stdio.h>

static int count_less(int *a, int n, int start, int item) {
    int pos = start;
    for (int i = start + 1; i < n; i++) if (a[i] < item) pos++;
    return pos;
}

/* 每個元素直接寫到最終位置；跳過重複值避免無窮迴圈。回傳寫入次數 */
int cycle_sort(int *a, int n) {
    int writes = 0;
    for (int start = 0; start < n - 1; start++) {
        int item = a[start], pos = count_less(a, n, start, item), t;
        if (pos == start) continue;
        while (item == a[pos]) pos++;
        t = a[pos]; a[pos] = item; item = t; writes++;
        while (pos != start) {
            pos = count_less(a, n, start, item);
            while (pos != start && item == a[pos]) pos++;
            if (pos == start) { a[start] = item; writes++; break; }
            t = a[pos]; a[pos] = item; item = t; writes++;
        }
    }
    return writes;
}

void show(int *a, int n) { for (int i = 0; i < n; i++) printf(" %d", a[i]); }

int main(void) {
    int a[] = {20, 40, 50, 10, 30, 40, 20, 60, 10}, b[] = {3, 3, 3, 1};
    int w = cycle_sort(a, 9);
    printf("sorted:"); show(a, 9); printf("\nwrites: %d\n", w);
    printf("dups:"); show(b, 4); printf(" ->");
    cycle_sort(b, 4);
    show(b, 4); printf("\n");
    return 0;
}
