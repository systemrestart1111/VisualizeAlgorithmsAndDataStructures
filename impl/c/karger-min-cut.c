#include <stdio.h>

#define N 8
#define M 13
static const char *E[M] = {"AB", "AC", "AD", "BC", "BD", "CD", "DE", "EF", "EG", "FG", "FH", "GH", "EH"};
static long long seed = 42;
static int rnd(int n) { seed = seed * 48271 % 2147483647; return (int)(seed % n); }
static int p[N];
static int find(int x) { while (p[x] != x) x = p[x]; return x; }

/* 隨機縮邊直到剩兩個超節點；兩者之間的邊數就是一個割 */
static int trial(void) {
    int groups = N, live[M], cut = 0;
    for (int i = 0; i < N; i++) p[i] = i;
    while (groups > 2) {
        int nl = 0;
        for (int i = 0; i < M; i++) if (find(E[i][0] - 'A') != find(E[i][1] - 'A')) live[nl++] = i;
        int i = live[rnd(nl)];
        p[find(E[i][0] - 'A')] = find(E[i][1] - 'A');
        groups--;
    }
    for (int i = 0; i < M; i++) if (find(E[i][0] - 'A') != find(E[i][1] - 'A')) cut++;
    return cut;
}

int main(void) {
    int best = M, brute = M;
    printf("cuts per trial:");
    for (int t = 0; t < 6; t++) { int c = trial(); printf(" %d", c); if (c < best) best = c; }
    for (int m = 1; m < (1 << (N - 1)); m++) {
        int c = 0;
        for (int i = 0; i < M; i++) if (((m >> (E[i][0] - 'A')) & 1) != ((m >> (E[i][1] - 'A')) & 1)) c++;
        if (c < brute) brute = c;
    }
    printf("\nbest: %d | brute force: %d\n", best, brute);
    return 0;
}
