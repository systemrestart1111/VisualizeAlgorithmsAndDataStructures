#include <stdio.h>

#define N 12
#define K 3

/* Lloyd 演算法：重複「每點分給最近的中心」與「中心移到所屬點的平均位置」，直到分群不再改變
   （這裡用前 k 個點當初始中心，方便重現。這組資料的前 3 點都在同一群，結果會卡在局部最佳解（左下群被拆成兩半），可看出初始化的影響；實務上常用 k-means++ 改善） */
int main(void) {
    double P[N][2] = {{1, 2}, {2, 1}, {2, 3}, {3, 2}, {7, 8}, {8, 7}, {8, 9}, {9, 8}, {1, 8}, {2, 7}, {2, 9}, {3, 8}}, cent[K][2];
    int assign[N], nw[N];
    for (int c = 0; c < K; c++) { cent[c][0] = P[c][0]; cent[c][1] = P[c][1]; }
    for (int i = 0; i < N; i++) assign[i] = -1;
    for (int it = 1; it <= 20; it++) {
        int changed = 0;
        for (int i = 0; i < N; i++) {
            int best = 0;
            double bd = 1e18;
            for (int c = 0; c < K; c++) {
                double dx = P[i][0] - cent[c][0], dy = P[i][1] - cent[c][1], d = dx * dx + dy * dy;
                if (d < bd - 1e-9) { best = c; bd = d; } /* 容許誤差：距離相同時固定選編號小的中心 */
            }
            nw[i] = best;
            if (nw[i] != assign[i]) changed = 1;
        }
        if (!changed) break;
        for (int i = 0; i < N; i++) assign[i] = nw[i];
        for (int c = 0; c < K; c++) {
            double sx = 0, sy = 0;
            int m = 0;
            for (int i = 0; i < N; i++) if (assign[i] == c) { sx += P[i][0]; sy += P[i][1]; m++; }
            if (m) { cent[c][0] = sx / m; cent[c][1] = sy / m; }
        }
        printf("iteration %d:", it);
        for (int c = 0; c < K; c++) printf(" (%.4f, %.4f)", cent[c][0], cent[c][1]);
        printf("\n");
    }
    printf("labels:");
    for (int i = 0; i < N; i++) printf(" %d", assign[i]);
    printf("\n");
    return 0;
}
