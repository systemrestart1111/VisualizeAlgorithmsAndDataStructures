#include <math.h>
#include <stdio.h>

static double P0[10][2] = {{2.0, 1.6}, {3.1, 2.4}, {4.2, 2.6}, {5.0, 3.5}, {5.9, 3.7}, {6.8, 4.6}, {7.7, 4.4}, {8.9, 5.6}, {4.6, 3.6}, {6.1, 3.0}};

/* 中心化（可選標準化）→ 共變異數矩陣 → 2×2 對稱矩陣的特徵分解 */
static void pca(const char *name, double scale, int standardize) {
    int n = 10;
    double X[10][2], mx = 0, my = 0;
    for (int i = 0; i < n; i++) { mx += P0[i][0] * scale; my += P0[i][1]; }
    mx /= n; my /= n;
    for (int i = 0; i < n; i++) { X[i][0] = P0[i][0] * scale - mx; X[i][1] = P0[i][1] - my; }
    if (standardize) {
        double sx = 0, sy = 0;
        for (int i = 0; i < n; i++) { sx += X[i][0] * X[i][0]; sy += X[i][1] * X[i][1]; }
        sx = sqrt(sx / (n - 1)); sy = sqrt(sy / (n - 1));
        for (int i = 0; i < n; i++) { X[i][0] /= sx; X[i][1] /= sy; }
    }
    double a = 0, b = 0, c = 0;
    for (int i = 0; i < n; i++) { a += X[i][0] * X[i][0]; b += X[i][0] * X[i][1]; c += X[i][1] * X[i][1]; }
    a /= n - 1; b /= n - 1; c /= n - 1;
    double tr = a + c, det = a * c - b * b, disc = sqrt(fmax(0.0, (tr / 2) * (tr / 2) - det));
    double l1 = tr / 2 + disc, l2 = tr / 2 - disc, v0, v1;
    if (fabs(b) > 1e-12) { v0 = l1 - c; v1 = b; } else if (a >= c) { v0 = 1; v1 = 0; } else { v0 = 0; v1 = 1; }
    double nv = hypot(v0, v1);
    v0 /= nv; v1 /= nv;
    if (v0 < 0) { v0 = -v0; v1 = -v1; }
    printf("%s, %s: cov [%.3f %.3f; %.3f %.3f], eigenvalues %.3f %.3f (sum %.3f = trace %.3f), PC1 (%.3f, %.3f) explains %.2f%%, first projections %.3f %.3f\n",
           name, standardize ? "standardized" : "centered", a, b, b, c, l1, l2, l1 + l2, a + c, v0, v1, 100 * l1 / (l1 + l2), X[0][0] * v0 + X[0][1] * v1, X[1][0] * v0 + X[1][1] * v1);
}

int main(void) {
    pca("original", 1, 0);
    pca("original", 1, 1);
    pca("x scaled by 10", 10, 0);
    pca("x scaled by 10", 10, 1);
    return 0;
}
