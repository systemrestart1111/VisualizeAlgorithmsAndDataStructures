#include <stdio.h>

/* 找出離查詢點最近的 k 筆訓練資料，以多數決決定類別（票數相同時取編號小的類別） */
int main(void) {
    int T[16][3] = {{2, 3, 0}, {3, 5, 0}, {4, 2, 0}, {1, 6, 0}, {5, 4, 0}, {3, 3, 0}, {8, 8, 1}, {9, 6, 1},
                    {7, 9, 1}, {10, 8, 1}, {8, 6, 1}, {6, 7, 1}, {5, 9, 2}, {3, 9, 2}, {4, 10, 2}, {2, 8, 2}};
    int n = 16, qx = 6, qy = 5, K = 5, order[16], d2[16], votes[3] = {0};
    for (int i = 0; i < n; i++) {
        order[i] = i;
        d2[i] = (T[i][0] - qx) * (T[i][0] - qx) + (T[i][1] - qy) * (T[i][1] - qy);
    }
    for (int i = 1; i < n; i++) { /* 依 (距離, 編號) 排序 */
        int k = order[i], j = i - 1;
        while (j >= 0 && d2[order[j]] > d2[k]) { order[j + 1] = order[j]; j--; }
        order[j + 1] = k;
    }
    for (int t = 0; t < K; t++) {
        int i = order[t];
        printf("neighbor (%d,%d) class %d, d^2 = %d\n", T[i][0], T[i][1], T[i][2], d2[i]);
        votes[T[i][2]]++;
    }
    int pred = 0;
    printf("votes:");
    for (int c = 0; c < 3; c++) {
        if (votes[c]) printf(" class %d=%d", c, votes[c]);
        if (votes[c] > votes[pred]) pred = c;
    }
    printf("\npredicted class = %d\n", pred);
    return 0;
}
