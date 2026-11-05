#include <cmath>
#include <cstdio>

// 2×2 矩陣的特徵值：λ² − tr·λ + det = 0
int main() {
    double Ms[3][4] = {{2, 1, 1, 2}, {4, 1, 2, 3}, {0, -1, 1, 0}};
    for (auto &M : Ms) {
        double a = M[0], b = M[1], c = M[2], d = M[3];
        std::printf("A = [[%g, %g], [%g, %g]]\n", a, b, c, d);
        double tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det;
        if (disc < 0) { std::printf("  no real eigenvalues\n"); continue; }
        for (int s = 0; s < 2; s++) {
            double lam = (tr + (s ? -1 : 1) * std::sqrt(disc)) / 2, x, y;
            if (b != 0) { x = b; y = lam - a; }
            else if (c != 0) { x = lam - d; y = c; }
            else if (a == lam) { x = 1; y = 0; }
            else { x = 0; y = 1; }
            double n = std::hypot(x, y);
            x /= n; y /= n;
            double ax = a * x + b * y, ay = c * x + d * y;
            std::printf("  lambda = %.4f  v = (%.4f, %.4f)  Av = (%.4f, %.4f)  ok = %s\n", lam, x, y, ax, ay, std::fabs(ax - lam * x) < 1e-9 && std::fabs(ay - lam * y) < 1e-9 ? "True" : "False");
        }
    }
}
