#include <math.h>
#include <stdio.h>

static double f_growth(double t, double y) { (void)t; return y; }
static double f_gauss(double t, double y) { return -2 * t * y; }
static double f_linear(double t, double y) { return t - y; }

/* 每步四個斜率：起點、兩個中點、終點，以 1:2:2:1 加權 */
static double rk4(double (*f)(double, double), double y0, double h, double T) {
    double t = 0, y = y0;
    int n = (int)floor(T / h + 0.5);
    for (int k = 0; k < n; k++) {
        double k1 = f(t, y), k2 = f(t + h / 2, y + h * k1 / 2), k3 = f(t + h / 2, y + h * k2 / 2), k4 = f(t + h, y + h * k3);
        y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6;
        t = (k + 1) * h;
    }
    return y;
}
static double euler(double (*f)(double, double), double y0, double h, double T) {
    double t = 0, y = y0;
    int n = (int)floor(T / h + 0.5);
    for (int k = 0; k < n; k++) { y += h * f(t, y); t = (k + 1) * h; }
    return y;
}

int main(void) {
    const char *names[3] = {"y' = y, y(0) = 1", "y' = -2ty, y(0) = 1", "y' = t - y, y(0) = 1"};
    double (*fs[3])(double, double) = {f_growth, f_gauss, f_linear};
    double Ts[3] = {2, 2, 3}, ex[3] = {exp(2.0), exp(-4.0), 3 - 1 + 2 * exp(-3.0)}, hs[3] = {0.5, 0.25, 0.1};
    for (int t = 0; t < 3; t++) {
        for (int k = 0; k < 3; k++) {
            double y = rk4(fs[t], 1.0, hs[k], Ts[t]), ye = euler(fs[t], 1.0, hs[k], Ts[t]);
            printf("%s, h = %g: y(%g) rk4 %.8f (err %.8f), euler %.8f (err %.8f)\n", names[t], hs[k], Ts[t], y, fabs(y - ex[t]), ye, fabs(ye - ex[t]));
        }
        double e1 = fabs(rk4(fs[t], 1.0, 0.2, Ts[t]) - ex[t]), e2 = fabs(rk4(fs[t], 1.0, 0.1, Ts[t]) - ex[t]);
        printf("  halving h from 0.2 to 0.1 shrinks rk4 error by %.1fx\n", e1 / e2);
    }
    return 0;
}
