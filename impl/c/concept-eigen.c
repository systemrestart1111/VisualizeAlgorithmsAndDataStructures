#include <math.h>
#include <stdio.h>

/* 2×2 矩陣的特徵值：λ² − tr·λ + det = 0 */
int main(void) {
    double Ms[3][4] = {{2, 1, 1, 2}, {4, 1, 2, 3}, {0, -1, 1, 0}};
    for (int t = 0; t < 3; t++) {
        double a = Ms[t][0], b = Ms[t][1], c = Ms[t][2], d = Ms[t][3];
        printf("A = [[%g, %g], [%g, %g]]\n", a, b, c, d);
        double tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det;
        if (disc < 0) { printf("  no real eigenvalues\n"); continue; }
        for (int s = 0; s < 2; s++) {
            double lam = (tr + (s ? -1 : 1) * sqrt(disc)) / 2, x, y;
            if (b != 0) { x = b; y = lam - a; }
            else if (c != 0) { x = lam - d; y = c; }
            else if (a == lam) { x = 1; y = 0; }
            else { x = 0; y = 1; }
            double n = hypot(x, y);
            x /= n; y /= n;
            double ax = a * x + b * y, ay = c * x + d * y;
            printf("  lambda = %.4f  v = (%.4f, %.4f)  Av = (%.4f, %.4f)  ok = %s\n", lam, x, y, ax, ay, fabs(ax - lam * x) < 1e-9 && fabs(ay - lam * y) < 1e-9 ? "True" : "False");
        }
    }
    return 0;
}
