#include <stdio.h>

/* 差分陣列：區間 [l, r] 加 v 只需 d[l] += v、d[r+1] -= v，最後做一次前綴和還原 */
int main(void) {
    int a[10], d[11] = {0}, n = 10;
    int ops[][3] = {{1, 4, 3}, {3, 7, 2}, {0, 2, -1}, {6, 9, 5}};
    for (int i = 0; i < n; i++) a[i] = 5;
    for (int k = 0; k < 4; k++) {
        d[ops[k][0]] += ops[k][2];
        d[ops[k][1] + 1] -= ops[k][2];
    }
    for (int i = 0, run = 0; i < n; i++) {
        run += d[i];
        a[i] += run;
        printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    }
    return 0;
}
