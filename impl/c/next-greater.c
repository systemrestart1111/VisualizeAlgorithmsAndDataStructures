#include <stdio.h>

/* 單調遞減堆疊：新元素比堆疊頂端大時，頂端的「下一個較大元素」就是它 */
int main(void) {
    int a[] = {4, 5, 2, 10, 8, 3, 7, 1, 9, 6}, res[10], stack[10], top = 0;
    int n = sizeof a / sizeof a[0];
    for (int i = 0; i < n; i++) {
        res[i] = -1;
        while (top && a[stack[top - 1]] < a[i]) res[stack[--top]] = a[i];
        stack[top++] = i;
    }
    for (int i = 0; i < n; i++) printf("%d%c", res[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
