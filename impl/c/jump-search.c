#include <math.h>
#include <stdio.h>

/* a 已排序；每次跳 √n 格找到區塊，再在區塊內線性搜尋 */
int jump_search(const int *a, int n, int t) {
    int step = (int)sqrt((double)n);
    int prev = 0, cur = step;
    while (cur < n && a[cur - 1] < t) {
        prev = cur;
        cur += step;
    }
    for (int i = prev; i < cur && i < n; i++)
        if (a[i] == t) return i;
    return -1;
}

int main(void) {
    int a[] = {1, 4, 7, 10, 14, 18, 21, 25, 29, 33, 38, 42, 47, 51, 56, 60};
    int n = sizeof a / sizeof a[0];
    printf("search 47 -> %d\n", jump_search(a, n, 47));
    printf("search 30 -> %d\n", jump_search(a, n, 30));
    return 0;
}
