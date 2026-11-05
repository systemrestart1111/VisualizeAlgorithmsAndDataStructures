#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;

double z(double v) { return fabs(v) < 5e-7 ? 0.0 : v; }

// x ← Ax / ‖Ax‖；Rayleigh 商 xᵀAx 估計主特徵值；方向不再改變（含正負號翻轉）即收斂。回傳步數，0 為不收斂
int powerIteration(const vector<vector<double>> &A, vector<double> &x, double &lam) {
    int n = A.size();
    double nx = 0;
    for (double v : x) nx += v * v;
    nx = sqrt(nx);
    for (double &v : x) v /= nx;
    for (int k = 1; k <= 60; k++) {
        vector<double> y(n, 0);
        double ny = 0, l = 0, dm = 0, dp = 0;
        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) y[i] += A[i][j] * x[j];
        for (int i = 0; i < n; i++) l += x[i] * y[i];
        for (int i = 0; i < n; i++) ny += y[i] * y[i];
        ny = sqrt(ny);
        for (int i = 0; i < n; i++) { double v = y[i] / ny; dm += (v - x[i]) * (v - x[i]); dp += (v + x[i]) * (v + x[i]); x[i] = v; }
        lam = l;
        if (fmin(sqrt(dm), sqrt(dp)) < 1e-10) return k;
    }
    return 0;
}

int main() {
    vector<pair<vector<vector<double>>, vector<double>>> tests = {
        {{{2, 1}, {1, 3}}, {1, 0}}, {{{2, 0, 0}, {0, 1, 0}, {0, 0, 3}}, {1, 1, 1}}, {{{4, 1}, {2, 3}}, {1, 1}}, {{{0, 1}, {1, 0}}, {1, 0}}};
    for (auto &t : tests) {
        vector<double> x = t.second;
        double lam;
        int k = powerIteration(t.first, x, lam);
        if (!k) { printf("no convergence in 60 steps (|lambda1| = |lambda2|?)\n"); continue; }
        printf("lambda = %.6f, x = (", z(lam));
        for (size_t i = 0; i < x.size(); i++) printf(i ? ", %.6f" : "%.6f", z(x[i]));
        printf("), steps %d\n", k);
    }
}
