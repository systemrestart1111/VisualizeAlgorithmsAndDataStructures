#include <stdio.h>

#define INF 1000000000
#define N 5

int main(void) {
    int E[][3] = {{0, 1, 3}, {0, 2, 8}, {0, 4, -4}, {1, 3, 1}, {1, 4, 7}, {2, 1, 4}, {3, 0, 2}, {3, 2, -5}, {4, 3, 6}};
    int d[N][N];
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++) d[i][j] = i == j ? 0 : INF;
    for (int i = 0; i < 9; i++) d[E[i][0]][E[i][1]] = E[i][2];
    /* 依序允許經過中繼點 k：d[i][j] = min(d[i][j], d[i][k] + d[k][j]) */
    for (int k = 0; k < N; k++)
        for (int i = 0; i < N; i++)
            for (int j = 0; j < N; j++)
                if (d[i][k] < INF && d[k][j] < INF && d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
    printf("   ");
    for (int j = 0; j < N; j++) printf("%4c", 'A' + j);
    printf("\n");
    for (int i = 0; i < N; i++) {
        printf("%3c", 'A' + i);
        for (int j = 0; j < N; j++) {
            if (d[i][j] >= INF) printf("%4s", "inf");
            else printf("%4d", d[i][j]);
        }
        printf("\n");
    }
    return 0;
}
