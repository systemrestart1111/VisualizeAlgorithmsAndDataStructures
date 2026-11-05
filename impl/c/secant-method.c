#include <math.h>
#include <stdio.h>

static double f_cubic(double x) { return x * x * x - 2 * x - 5; }
static double f_cos(double x) { return cos(x) - x; }
static double f_sq(double x) { return x * x - 2; }
static double f_atan(double x) { return atan(x); }

/* x2 = x1 − f(x1)(x1 − x0) / (f(x1) − f(x0))；分母趨近 0 或 |x| 爆增時停止 */
static void secant(const char *name, double (*f)(double), double x0, double x1) {
    printf("%s, x0 = %g, x1 = %g: ", name, x0, x1);
    for (int k = 1; k <= 25; k++) {
        double f0 = f(x0), f1 = f(x1);
        if (fabs(f1 - f0) < 1e-14) { printf("flat secant (f(x0) = f(x1)), stop\n"); return; }
        double x2 = x1 - f1 * (x1 - x0) / (f1 - f0);
        if (!isfinite(x2) || fabs(x2) > 1e6) { printf("diverged after %d steps\n", k); return; }
        if (fabs(x2 - x1) < 1e-12) { printf("root %.10f after %d steps\n", fabs(x2) < 5e-11 ? 0.0 : x2, k); return; }
        x0 = x1; x1 = x2;
    }
    printf("no convergence in 25 steps\n");
}

int main(void) {
    secant("x^3-2x-5", f_cubic, 1, 3);
    secant("cos x - x", f_cos, 0, 1);
    secant("x^2-2", f_sq, 1, 2);
    secant("x^2-2", f_sq, -1, 1);
    secant("atan x", f_atan, 1, 2);
    secant("atan x", f_atan, 3, 5);
    return 0;
}
