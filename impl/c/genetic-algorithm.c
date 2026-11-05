#include <stdio.h>
#include <string.h>

#define NI 12
#define POP 16
#define CAP 25
static int W[NI] = {12, 2, 1, 4, 1, 6, 3, 5, 9, 7, 8, 2}, V[NI] = {4, 2, 1, 10, 2, 7, 5, 8, 9, 6, 11, 3};
static int byRatio[NI], pop[POP][NI];
static long long st;
static long long nxt(void) { st = st * 48271 % 2147483647; return st; }
static int weight(const int *c) { int s = 0; for (int i = 0; i < NI; i++) s += c[i] * W[i]; return s; }
static int value(const int *c) { int s = 0; for (int i = 0; i < NI; i++) s += c[i] * V[i]; return s; }
/* 超重時依價值重量比由差到好拿掉物品，保持可行 */
static void repair(int *c) { for (int k = 0; k < NI && weight(c) > CAP; k++) c[byRatio[k]] = 0; }
static int best_of(void) { int b = 0; for (int i = 1; i < POP; i++) if (value(pop[i]) > value(pop[b])) b = i; return b; }
static int tour(void) { int b = (int)(nxt() % POP); for (int k = 0; k < 2; k++) { int c = (int)(nxt() % POP); if (value(pop[c]) > value(pop[b])) b = c; } return b; }

/* 錦標賽選擇（3 取 1）、單點交配、位元突變、菁英保留 */
static void genetic(long long seed, int gens, double pm) {
    int next[POP][NI];
    st = seed;
    for (int p = 0; p < POP; p++) { for (int i = 0; i < NI; i++) pop[p][i] = (int)(nxt() % 2); repair(pop[p]); }
    for (int g = 0; g < gens; g++) {
        memcpy(next[0], pop[best_of()], sizeof next[0]);
        for (int k = 1; k < POP; k++) {
            int a = tour(), b = tour(), cut = 1 + (int)(nxt() % (NI - 1));
            for (int i = 0; i < NI; i++) {
                int bit = i < cut ? pop[a][i] : pop[b][i];
                next[k][i] = nxt() / 2147483647.0 < pm ? 1 - bit : bit;
            }
            repair(next[k]);
        }
        memcpy(pop, next, sizeof pop);
    }
    int b = best_of();
    printf("seed %lld, %d generations, mutation %g: best ", seed, gens, pm);
    for (int i = 0; i < NI; i++) printf("%d", pop[b][i]);
    printf(", weight %d, value %d\n", weight(pop[b]), value(pop[b]));
}

int main(void) {
    for (int i = 0; i < NI; i++) byRatio[i] = i;
    for (int i = 1; i < NI; i++)
        for (int j = i; j > 0; j--) {
            double r1 = (double)V[byRatio[j - 1]] / W[byRatio[j - 1]], r2 = (double)V[byRatio[j]] / W[byRatio[j]];
            if (r1 > r2 || (r1 == r2 && byRatio[j - 1] > byRatio[j])) { int t = byRatio[j]; byRatio[j] = byRatio[j - 1]; byRatio[j - 1] = t; } else break;
        }
    int dp[CAP + 1] = {0};
    for (int k = 0; k < NI; k++) for (int c = CAP; c >= W[k]; c--) if (dp[c - W[k]] + V[k] > dp[c]) dp[c] = dp[c - W[k]] + V[k];
    printf("dynamic programming optimum: %d\n", dp[CAP]);
    genetic(4, 30, 0.05);
    genetic(4, 80, 0.05);
    genetic(9, 30, 0.01);
    genetic(2, 30, 0.2);
    return 0;
}
