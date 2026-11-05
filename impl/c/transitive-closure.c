#include <stdio.h>

#define N 6

/* Warshall：依序讓每個頂點 k 當中繼站，R[i][j] |= R[i][k] && R[k][j] */
static void closure(int R[N][N], int reflexive) {
    const char *E[6] = {"AB", "BC", "CA", "CD", "ED", "EF"};
    for (int i = 0; i < N; i++) for (int j = 0; j < N; j++) R[i][j] = reflexive && i == j;
    for (int e = 0; e < 6; e++) R[E[e][0] - 'A'][E[e][1] - 'A'] = 1;
    for (int k = 0; k < N; k++)
        for (int i = 0; i < N; i++)
            for (int j = 0; j < N; j++) R[i][j] = R[i][j] || (R[i][k] && R[k][j]);
}

int main(void) {
    int R[N][N];
    for (int refl = 0; refl <= 1; refl++) {
        closure(R, refl);
        printf("%s\n  A B C D E F\n", refl ? "reflexive" : "non-reflexive");
        for (int i = 0; i < N; i++) {
            printf("%c", 'A' + i);
            for (int j = 0; j < N; j++) printf(" %d", R[i][j]);
            printf("\n");
        }
    }
    return 0;
}
