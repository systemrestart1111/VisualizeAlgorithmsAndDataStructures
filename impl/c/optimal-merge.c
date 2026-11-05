#include <stdio.h>

/* 每次合併最短的兩個檔案（與霍夫曼編碼同樣的貪婪策略），總搬移成本最小 */
int pop_min(int *a, int *n) {
    int m = 0;
    for (int i = 1; i < *n; i++) if (a[i] < a[m]) m = i;
    int v = a[m];
    a[m] = a[--*n];
    return v;
}

int main(void) {
    int files[] = {20, 30, 10, 5, 30, 15}, n = 6, total = 0;
    while (n > 1) {
        int a = pop_min(files, &n), b = pop_min(files, &n);
        total += a + b;
        files[n++] = a + b;
        printf("merge %d + %d = %d\n", a, b, a + b);
    }
    printf("total cost = %d\n", total);
    return 0;
}
