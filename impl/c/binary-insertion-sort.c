#include <stdio.h>

typedef struct { int k; char tag; } Item;

/* 二分找第一個 > key 的位置（upper bound），相等鍵保持原順序 */
void binary_insertion_sort(Item *a, int n, int *comps, int *moves) {
    *comps = *moves = 0;
    for (int i = 1; i < n; i++) {
        Item x = a[i];
        int lo = 0, hi = i;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            (*comps)++;
            if (a[mid].k <= x.k) lo = mid + 1; else hi = mid;
        }
        for (int j = i; j > lo; j--) { a[j] = a[j - 1]; (*moves)++; }
        a[lo] = x;
    }
}

int main(void) {
    int v[] = {5, 2, 8, 2, 9, 1, 5, 6, 3, 5}, c, m;
    Item a[10];
    for (int i = 0; i < 10; i++) { a[i].k = v[i]; a[i].tag = 0; }
    binary_insertion_sort(a, 10, &c, &m);
    printf("sorted:");
    for (int i = 0; i < 10; i++) printf(" %d", a[i].k);
    printf("\ncomparisons: %d moves: %d\n", c, m);
    Item p[5] = {{3, 'a'}, {1, 'b'}, {3, 'c'}, {2, 'd'}, {1, 'e'}};
    binary_insertion_sort(p, 5, &c, &m);
    printf("stable:");
    for (int i = 0; i < 5; i++) printf(" %d%c", p[i].k, p[i].tag);
    printf("\n");
    return 0;
}
