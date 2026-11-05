#include <stdio.h>

static long long st;
static long long nxt(void) { st = st * 48271 % 2147483647; return st; }

/* Vose 別名法：縮放成平均 1，矮欄用高欄補滿，每欄最多兩個選項；回傳 0 成功 */
static int build(const double *W, int n, double *prob, int *alias) {
    double total = 0, p[16];
    int small[16], large[16], ns = 0, nl = 0;
    for (int i = 0; i < n; i++) { if (W[i] < 0) return 1; total += W[i]; }
    if (total <= 0) return 2;
    for (int i = 0; i < n; i++) { p[i] = W[i] / total * n; prob[i] = 0; alias[i] = -1; if (p[i] < 1) small[ns++] = i; else large[nl++] = i; }
    while (ns && nl) {
        int s = small[--ns], l = large[--nl];
        prob[s] = p[s]; alias[s] = l;
        p[l] -= 1 - p[s];
        if (p[l] < 1) small[ns++] = l; else large[nl++] = l;
    }
    for (int k = 0; k < ns; k++) { prob[small[k]] = 1; alias[small[k]] = small[k]; }
    for (int k = 0; k < nl; k++) { prob[large[k]] = 1; alias[large[k]] = large[k]; }
    return 0;
}

static void run(const double *W, int n) {
    double prob[16], total = 0, chi = 0;
    int alias[16], cnt[16] = {0}, N = 10000;
    build(W, n, prob, alias);
    st = 7;
    /* 隨機選一欄，再擲硬幣決定取本身或別名：O(1) */
    for (int k = 0; k < N; k++) { int i = (int)(nxt() % n); cnt[nxt() / 2147483647.0 < prob[i] ? i : alias[i]]++; }
    for (int i = 0; i < n; i++) total += W[i];
    for (int i = 0; i < n; i++) if (W[i] > 0) { double e = W[i] / total * N; chi += (cnt[i] - e) * (cnt[i] - e) / e; }
    printf("weights [");
    for (int i = 0; i < n; i++) printf(i ? ", %g" : "%g", W[i]);
    printf("]: prob");
    for (int i = 0; i < n; i++) printf(" %.4f", prob[i]);
    printf(", alias");
    for (int i = 0; i < n; i++) printf(" %d", alias[i]);
    printf(", counts");
    for (int i = 0; i < n; i++) printf(" %d", cnt[i]);
    printf(", chi-square %.3f\n", chi);
}

int main(void) {
    double w1[] = {5, 1, 3, 1, 8, 2}, w2[] = {0, 3, 0, 1}, w3[] = {1, 1, 1, 1}, w4[] = {7}, w5[] = {1, -1}, w6[] = {0, 0}, prob[4];
    int alias[4];
    run(w1, 6);
    run(w2, 4);
    run(w3, 4);
    run(w4, 1);
    printf("weights [1, -1]: %s\n", build(w5, 2, prob, alias) == 1 ? "weights must be non-negative" : "?");
    printf("weights [0, 0]: %s\n", build(w6, 2, prob, alias) == 2 ? "total weight must be positive" : "?");
    return 0;
}
