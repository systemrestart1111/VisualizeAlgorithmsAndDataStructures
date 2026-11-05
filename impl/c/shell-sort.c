#include <stdio.h>

/* 間隔 gap 從 n/2 逐次減半，對每個間隔做插入排序；最後 gap = 1 時就是一般的插入排序 */
void shell_sort(int *a, int n) {
    for (int gap = n / 2; gap > 0; gap /= 2)
        for (int i = gap; i < n; i++) {
            int key = a[i], j = i;
            while (j >= gap && a[j - gap] > key) {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = key;
        }
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    int n = sizeof a / sizeof a[0];
    shell_sort(a, n);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
