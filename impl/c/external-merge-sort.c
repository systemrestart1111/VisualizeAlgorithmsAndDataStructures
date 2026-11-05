#include <stdio.h>
#include <stdlib.h>

static int cmp(const void *x, const void *y) { return *(const int *)x - *(const int *)y; }

/* 記憶體只能放 m 筆：先切成長度 m 的有序 run，再做 k 路合併（每次取各 run 開頭的最小值） */
int main(void) {
    int data[] = {41, 7, 63, 22, 88, 15, 34, 70, 2, 56, 29, 93, 11, 47, 80, 38, 5, 66};
    int n = sizeof data / sizeof data[0], m = 4;
    int runs = (n + m - 1) / m, pos[16], end[16];
    for (int r = 0; r < runs; r++) {
        pos[r] = r * m;
        end[r] = pos[r] + m < n ? pos[r] + m : n;
        qsort(data + pos[r], end[r] - pos[r], sizeof(int), cmp);
        printf("run %d:", r);
        for (int i = pos[r]; i < end[r]; i++) printf(" %d", data[i]);
        printf("\n");
    }
    printf("merged:");
    for (;;) {
        int best = -1;
        for (int r = 0; r < runs; r++)
            if (pos[r] < end[r] && (best < 0 || data[pos[r]] < data[pos[best]])) best = r;
        if (best < 0) break;
        printf(" %d", data[pos[best]++]);
    }
    printf("\n");
    return 0;
}
