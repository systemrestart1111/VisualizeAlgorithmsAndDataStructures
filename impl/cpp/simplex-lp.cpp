#include <cmath>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;
typedef vector<double> Vec;

const double EPS = 1e-9;
double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }

struct Con { Vec a; bool ge; double b; };

// 兩階段單純形法，入基／出基都用 Bland 法則（編號最小者）避免退化循環
string simplex(const Vec &c0, const vector<Con> &cons, bool isMin) {
    int n = c0.size(), m = cons.size(), K = 0;
    Vec c(n);
    for (int j = 0; j < n; j++) c[j] = isMin ? -c0[j] : c0[j];
    vector<Vec> a(m);
    Vec b(m);
    vector<int> art(m, -1);
    for (int i = 0; i < m; i++) {
        a[i] = cons[i].a;
        b[i] = cons[i].b;
        if (cons[i].ge) { for (auto &v : a[i]) v = -v; b[i] = -b[i]; }
        if (b[i] < 0) art[i] = K++;
    }
    int N = n + m + K, pivots = 0;
    vector<Vec> T(m, Vec(N + 1, 0));
    vector<int> basis(m);
    for (int i = 0; i < m; i++) {
        double sg = b[i] < 0 ? -1 : 1;
        for (int j = 0; j < n; j++) T[i][j] = sg * a[i][j];
        T[i][n + i] = sg;
        T[i][N] = sg * b[i];
        if (art[i] >= 0) { T[i][n + m + art[i]] = 1; basis[i] = n + m + art[i]; } else basis[i] = n + i;
    }
    auto pivot = [&](int pr, int pc) {
        double pv = T[pr][pc];
        for (auto &v : T[pr]) v /= pv;
        for (size_t i = 0; i < T.size(); i++)
            if ((int)i != pr && fabs(T[i][pc]) > 1e-15) { double f = T[i][pc]; for (int j = 0; j <= N; j++) T[i][j] -= f * T[pr][j]; }
        basis[pr] = pc;
    };
    auto solve = [&](const Vec &cost, int allowed) {
        for (;;) {
            int e = -1;
            for (int j = 0; j < allowed && e < 0; j++) {
                bool inB = false;
                for (int bj : basis) if (bj == j) inB = true;
                if (inB) continue;
                double red = 0;
                for (size_t i = 0; i < T.size(); i++) red += cost[basis[i]] * T[i][j];
                if (red - cost[j] < -EPS) e = j;
            }
            if (e < 0) return true;
            int l = -1;
            double best = INFINITY;
            for (size_t i = 0; i < T.size(); i++)
                if (T[i][e] > EPS) {
                    double q = T[i][N] / T[i][e];
                    if (q < best - 1e-12 || (fabs(q - best) <= 1e-12 && basis[i] < basis[l])) { best = q; l = i; }
                }
            if (l < 0) return false;
            pivot(l, e);
            pivots++;
        }
    };
    if (K) {
        Vec cost1(N, 0);
        for (int j = n + m; j < N; j++) cost1[j] = -1;
        solve(cost1, N);
        double z1 = 0;
        for (size_t i = 0; i < T.size(); i++) z1 += cost1[basis[i]] * T[i][N];
        if (z1 < -1e-7) return "infeasible";
        for (int i = T.size() - 1; i >= 0; i--) {
            if (basis[i] < n + m) continue;
            int j = -1;
            for (int k = 0; k < n + m; k++) if (fabs(T[i][k]) > EPS) { j = k; break; }
            if (j < 0) { T.erase(T.begin() + i); basis.erase(basis.begin() + i); }
            else pivot(i, j);
        }
    }
    Vec cost2(N, 0);
    for (int j = 0; j < n; j++) cost2[j] = c[j];
    if (!solve(cost2, n + m)) return "unbounded";
    Vec x(n, 0);
    for (size_t i = 0; i < T.size(); i++) if (basis[i] < n) x[basis[i]] = T[i][N];
    double zz = 0;
    for (int j = 0; j < n; j++) zz += c0[j] * x[j];
    char buf[64];
    snprintf(buf, sizeof buf, "optimal %s = %.6f at x = (", isMin ? "min" : "max", z(zz));
    string s = buf;
    for (int j = 0; j < n; j++) { snprintf(buf, sizeof buf, j ? ", %.6f" : "%.6f", z(x[j])); s += buf; }
    return s + "), " + to_string(pivots) + " pivots";
}

int main() {
    printf("classic: %s\n", simplex({3, 5}, {{{1, 0}, false, 4}, {{0, 2}, false, 12}, {{3, 2}, false, 18}}, false).c_str());
    printf("unbounded: %s\n", simplex({1, 1}, {{{1, -1}, false, 2}, {{-1, 1}, false, 3}}, false).c_str());
    printf("infeasible: %s\n", simplex({1, 1}, {{{1, 1}, false, 2}, {{1, 1}, true, 5}}, false).c_str());
    printf("min with >=: %s\n", simplex({2, 3}, {{{1, 1}, true, 4}, {{1, 3}, true, 6}, {{1, 0}, false, 5}}, true).c_str());
    printf("degenerate: %s\n", simplex({2, 1}, {{{1, 1}, false, 4}, {{1, 0}, false, 2}, {{2, 1}, false, 6}}, false).c_str());
    printf("Beale cycling: %s\n", simplex({0.75, -20, 0.5, -6}, {{{0.25, -8, -1, 9}, false, 0}, {{0.5, -12, -0.5, 3}, false, 0}, {{0, 0, 1, 0}, false, 1}}, false).c_str());
}
