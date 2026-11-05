#include <stdio.h>

/* 從頭到尾逐一比較，找到回傳索引，找不到回傳 -1 */
int linear_search(const int *a, int n, int t) {
    for (int i = 0; i < n; i++)
        if (a[i] == t) return i;
    return -1;
}

int main(void) {
    int a[] = {29, 4, 71, 15, 42, 8, 63, 37, 90, 22};
    int n = sizeof a / sizeof a[0];
    printf("search 63 -> %d\n", linear_search(a, n, 63));
    printf("search 100 -> %d\n", linear_search(a, n, 100));
    return 0;
}
