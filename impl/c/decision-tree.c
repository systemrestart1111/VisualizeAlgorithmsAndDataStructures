#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static double X[30][2];
static int Y[30], K;

static void data(const char *kind) {
    long long s = 3;
    K = 0;
    for (int i = 0; i < 30; i++) {
        s = s * 48271 % 2147483647; double x = (s % 1000) / 100.0;
        s = s * 48271 % 2147483647; double y = (s % 1000) / 100.0;
        X[i][0] = x; X[i][1] = y;
        if (!strcmp(kind, "xor")) Y[i] = (x < 5) != (y < 5);
        else if (!strcmp(kind, "diag")) Y[i] = x + y > 10;
        else Y[i] = x > 6 ? 2 : y > 5 ? 1 : 0;
        if (Y[i] + 1 > K) K = Y[i] + 1;
    }
}
static double gini(const int *idx, int n) {
    if (!n) return 0;
    int c[3] = {0};
    for (int i = 0; i < n; i++) c[Y[idx[i]]]++;
    double s = 1;
    for (int k = 0; k < K; k++) s -= ((double)c[k] / n) * ((double)c[k] / n);
    return s;
}
static int majority(const int *idx, int n) {
    int c[3] = {0}, best = 0;
    for (int i = 0; i < n; i++) c[Y[idx[i]]]++;
    for (int k = 1; k < K; k++) if (c[k] > c[best]) best = k;
    return best;
}
static int cmpd(const void *a, const void *b) { double x = *(const double *)a, y = *(const double *)b; return x < y ? -1 : x > y; }

/* Gini 最低的切分；停止：純淨、達深度上限或樣本 < 2；平手取特徵小、門檻小 */
static void build(const int *idx, int n, int depth, int max_depth, int indent) {
    double g = gini(idx, n);
    if (g < 1e-12 || depth >= max_depth || n < 2) { printf("  %*sleaf class %d (n=%d)\n", indent, "", majority(idx, n), n); return; }
    int bestf = -1;
    double bests = 0, bestt = 0;
    for (int f = 0; f < 2; f++) {
        double vals[30];
        int nvl = 0;
        for (int i = 0; i < n; i++) { int dup = 0; for (int j = 0; j < nvl; j++) if (vals[j] == X[idx[i]][f]) dup = 1; if (!dup) vals[nvl++] = X[idx[i]][f]; }
        qsort(vals, nvl, sizeof(double), cmpd);
        for (int k = 0; k + 1 < nvl; k++) {
            double t = (vals[k] + vals[k + 1]) / 2;
            int L[30], R[30], nl = 0, nr = 0;
            for (int i = 0; i < n; i++) { if (X[idx[i]][f] <= t) L[nl++] = idx[i]; else R[nr++] = idx[i]; }
            double s = (double)nl / n * gini(L, nl) + (double)nr / n * gini(R, nr);
            if (bestf < 0 || s < bests - 1e-12) { bestf = f; bests = s; bestt = t; }
        }
    }
    if (bestf < 0) { printf("  %*sleaf class %d (n=%d)\n", indent, "", majority(idx, n), n); return; }
    int L[30], R[30], nl = 0, nr = 0;
    for (int i = 0; i < n; i++) { if (X[idx[i]][bestf] <= bestt) L[nl++] = idx[i]; else R[nr++] = idx[i]; }
    printf("  %*sx%d <= %.3f (n=%d, gini %.3f -> %.3f)\n", indent, "", bestf + 1, bestt, n, g, bests);
    build(L, nl, depth + 1, max_depth, indent + 2);
    build(R, nr, depth + 1, max_depth, indent + 2);
}

int main(void) {
    const char *kinds[4] = {"blocks", "xor", "xor", "diag"};
    int depths[4] = {2, 2, 3, 3};
    for (int t = 0; t < 4; t++) {
        data(kinds[t]);
        int idx[30];
        for (int i = 0; i < 30; i++) idx[i] = i;
        printf("%s, max depth %d:\n", kinds[t], depths[t]);
        build(idx, 30, 0, depths[t], 0);
    }
    return 0;
}
