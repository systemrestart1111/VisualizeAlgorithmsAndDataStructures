#include <stdio.h>

/* 像侏儒整理花盆：順序正確就前進，否則交換並後退一步 */
void gnome_sort(int *a, int n) {
    int i = 0;
    while (i < n) {
        if (i == 0 || a[i - 1] <= a[i]) i++;
        else {
            int t = a[i]; a[i] = a[i - 1]; a[i - 1] = t;
            i--;
        }
    }
}

int main(void) {
    int a[] = {38, 27, 43, 3, 9, 82, 10, 55, 19, 64, 31, 72};
    int n = sizeof a / sizeof a[0];
    gnome_sort(a, n);
    for (int i = 0; i < n; i++) printf("%d%c", a[i], i + 1 < n ? ' ' : '\n');
    return 0;
}
