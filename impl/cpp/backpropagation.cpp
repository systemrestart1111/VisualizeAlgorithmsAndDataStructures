#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
typedef vector<double> Vec;
int XOR[4][3] = {{0, 0, 0}, {0, 1, 1}, {1, 0, 1}, {1, 1, 0}};

double sg(double z) { return 1 / (1 + exp(-z)); }
// 2-2-1 網路：參數 W1(4) b1(2) w2(2) b2(1)
double forward(const Vec &t, int a, int b, double *h) {
    h[0] = sg(t[0] * a + t[1] * b + t[4]);
    h[1] = sg(t[2] * a + t[3] * b + t[5]);
    return sg(t[6] * h[0] + t[7] * h[1] + t[8]);
}
double loss(const Vec &t) { double s = 0, h[2]; for (auto &x : XOR) { double o = forward(t, x[0], x[1], h); s += 0.5 * (o - x[2]) * (o - x[2]); } return s; }
// 連鎖律由輸出往回：δ₂ = (ŷ − y)ŷ(1 − ŷ)，δ₁ = w₂δ₂ ⊙ h(1 − h)
Vec grad(const Vec &t) {
    Vec G(9, 0);
    for (auto &x : XOR) {
        double h[2], o = forward(t, x[0], x[1], h);
        double d2 = (o - x[2]) * o * (1 - o);
        G[6] += d2 * h[0]; G[7] += d2 * h[1]; G[8] += d2;
        double d10 = t[6] * d2 * h[0] * (1 - h[0]), d11 = t[7] * d2 * h[1] * (1 - h[1]);
        G[0] += d10 * x[0]; G[1] += d10 * x[1]; G[2] += d11 * x[0]; G[3] += d11 * x[1]; G[4] += d10; G[5] += d11;
    }
    return G;
}

int main() {
    long long seeds[3] = {3, 1, 3};
    double lrs[3] = {2.0, 2.0, 0.5};
    for (int r = 0; r < 3; r++) {
        long long s = seeds[r];
        Vec t(9);
        for (auto &v : t) { s = s * 48271 % 2147483647; v = (s / 2147483647.0 - 0.5) * 2; }
        Vec G = grad(t);
        double eps = 1e-5, maxrel = 0;
        for (int i = 0; i < 9; i++) {
            Vec p = t, m = t;
            p[i] += eps; m[i] -= eps;
            double num = (loss(p) - loss(m)) / (2 * eps);
            maxrel = fmax(maxrel, fabs(G[i] - num) / fmax(1e-12, fabs(G[i]) + fabs(num)));
        }
        printf("seed %lld: initial loss %.6f, gradient check max relative error < 1e-6: %s\n", seeds[r], loss(t), maxrel < 1e-6 ? "True" : "False");
        for (int ep = 0; ep < 2000; ep++) { Vec gr = grad(t); for (int i = 0; i < 9; i++) t[i] -= lrs[r] * gr[i]; }
        double h[2];
        bool ok = true;
        printf("  lr %.1f, 2000 epochs: loss %.6f, predictions", lrs[r], loss(t));
        for (auto &x : XOR) { double o = forward(t, x[0], x[1], h); printf(" %.3f", o); if ((o >= 0.5) != (x[2] == 1)) ok = false; }
        printf(", all correct %s\n", ok ? "True" : "False");
    }
}
