#include <math.h>
#include <stdio.h>

static double f(int k, double x, double y) { return k == 0 ? 0.1 * x * x + 2 * y * y : (1 - x) * (1 - x) + 10 * (y - x * x) * (y - x * x); }
static void grad(int k, double x, double y, double *g) {
    if (k == 0) { g[0] = 0.2 * x; g[1] = 4 * y; }
    else { g[0] = -2 * (1 - x) - 40 * x * (y - x * x); g[1] = 20 * (y - x * x); }
}

int main(void) {
    const char *names[2] = {"ellipse", "rosenbrock"};
    double starts[2][2] = {{-4.0, 1.5}, {-1.5, 2.0}}, lrs[2] = {0.1, 0.03};
    for (int k = 0; k < 2; k++)
        for (int li = 0; li < 2; li++) {
            /* m、v 為梯度與梯度平方的移動平均；偏差修正後 θ −= η·m̂ / (√v̂ + ε)（ε 在根號外） */
            double lr = lrs[li], b1 = 0.9, b2 = 0.999, eps = 1e-8, th[2] = {starts[k][0], starts[k][1]}, m[2] = {0, 0}, v[2] = {0, 0}, g[2];
            double fg = 0, fmh = 0, fvh = 0, fstep = 0;
            for (int t = 1; t <= 150; t++) {
                grad(k, th[0], th[1], g);
                for (int i = 0; i < 2; i++) {
                    m[i] = b1 * m[i] + (1 - b1) * g[i];
                    v[i] = b2 * v[i] + (1 - b2) * g[i] * g[i];
                    double mh = m[i] / (1 - pow(b1, t)), vh = v[i] / (1 - pow(b2, t)), step = lr * mh / (sqrt(vh) + eps);
                    if (t == 1 && i == 0) { fg = g[0]; fmh = mh; fvh = vh; fstep = step; }
                    th[i] -= step;
                }
            }
            printf("%s, lr %g: first step g = %.4f, m_hat = %.4f, v_hat = %.4f, step = %.4f; after 150 steps theta = (%.4f, %.4f), f = %.6f\n", names[k], lr, fg, fmh, fvh, fstep, th[0], th[1], f(k, th[0], th[1]));
            double p[2] = {starts[k][0], starts[k][1]};
            int div = 0;
            for (int t = 0; t < 150; t++) {
                grad(k, p[0], p[1], g);
                p[0] -= lr * g[0]; p[1] -= lr * g[1];
                if (fabs(p[0]) > 1e6 || fabs(p[1]) > 1e6) { div = 1; break; }
            }
            if (div) printf("  plain gradient descent: diverged\n");
            else printf("  plain gradient descent: theta = (%.4f, %.4f), f = %.6f\n", p[0], p[1], f(k, p[0], p[1]));
        }
    return 0;
}
