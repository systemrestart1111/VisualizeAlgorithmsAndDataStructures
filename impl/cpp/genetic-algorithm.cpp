#include <algorithm>
#include <cstdio>
#include <vector>
using namespace std;
typedef vector<int> Chrom;
const int NI = 12, POP = 16, CAP = 25;
int W[NI] = {12, 2, 1, 4, 1, 6, 3, 5, 9, 7, 8, 2}, V[NI] = {4, 2, 1, 10, 2, 7, 5, 8, 9, 6, 11, 3};
vector<int> byRatio;
long long st;
long long nxt() { return st = st * 48271 % 2147483647; }
int weight(const Chrom &c) { int s = 0; for (int i = 0; i < NI; i++) s += c[i] * W[i]; return s; }
int value(const Chrom &c) { int s = 0; for (int i = 0; i < NI; i++) s += c[i] * V[i]; return s; }
// 超重時依價值重量比由差到好拿掉物品，保持可行
void repair(Chrom &c) { for (int i : byRatio) { if (weight(c) <= CAP) break; c[i] = 0; } }
const Chrom &bestOf(const vector<Chrom> &pop) { int b = 0; for (int i = 1; i < POP; i++) if (value(pop[i]) > value(pop[b])) b = i; return pop[b]; }

// 錦標賽選擇（3 取 1）、單點交配、位元突變、菁英保留
void genetic(long long seed, int gens, double pm) {
    st = seed;
    vector<Chrom> pop(POP, Chrom(NI));
    for (auto &c : pop) { for (int &b : c) b = nxt() % 2; repair(c); }
    auto tour = [&]() -> const Chrom & { int b = nxt() % POP; for (int k = 0; k < 2; k++) { int c = nxt() % POP; if (value(pop[c]) > value(pop[b])) b = c; } return pop[b]; };
    for (int g = 0; g < gens; g++) {
        vector<Chrom> next = {bestOf(pop)};
        while ((int)next.size() < POP) {
            Chrom a = tour(), b = tour(), child(NI);
            int cut = 1 + nxt() % (NI - 1);
            for (int i = 0; i < NI; i++) { int bit = i < cut ? a[i] : b[i]; child[i] = nxt() / 2147483647.0 < pm ? 1 - bit : bit; }
            repair(child);
            next.push_back(child);
        }
        pop = next;
    }
    const Chrom &best = bestOf(pop);
    printf("seed %lld, %d generations, mutation %g: best ", seed, gens, pm);
    for (int b : best) printf("%d", b);
    printf(", weight %d, value %d\n", weight(best), value(best));
}

int main() {
    for (int i = 0; i < NI; i++) byRatio.push_back(i);
    stable_sort(byRatio.begin(), byRatio.end(), [](int a, int b) { return (double)V[a] / W[a] < (double)V[b] / W[b]; });
    vector<int> dp(CAP + 1, 0);
    for (int k = 0; k < NI; k++) for (int c = CAP; c >= W[k]; c--) dp[c] = max(dp[c], dp[c - W[k]] + V[k]);
    printf("dynamic programming optimum: %d\n", dp[CAP]);
    genetic(4, 30, 0.05);
    genetic(4, 80, 0.05);
    genetic(9, 30, 0.01);
    genetic(2, 30, 0.2);
}
