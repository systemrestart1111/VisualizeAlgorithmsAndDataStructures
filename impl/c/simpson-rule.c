#include <math.h>
#include <stdio.h>

static double f_sin(double x) { return sin(x); }
static double f_pi(double x) { return 4 / (1 + x * x); }
static double f_cubic(double x) { return x * x * x - 2 * x + 1; }
static double f_sqrt(double x) { return sqrt(x); }

/* 係數 1, 4, 2, 4, …, 2, 4, 1 乘 h/3；n 必須是偶數（奇數回傳 NAN） */
static double simpson(double (*f)(double), double a, double b, int n) {
    if (n % 2) return NAN;
    double h = (b - a) / n, s = f(a) + f(b);
    for (int i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h);
    return s * h / 3;
}
static double trapezoid(double (*f)(double), double a, double b, int n) {
    double h = (b - a) / n, s = 0;
    for (int i = 1; i < n; i++) s += f(a + i * h);
    return (f(a) + f(b)) / 2 * h + s * h;
}

int main(void) {
    const double PI = 3.14159265358979323846;
    const char *names[4] = {"sin x on [0, pi]", "4/(1+x^2) on [0, 1]", "x^3-2x+1 on [0, 2]", "sqrt x on [0, 1]"};
    double (*fs[4])(double) = {f_sin, f_pi, f_cubic, f_sqrt};
    double as[4] = {0, 0, 0, 0}, bs[4] = {PI, 1, 2, 1}, ex[4] = {2.0, PI, 2.0, 2.0 / 3};
    int ns[4] = {2, 6, 12, 24};
    for (int t = 0; t < 4; t++)
        for (int k = 0; k < 4; k++) {
            double s = simpson(fs[t], as[t], bs[t], ns[k]);
            printf("%s, n = %d: simpson %.10f (err %.10f), trapezoid err %.10f\n", names[t], ns[k], s, fabs(s - ex[t]), fabs(trapezoid(fs[t], as[t], bs[t], ns[k]) - ex[t]));
        }
    printf("n = 5: %s\n", isnan(simpson(f_sin, 0, 1, 5)) ? "n must be even" : "ok");
    return 0;
}
