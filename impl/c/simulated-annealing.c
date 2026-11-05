#include <math.h>
#include <stdio.h>

#define NC 8
static double C[NC][2];
static long long st;
static long long nxt(void) { st = st * 48271 % 2147483647; return st; }

static double length(const int *t) {
    double s = 0;
    for (int i = 0; i < NC; i++) { int a = t[i], b = t[(i + 1) % NC]; s += sqrt((C[a][0] - C[b][0]) * (C[a][0] - C[b][0]) + (C[a][1] - C[b][1]) * (C[a][1] - C[b][1])); }
    return s;
}
static double best_brute;
static void perm(int *a, int k) {
    if (k == NC) { double L = length(a); if (L < best_brute) best_brute = L; return; }
    for (int i = k; i < NC; i++) { int t = a[k]; a[k] = a[i]; a[i] = t; perm(a, k + 1); t = a[k]; a[k] = a[i]; a[i] = t; }
}

/* 2-opt 反轉一段；變短必接受，變長以 e^(−Δ/T) 接受；T 每步乘以冷卻率 */
static void anneal(long long seed, int steps, double cool, double opt) {
    int tour[NC], nt[NC], worse = 0;
    st = seed;
    for (int i = 0; i < NC; i++) tour[i] = i;
    for (int i = NC - 1; i > 0; i--) { int j = (int)(nxt() % (i + 1)), t = tour[i]; tour[i] = tour[j]; tour[j] = t; }
    double cur = length(tour), best = cur, T = 2.0;
    for (int s = 0; s < steps; s++) {
        int i = (int)(nxt() % NC), j = (int)(nxt() % NC);
        if (i > j) { int t = i; i = j; j = t; }
        if (i == j) { T *= cool; continue; }
        for (int k = 0; k < NC; k++) nt[k] = k < i || k > j ? tour[k] : tour[i + j - k];
        double nl = length(nt), d = nl - cur;
        if (fabs(d) < 1e-9) d = 0; /* 長度相同（例如整條路線反轉）時視為 0，避免不同語言的捨入差異 */
        if (d < 0 || nxt() / 2147483647.0 < exp(-d / T)) {
            if (d > 0) worse++;
            for (int k = 0; k < NC; k++) tour[k] = nt[k];
            cur = nl;
            if (cur < best - 1e-12) best = cur;
        }
        T *= cool;
    }
    printf("seed %lld, %d steps, cooling %g: best %.3f, gap %.2f%%, accepted %d worse moves\n", seed, steps, cool, best, 100 * (best - opt) / opt, worse);
}

int main(void) {
    st = 21;
    for (int i = 0; i < NC; i++) { C[i][0] = (nxt() % 1000) / 100.0; C[i][1] = (nxt() % 1000) / 100.0; }
    int a[NC];
    for (int i = 0; i < NC; i++) a[i] = i;
    best_brute = 1e18;
    perm(a, 1);
    printf("8 cities, brute-force optimum %.3f\n", best_brute);
    anneal(7, 2000, 0.997, best_brute);
    anneal(7, 300, 0.99, best_brute);
    anneal(11, 2000, 0.997, best_brute);
    anneal(3, 8000, 0.9995, best_brute);
    return 0;
}
