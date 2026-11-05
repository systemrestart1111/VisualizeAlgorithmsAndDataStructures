#include <stdio.h>

#define N 12
#define K 4
static long long S[N + 1], prevd[N + 1], cur[N + 1];
static int evals;
static long long cost(int i, int j) { return (S[j] - S[i]) * (S[j] - S[i]); }

/* 最佳切點單調：先算 mid，再把左右兩半的搜尋範圍限制在 opt 兩側 */
static void solve(int l, int r, int optl, int optr) {
    if (l > r) return;
    int mid = (l + r) / 2, bi = optl, hi = mid - 1 < optr ? mid - 1 : optr;
    long long best = -1;
    for (int i = optl; i <= hi; i++) { evals++; long long v = prevd[i] + cost(i, mid); if (best < 0 || v < best) { best = v; bi = i; } }
    cur[mid] = best;
    solve(l, mid - 1, optl, bi);
    solve(mid + 1, r, bi, optr);
}

int main(void) {
    int a[N] = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8}, naive = 0;
    for (int i = 0; i < N; i++) S[i + 1] = S[i] + a[i];
    for (int j = 0; j <= N; j++) prevd[j] = cost(0, j);
    for (int g = 2; g <= K; g++) { solve(1, N, 0, N - 1); for (int j = 1; j <= N; j++) prevd[j] = cur[j]; }
    long long nd[N + 1], nc[N + 1];
    for (int j = 0; j <= N; j++) nd[j] = cost(0, j);
    for (int g = 2; g <= K; g++) {
        for (int j = 1; j <= N; j++) { nc[j] = -1; for (int i = 0; i < j; i++) { naive++; long long v = nd[i] + cost(i, j); if (nc[j] < 0 || v < nc[j]) nc[j] = v; } }
        for (int j = 1; j <= N; j++) nd[j] = nc[j];
    }
    printf("min sum of squares: %lld | naive: %lld\ntransitions evaluated: %d vs %d\n", prevd[N], nd[N], evals, naive);
    return 0;
}
