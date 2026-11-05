#include <algorithm>
#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
const int NC = 8;
double C[NC][2];
long long st;
long long nxt() { return st = st * 48271 % 2147483647; }

double length(const vector<int> &t) {
    double s = 0;
    for (int i = 0; i < NC; i++) { int a = t[i], b = t[(i + 1) % NC]; s += sqrt((C[a][0] - C[b][0]) * (C[a][0] - C[b][0]) + (C[a][1] - C[b][1]) * (C[a][1] - C[b][1])); }
    return s;
}

// 2-opt 反轉一段；變短必接受，變長以 e^(−Δ/T) 接受；T 每步乘以冷卻率
void anneal(long long seed, int steps, double cool, double opt) {
    st = seed;
    vector<int> tour(NC);
    for (int i = 0; i < NC; i++) tour[i] = i;
    for (int i = NC - 1; i > 0; i--) { int j = nxt() % (i + 1); swap(tour[i], tour[j]); }
    double cur = length(tour), best = cur, T = 2.0;
    int worse = 0;
    for (int s = 0; s < steps; s++) {
        int i = nxt() % NC, j = nxt() % NC;
        if (i > j) swap(i, j);
        if (i == j) { T *= cool; continue; }
        vector<int> nt = tour;
        reverse(nt.begin() + i, nt.begin() + j + 1);
        double nl = length(nt), d = nl - cur;
        if (fabs(d) < 1e-9) d = 0; // 長度相同（例如整條路線反轉）時視為 0，避免不同語言的捨入差異
        if (d < 0 || nxt() / 2147483647.0 < exp(-d / T)) {
            if (d > 0) worse++;
            tour = nt;
            cur = nl;
            if (cur < best - 1e-12) best = cur;
        }
        T *= cool;
    }
    printf("seed %lld, %d steps, cooling %g: best %.3f, gap %.2f%%, accepted %d worse moves\n", seed, steps, cool, best, 100 * (best - opt) / opt, worse);
}

int main() {
    st = 21;
    for (int i = 0; i < NC; i++) { C[i][0] = (nxt() % 1000) / 100.0; C[i][1] = (nxt() % 1000) / 100.0; }
    vector<int> p;
    for (int i = 1; i < NC; i++) p.push_back(i);
    double opt = 1e18;
    do {
        vector<int> t = {0};
        t.insert(t.end(), p.begin(), p.end());
        opt = min(opt, length(t));
    } while (next_permutation(p.begin(), p.end()));
    printf("8 cities, brute-force optimum %.3f\n", opt);
    anneal(7, 2000, 0.997, opt);
    anneal(7, 300, 0.99, opt);
    anneal(11, 2000, 0.997, opt);
    anneal(3, 8000, 0.9995, opt);
}
