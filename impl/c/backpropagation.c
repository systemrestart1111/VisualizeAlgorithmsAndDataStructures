#include <math.h>
#include <stdio.h>

static int XOR[4][3] = {{0, 0, 0}, {0, 1, 1}, {1, 0, 1}, {1, 1, 0}};
static double sg(double z) { return 1 / (1 + exp(-z)); }
/* 2-2-1 網路：參數 W1(4) b1(2) w2(2) b2(1) */
static double forward(const double *t, int a, int b, double *h) {
    h[0] = sg(t[0] * a + t[1] * b + t[4]);
    h[1] = sg(t[2] * a + t[3] * b + t[5]);
    return sg(t[6] * h[0] + t[7] * h[1] + t[8]);
}
static double loss(const double *t) { double s = 0, h[2]; for (int k = 0; k < 4; k++) { double o = forward(t, XOR[k][0], XOR[k][1], h); s += 0.5 * (o - XOR[k][2]) * (o - XOR[k][2]); } return s; }
/* 連鎖律由輸出往回：δ₂ = (ŷ − y)ŷ(1 − ŷ)，δ₁ = w₂δ₂ ⊙ h(1 − h) */
static void grad(const double *t, double *G) {
    for (int i = 0; i < 9; i++) G[i] = 0;
    for (int k = 0; k < 4; k++) {
        int a = XOR[k][0], b = XOR[k][1];
        double h[2], o = forward(t, a, b, h);
        double d2 = (o - XOR[k][2]) * o * (1 - o);
        G[6] += d2 * h[0]; G[7] += d2 * h[1]; G[8] += d2;
        double d10 = t[6] * d2 * h[0] * (1 - h[0]), d11 = t[7] * d2 * h[1] * (1 - h[1]);
        G[0] += d10 * a; G[1] += d10 * b; G[2] += d11 * a; G[3] += d11 * b; G[4] += d10; G[5] += d11;
    }
}

int main(void) {
    long long seeds[3] = {3, 1, 3};
    double lrs[3] = {2.0, 2.0, 0.5};
    for (int r = 0; r < 3; r++) {
        long long s = seeds[r];
        double t[9], G[9], eps = 1e-5, maxrel = 0;
        for (int i = 0; i < 9; i++) { s = s * 48271 % 2147483647; t[i] = (s / 2147483647.0 - 0.5) * 2; }
        grad(t, G);
        for (int i = 0; i < 9; i++) {
            double p[9], m[9];
            for (int j = 0; j < 9; j++) { p[j] = t[j]; m[j] = t[j]; }
            p[i] += eps; m[i] -= eps;
            double num = (loss(p) - loss(m)) / (2 * eps), rel = fabs(G[i] - num) / fmax(1e-12, fabs(G[i]) + fabs(num));
            if (rel > maxrel) maxrel = rel;
        }
        printf("seed %lld: initial loss %.6f, gradient check max relative error < 1e-6: %s\n", seeds[r], loss(t), maxrel < 1e-6 ? "True" : "False");
        for (int ep = 0; ep < 2000; ep++) { grad(t, G); for (int i = 0; i < 9; i++) t[i] -= lrs[r] * G[i]; }
        double h[2];
        int ok = 1;
        printf("  lr %.1f, 2000 epochs: loss %.6f, predictions", lrs[r], loss(t));
        for (int k = 0; k < 4; k++) { double o = forward(t, XOR[k][0], XOR[k][1], h); printf(" %.3f", o); if ((o >= 0.5) != (XOR[k][2] == 1)) ok = 0; }
        printf(", all correct %s\n", ok ? "True" : "False");
    }
    return 0;
}
